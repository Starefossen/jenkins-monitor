'use strict';

const jenkins = require('./lib/jenkins');
const jsonist = require('jsonist');

jenkins.getOffline(function(err, offline) {
  let data = {};
  let opts = {};
  const url = process.env.GITTER_WEBHOOK_URL;

  offline.forEach(function(c) {
    data = {
      message: `Jenkins slave [${c.name}](${process.env.JENKINS_URL}/computer/${c.name}) is offline`,
      level: 'error'
    };

    jsonist.post(url, data, opts, function(err, data, resp) {
      if (err) { throw err; }
      // { success: true }
      console.log(data);
    });
  });
});
