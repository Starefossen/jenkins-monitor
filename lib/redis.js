'use strict';

const async = require('async');
const redis = require('redis').createClient(6379, 'redis');

module.exports = redis;

module.exports.jenkinsChanged = function(nodes, cb) {
  async.filter(nodes, function(node, cb) {
    const key = `node:${node.name || node.displayName}`;
    node.offline = !!(node.offline || node.temporarilyOffline) + 0;

    redis.hget(key, 'offline', function(err, offline) {
      if (err) { return cb(err); }

      offline = parseInt(offline || 0, 10);
      redis.hset(key, 'offline', node.offline, function(err) {
        if (err) { return cb(err); }

        cb(!!(node.offline ^ offline));
      });
    });
  }, function(nodes) {
    cb(null, nodes);
  });
};
