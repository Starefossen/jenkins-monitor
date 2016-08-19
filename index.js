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

  // Get the list of all nodes/slaves from Jenkins
  jenkins.getNodes()

  // Print nodes offline/online to console log
  .then(nodes => {
    const offline = jenkins.getOffline(nodes).length;
    console.log(`${nodes.length} total Jenkins nodes`);
    console.log(`${offline} offline Jenkins nodes`);

    return nodes;
  })

  // Mark nodes changed since last time we checked
  .then(redis.checkNodes)

  // Filter out nodes that have not changed
  .then(redis.getChanged)

  // Print the number of changed nodes to console log
  .then(nodes => {
    console.log(`${nodes.length} node(s) changed.`);

    return nodes;
  })

  // Notify if there are any changed nodes
  .then(nodes => {
    if (nodes.length > 0) {
      // Notifiy changed nodes
      Promise.all([
        gitter.notify(nodes),
        irc.notify(nodes),
        sendgrid.notify(nodes),
      ])

      // Print the result from notifications
      .then(res => {
        console.log(res);
      });
    }
  })

  // Catch any errors and exit
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
});
