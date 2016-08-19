'use strict';

const jsonist = require('jsonist');

const gitter = process.env.GITTER_WEBHOOK_URL;
const jenkins = process.env.JENKINS_URL;

module.exports.post = node => new Promise((resolve, reject) => {
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

  jsonist.post(gitter, data, opts, error => {
    if (error) {
      reject(error);
    } else {
      resolve(`Gitter (${node.name}): Ok!`);
    }
  });
});

module.exports.notify = nodes => Promise.all(nodes.map(module.exports.post));
