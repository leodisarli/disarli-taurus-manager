const _ = require('lodash');
const { BULL_STATES } = require('../helpers/queueHelpers');

/**
 * Determines if the requested job state lookup is valid.
 *
 * @param {String} state
 *
 * @return {Boolean}
 */
function isValidState(state) {
  const validStates = BULL_STATES;
  return _.includes(validStates, state);
}

async function handler(req, res) {
  if (req.params.ext === 'json') return _json(req, res);

  return _html(req, res);
}

/**
 * Returns the queue jobs in the requested state as a json document.
 *
 * @prop {Object} req express request object
 * @prop {Object} res express response object
 */
async function _json(req, res) {
  const { queueName, queueHost, state } = req.params;
  const {Queues} = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  if (!queue) return res.status(404).json({ message: 'Queue not found' });

  if (!isValidState(state)) return res.status(400).json({ message: `Invalid state requested: ${state}` });

  let jobs;
  jobs = await queue[`get${_.capitalize(state)}`](0, 1000);
  jobs = jobs.map((j) => j.toJSON());

  const filename = `${queueName}-${state}-dump.json`;

  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-type', 'application/json');
  res.write(JSON.stringify(jobs, null, 2), () => res.end());
}

/**
 * Renders an html view of the queue jobs in the requested state.
 *
 * @prop {Object} req express request object
 * @prop {Object} res express response object
 */
async function _html(req, res) {
  const { queueName, queueHost, state } = req.params;
  const {Queues} = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  const basePath = req.baseUrl;
  if (!queue) return res.status(404).render('dashboard/templates/queueNotFound', {basePath, queueName, queueHost});

  if (!isValidState(state)) return res.status(400).json({ message: `Invalid state requested: ${state}` });

  let jobCounts;
  jobCounts = await queue.getJobCounts();

  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 100;

  const startId = (page - 1) * pageSize;
  const endId = startId + pageSize - 1;

  let jobs;
  jobs = await queue[`get${_.capitalize(state)}`](startId, endId);
  await jobs.map(async (job) => {
    let logs = await queue.getJobLogs(job.id);
    job.logs = (logs.logs || "No Logs");
    return job;
  });

  for (const job of jobs) {
    const jobState = await job.getState();
    job.retryButtonText = jobState == 'failed' ? 'Retry' : 'Clone';
  }

  let pages = _.range(page - 6, page + 7)
    .filter((page) => page >= 1);
  while (pages.length < 12) {
    pages.push(_.last(pages) + 1);
  }
  pages = pages.filter((page) => page <= _.ceil(jobCounts[state] / pageSize));

  return res.render('dashboard/templates/queueJobsByState', {
    basePath,
    queueName,
    queueHost,
    state,
    jobs,
    jobsInStateCount: jobCounts[state],
    currentPage: page,
    pages,
    pageSize,
    lastPage: _.last(pages)
  });
}

module.exports = handler;
