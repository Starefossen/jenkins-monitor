'use strict';

const jsonist = require('jsonist');
const async = require('async');

const gitter = process.env.GITTER_WEBHOOK_URL;
const jenkins = process.env.JENKINS_URL;

module.exports.notify = function gitterPost(nodes, callback) {
  async.each(nodes, function asyncEach(node, cb) {
    const name = `[${node.name}](${jenkins}/computer/${node.name})`;
    const opts = {};
    let data;

    if (node.offline) {
      data = {
        message: `Jenkins slave ${name} is offline`,
        level: 'error',
      };
    } else {
      data = {
        message: `Jenkins slave ${name} is online`,
        level: 'success',
      };
    }

    jsonist.post(gitter, data, opts, cb);
  }, callback);
};
