function queueAction(action) {
  return async function (req, res) {
    const { queues: queueList } = req.body;
    const { Queues } = req.app.locals;

    try {
      for (let { name, host } of queueList) {
        const queue = await Queues.get(name, host);
        const jobs = await queue.getJobs('failed');
        var actionPromises = jobs.map(job => job[action]());
      }

      await Promise.all(actionPromises);

      return res.sendStatus(200);
    } catch (e) {
      const body = {
        error: 'queue error',
        details: e.stack
      };
      return res.status(500).send(body);
    }
  }
}

module.exports = queueAction;