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

client.connect(5, () => {
  console.log('[IRC]', 'Connected!');
});

if (process.env.NODE_ENV !== 'testing') {
  client.on('registered', (message) => {
    console.log('[IRC]', message.args[1]);
  });
}

client.on('error', (error) => {
  console.error(error);
  console.error('Shutting Down...');
  process.exit(1);
});

module.exports.notify = (nodes, callback) => {
  nodes.forEach((node) => {
    // let name = `[${node.name}](${jenkins}/computer/${node.name})`;

    if (node.offline) {
      client.notice(channel, `Jenkins slave ${node.name} is offline`);
    } else {
      client.notice(channel, `Jenkins slave ${node.name} is online`);
    }
  });

  callback(null);
};
