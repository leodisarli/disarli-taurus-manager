async function handler(req, res) {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const { Queues } = req.app.locals;
  const queues = Queues.list();
  const basePath = req.baseUrl;

  for (const queue of queues) {
    const queueDetails = await Queues.get(queue.name, queue.hostId);
    queue.jobCounts = await queueDetails.getJobCounts();

    const metaPaused = await queueDetails.client.get(
      `bull:${queue.name}:meta-paused`
    );

    queue.isPaused = metaPaused == '1';
  }

  return res.render('dashboard/templates/queueList', { basePath, queues });
}

module.exports = handler;
