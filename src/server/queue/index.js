const _ = require('lodash');
const Bull = require('bull');
const Ulid = require('ulid');

class Queues {
  constructor(config) {
    this._queues = {};

    this.useCdn = {
      value: true,
      get useCdn() {
        return this.value;
      },
      set useCdn(newValue) {
        this.value = newValue;
      }
    };

    this.setConfig(config);
  }

  list() {
    return this._config.queues;
  }

  setConfig(config) {
    this._config = config;
  }

  async get(queueName, queueHost) {
    const queueConfig = _.find(this._config.queues, {
      name: queueName,
      hostId: queueHost
    });
    if (!queueConfig) return null;

    if (this._queues[queueHost] && this._queues[queueHost][queueName]) {
      return this._queues[queueHost][queueName];
    }

    const { type, name, port, host, db, password, prefix, url, redis, tls } = queueConfig;

    const redisHost = { host };
    if (password) redisHost.password = password;
    if (port) redisHost.port = port;
    if (db) redisHost.db = db;
    if (tls) redisHost.tls = tls;

    const options = {
      redis: redis || url || redisHost
    };
    if (prefix) options.prefix = prefix;

    let queue;
    if (queueConfig.createClient) options.createClient = queueConfig.createClient;
    queue = new Bull(name, options);

    this._queues[queueHost] = this._queues[queueHost] || {};
    this._queues[queueHost][queueName] = queue;

    return queue;
  }

  /**
   * Creates and adds a job with the given `data` to the given `queue`.
   *
   * @param {Object} queue A bull queue class
   * @param {Object} data The data to be used within the job
   */
  async set(queue, data) {
    const args = [
      data,
      {
        jobId: Ulid.ulid(),
        removeOnComplete: false,
        removeOnFail: false
      }
    ];

    args.unshift('process');

    return queue.add.apply(queue, args);
  }
}

module.exports = Queues;
