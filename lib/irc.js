/* eslint no-console: 0 */
'use strict';

const irc = require('irc');

const server = process.env.IRC_SERVER;
const user = process.env.IRC_USER;
const channel = process.env.IRC_CHANNEL;

const client = module.exports.client = new irc.Client(server, user, {
  debug: true,
  autoConnect: false,
  autoRejoin: true,
  channels: [channel],
  showErrors: true,
});

client.connect(5, function() {
  console.log(arguments);
});

if (process.env.NODE_ENV !== 'testing') {
  client.on('registered', function clientOnRegisterd(message) {
    console.log(new Date(), '[IRC]', message.args[1]);
  });
}

client.on('error', function clientOnError(error) {
  console.error(error);
  console.error('Shutting Down...');
  process.exit(1);
});

module.exports.notify = function ircPost(nodes, callback) {
  nodes.forEach(function nodesForEach(node) {
    // let name = `[${node.name}](${jenkins}/computer/${node.name})`;

    if (node.offline) {
      client.say(channel, `Jenkins slave ${node.name} is offline`);
    } else {
      client.say(channel, `Jenkins slave ${node.name} is online`);
    }
  });

  callback(null);
};
