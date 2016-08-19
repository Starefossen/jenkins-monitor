/* eslint no-console: 0 */
'use strict';

const irc = require('irc');

const server = process.env.IRC_SERVER;
const user = process.env.IRC_USER;
const channel = process.env.IRC_CHANNEL;

const client = module.exports.client = new irc.Client(server, user, {
  autoConnect: false,
  autoRejoin: true,
  channels: [channel],
  showErrors: true,
});

if (process.env.NODE_ENV !== 'testing') {
  client.connect(5, () => {
    console.log('[IRC]', 'Connected!');
  });

  console.log(process.env.NODE_ENV);
  client.on('registered', (message) => {
    console.log('[IRC]', message.args[1]);
  });
}

client.on('error', (error) => {
  console.error(error);
  console.error('Shutting Down...');
  process.exit(1);
});

module.exports.post = node => new Promise(resolve => {
  let message;

  if (node.offline) {
    message = `Jenkins slave ${node.name} is offline`;
  } else {
    message = `Jenkins slave ${node.name} is online`;
  }

  client.notice(channel, message);

  resolve(`IRC (${node.name}): Ok!`);
});

module.exports.notify = nodes => Promise.all(nodes.map(module.exports.post));
