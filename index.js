'use strict';

const schedule = require('node-schedule');

const jenkins = require('./lib/jenkins');
const redis   = require('./lib/redis');

const gitter = require('./lib/gitter');
const sendgrid = require('./lib/sendgrid');
const irc = require('./lib/irc');

const pkg = require('./package.json');
console.log(new Date(), `Staring ${pkg.name} v${pkg.version}`);
console.log(new Date(), process.env.SENDGRID_RECIPIENTS.split(','));

schedule.scheduleJob(process.env.CRON_INTERVAL, function() {
  console.log(new Date(), 'Running Cron Job...');

  console.log(new Date(), 'Fetching Jenkins nodes...');
  jenkins.getComputers(function(err, nodes) {
    if (err) { throw err; }
    console.log(new Date(), `Found ${nodes.length} Jenkins nodes.`);

    console.log(new Date(), 'Checking changed Jenkins nodes...');
    redis.jenkinsChanged(nodes, function(err, changed) {
      if (err) { throw err; }

      console.log(new Date(), `${changed.length} node(s) changed.`);

      if (changed.length > 0) {
        console.log(new Date(), 'Posting to Gitter...');
        gitter.post(changed, function(err) {
          if (err) { throw err; }
          console.log(new Date(), 'Gitter: Ok!');
        });

        console.log(new Date(), 'Notifying via Sendgrid...');
        sendgrid.notify(changed, function(err) {
          if (err) { throw err; }
          console.log(new Date(), 'Sendgrid: Ok!');
        });

        console.log(new Date(), 'Notifying via IRC...');
        irc.post(changed, function(err) {
          if (err) { throw err; }
          console.log(new Date(), 'IRC: Ok!');
        });
      }
    });
  });
});
