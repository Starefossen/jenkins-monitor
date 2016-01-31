'use strict';

const async = require('async');
const redis = require('ioredis').createClient(6379, 'redis');

const OFFLINE_THRESH = parseInt(process.env.OFFLINE_THRESH || 3, 10);

module.exports = redis;

module.exports.jenkinsChanged = function jenkinsChanged(nodes, cb) {
  async.filter(nodes, (node, done) => {
    const key = `node:${node.name}`;

    redis.hget(key, 'offline', (redisErr1, offline) => {
      if (redisErr1) { return done(redisErr1); }

      const wasOffline = parseInt(offline || 0, 10);
      const isOffline = parseInt(node.offline || 0, 10);

      const newOffline = (isOffline === 0 ? 0 : wasOffline + 1);

      redis.hset(key, 'offline', newOffline, (redisErr2) => {
        if (redisErr2) { return done(redisErr2); }

        // Node has come back online
        if (newOffline === 0 && wasOffline >= OFFLINE_THRESH) {
          done(true);

        // Node has become online
        } else if (newOffline === OFFLINE_THRESH) {
          done(true);

        // Node has not changed
        } else {
          done(false);
        }
      });
    });
  }, (filteredNodes) => {
    cb(null, filteredNodes);
  });
};
