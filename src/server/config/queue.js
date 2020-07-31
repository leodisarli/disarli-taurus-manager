let config = [];
let queueConfig = {
  queues: []
};

if (process.env.TAURUS_MANAGER_CONFIG) {
  config = process.env.TAURUS_MANAGER_CONFIG.trim().split(',').reduce((config, queue) => {
    const [name, port, host, hostId, password] = queue.split(':');
    queueConfig.queues.push(
      {
        name: name,
        port: Number(port),
        host: host,
        hostId: hostId,
        password: password
      }
    );
    return queueConfig;
  }, []);
}

module.exports = queueConfig;
