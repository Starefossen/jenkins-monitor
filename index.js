'use strict';

const schedule = require('node-schedule');

const jenkins = require('./lib/jenkins');
const redis   = require('./lib/redis');

const gitter  = require('./lib/gitter');
const sendgrid = require('./lib/sendgrid');

const pkg = require('./package.json');
console.log(`Staring ${pkg.name} v${pkg.version}`);

schedule.scheduleJob(process.env.CRON_INTERVAL, function() {
  console.log('Running Cron Job...');

  console.log('Fetching Jenkins nodes...');
  jenkins.getComputers(function(err, nodes) {
    if (err) { throw err; }
    console.log(`Found ${nodes.length} Jenkins nodes.`);

    console.log('Checking changed Jenkins nodes...');
    redis.jenkinsChanged(nodes, function(err, changed) {
      if (err) { throw err; }

      console.log(`${changed.length} node(s) changed.`);

      if (changed.length > 0) {
        console.log('Posting to Gitter...');
        gitter.post(changed, function(err) {
          if (err) { throw err; }
          console.log('Gitter: Ok!');
        });

        console.log('Notifying via Sendgrid...');
        sendgrid.notify(changed, function(err) {
          if (err) { throw err; }
          console.log('Sendgrid: Ok!');
        });
      }
    });
  });
});
