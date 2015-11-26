'use strict';

const async = require('async');
const redis = require('redis').createClient(6379, 'redis');

module.exports = redis;

module.exports.jenkinsChanged = function jenkinsChanged(nodes, cb) {
  async.filter(nodes, function asyncFilter(node, done) {
    const key = `node:${node.name || node.displayName}`;

    redis.hget(key, 'offline', function redisHgetCb(redisErr1, offline) {
      if (redisErr1) { return done(redisErr1); }

      const wasOffline = parseInt(offline || 0, 10);
      redis.hset(key, 'offline', node.offline, function redisHsetCb(redisErr2) {
        if (redisErr2) { return done(redisErr2); }

        done(!!(node.offline ^ wasOffline));
      });
    });
  }, function asyncFilterDone(filteredNodes) {
    cb(null, filteredNodes);
  });
};
