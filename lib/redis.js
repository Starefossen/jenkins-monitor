'use strict';

const redis = require('ioredis').createClient(6379, 'redis');

const OFFLINE_THRESH = parseInt(process.env.OFFLINE_THRESH || 3, 10);

module.exports = redis;

module.exports.checkNode = node => new Promise((resolve, reject) => {
  const pipeline = redis.pipeline().hget(`node:${node.name}`, 'offline');

  if (node.offline) {
    pipeline.hincrby(`node:${node.name}`, 'offline', 1);
  } else {
    pipeline.hset(`node:${node.name}`, 'offline', 0);
  }

  pipeline.exec().then(result => {
    const prev = parseInt(result[0][1], 10) || 0;
    const curr = parseInt(result[1][1], 10) || 0;

    node.changed = (curr === 0 && prev >= OFFLINE_THRESH) || curr === OFFLINE_THRESH;

    resolve(node);
  }).catch(reject);
});

module.exports.checkNodes = nodes => (
  Promise.all(nodes.map(node => module.exports.checkNode(node)))
);

module.exports.getChanged = nodes => nodes.filter(n => !!n.changed);

