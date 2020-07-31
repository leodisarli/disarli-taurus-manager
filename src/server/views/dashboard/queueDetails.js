const QueueHelpers = require('../helpers/queueHelpers');

async function handler(req, res) {
  if (!req.session.loggedin) {
    res.redirect('/');
    return;
  }
  const {queueName, queueHost} = req.params;
  const {Queues} = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  const basePath = req.baseUrl;
  if (!queue) return res.status(404).render('dashboard/templates/queueNotFound', {basePath, queueName, queueHost});

  let jobCounts;
  jobCounts = await queue.getJobCounts();
  const stats = await QueueHelpers.getStats(queue);

  const paused = jobCounts.paused;
  
  jobCounts = Object.keys(jobCounts)
    .filter(key => key != 'paused')
    .reduce((obj, key) => {
      obj[key] = jobCounts[key]
      return obj;
    }, {});

  return res.render('dashboard/templates/queueDetails', {
    basePath,
    queueName,
    queueHost,
    jobCounts,
    paused,
    stats
  });
}

module.exports = handler;
