/* eslint no-console: 0 */
'use strict';

const schedule = require('node-schedule');

const jenkins = require('./lib/jenkins');
const redis = require('./lib/redis');

const gitter = require('./lib/gitter');
const sendgrid = require('./lib/sendgrid');
const irc = require('./lib/irc');

const pkg = require('./package.json');

console.log(`Staring ${pkg.name} v${pkg.version}`);
console.log(process.env.SENDGRID_RECIPIENTS.split(','));

console.log(`Setting up cron interval "${process.env.CRON_INTERVAL}"`);
schedule.scheduleJob(process.env.CRON_INTERVAL, () => {
  console.log('Running Cron Job...');

  console.log('Fetching Jenkins nodes...');
  jenkins.getComputers((jenkinsErr, nodes) => {
    if (jenkinsErr) { throw jenkinsErr; }

    const offline = nodes.reduce((cnt, node) => cnt + (node.offline ? 1 : 0), 0);

    console.log(`Found ${nodes.length} Jenkins nodes, ${offline} are offline!`);

    console.log('Checking changed Jenkins nodes...');
    redis.jenkinsChanged(nodes, (redisErr, changed) => {
      if (redisErr) { throw redisErr; }
      console.log(`${changed.length} node(s) changed.`);

      if (changed.length > 0) {
        console.log('Posting to Gitter...');
        gitter.notify(changed, (err) => {
          if (err) { throw err; }
          console.log('Gitter: Ok!');
        });

        console.log('Notifying via Sendgrid...');
        sendgrid.notify(changed, (err) => {
          if (err) { throw err; }
          console.log('Sendgrid: Ok!');
        });

        console.log('Notifying via IRC...');
        irc.notify(changed, (err) => {
          if (err) { throw err; }
          console.log('IRC: Ok!');
        });
      }
    });
  });
});
