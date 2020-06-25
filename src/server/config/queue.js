let config = [];
let queueConfig = {
  queues: []
};

if (process.env.TAURUS_MANAGER_CONFIG) {
  config = process.env.TAURUS_MANAGER_CONFIG.trim().split(',').reduce((config, queue) => {
    const [name, port, host, hostId] = queue.split(':');
    queueConfig.queues.push(
      {
        name: name,
        port: Number(port),
        host: host,
        hostId: hostId
      }
    );
    return queueConfig;
  }, []);
}

module.exports = queueConfig;
