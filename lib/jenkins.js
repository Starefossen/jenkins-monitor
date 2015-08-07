'use strict';

const jsonist = require('jsonist');

function rnd(d) {
  return Math.round(d * 100) / 100
};

function disk(c) {
  const key = 'hudson.node_monitors.DiskSpaceMonitor';
  return c.monitorData[key]
    && c.monitorData[key].size
    && rnd(c.monitorData[key].size / 1014 / 1024 / 1024)
};

function temp(c) {
  const key = 'hudson.node_monitors.TemporarySpaceMonitor';
  return c.monitorData[key]
    && c.monitorData[key].size
    && rnd(c.monitorData[key].size / 1014 / 1024 / 1024)
};

module.exports.getComputers = function(cb) {
  const url = `${process.env.JENKINS_URL}/computer/api/json`;

  jsonist.get(url, function(err, data) {
    if (err) { return cb(err); }

    cb(null, data.computer.map(function(c) {
      return {
        offline: c.offline,
        temporarilyOffline: c.temporarilyOffline,
        name: c.displayName,
        idle: c.idle,
        disk: `${disk(c) || '?'} G`,
        temp: `${temp(c) || '?'} G`
      }
    }));
  })
};

module.exports.getOffline = function(cb) {
  module.exports.getComputers(function(err, computers) {
    if (err) { return cb(err); }

    cb(null, computers.filter(function(c) {
      return c.offline || c.temporarilyOffline;
    }));
  });
};
