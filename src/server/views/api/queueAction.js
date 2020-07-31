function queueAction(action) {
  return async function handler(req, res) {
    switch (action) {
      case 'retry':
        return retry(req, res);
      case 'pause':
        return pause(req, res);
      case 'resume':
        return resume(req, res);
      default:
        return res.status(404);
    }
  }

  async function retry(req, res) {
    const { queues: queueList } = req.body;
    const { Queues } = req.app.locals;

    try {
      for (let { name, host } of queueList) {
        const queue = await Queues.get(name, host);
        const jobs = await queue.getJobs('failed');
        var actionPromises = jobs.map(job => job['retry']());
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

  async function pause(req, res) {
    const { queues: queueList } = req.body;
    const { Queues } = req.app.locals;

    try {
      for (let { name, host } of queueList) {
        const queue = await Queues.get(name, host);
        await queue.pause();
      }

      return res.sendStatus(200);
    } catch (e) {
      const body = {
        error: 'queue error',
        details: e.stack
      };
      return res.status(500).send(body);
    }
  }

  async function resume(req, res) {
    const { queues: queueList } = req.body;
    const { Queues } = req.app.locals;

    try {
      for (let { name, host } of queueList) {
        const queue = await Queues.get(name, host);
        await queue.resume();
      }

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