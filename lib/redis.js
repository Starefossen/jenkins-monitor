'use strict';

const async = require('async');
const redis = require('ioredis').createClient(6379, 'redis');

module.exports = redis;

module.exports.jenkinsChanged = function jenkinsChanged(nodes, cb) {
  async.filter(nodes, (node, done) => {
    const key = `node:${node.name || node.displayName}`;

    redis.hget(key, 'offline', (redisErr1, offline) => {
      if (redisErr1) { return done(redisErr1); }

      const wasOffline = parseInt(offline || 0, 10);
      redis.hset(key, 'offline', node.offline, (redisErr2) => {
        if (redisErr2) { return done(redisErr2); }

        done(!!(node.offline ^ wasOffline));
      });
    });
  }, (filteredNodes) => {
    cb(null, filteredNodes);
  });
};
