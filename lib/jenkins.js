'use strict';

const jsonist = require('jsonist');

function rnd(d) {
  return Math.round(d * 100) / 100;
}

function disk(c) {
  const key = 'hudson.node_monitors.DiskSpaceMonitor';
  return c.monitorData[key]
    && c.monitorData[key].size
    && rnd(c.monitorData[key].size / 1014 / 1024 / 1024);
}

function temp(c) {
  const key = 'hudson.node_monitors.TemporarySpaceMonitor';
  return c.monitorData[key]
    && c.monitorData[key].size
    && rnd(c.monitorData[key].size / 1014 / 1024 / 1024);
}

module.exports.getComputers = function jenkinsGetComputers(cb) {
  const url = `${process.env.JENKINS_URL}/computer/api/json`;

  jsonist.get(url, function jsonistGetCb(err, data) {
    if (err) { return cb(err); }

    // @TODO we should probably check res.statusCode

    cb(null, data.computer.map(function dataComputerMap(c) {
      return {
        permanentlyOffline: c.offline,
        temporarilyOffline: c.temporarilyOffline,
        offline: !!(c.offline || c.temporarilyOffline) + 0,
        name: c.displayName,
        idle: c.idle,
        disk: `${disk(c) || '?'} G`,
        temp: `${temp(c) || '?'} G`,
      };
    }));
  });
};

module.exports.getOffline = function jenkinsGetOffline(cb) {
  module.exports.getComputers(function jenkinsGetComputersCb(err, computers) {
    if (err) { return cb(err); }

    cb(null, computers.filter(function computersFilter(c) {
      return c.offline === 1;
    }));
  });
};
