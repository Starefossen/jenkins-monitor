'use strict';

const irc = require('irc');

const server = process.env.IRC_SERVER;
const user = process.env.IRC_USER;
const channel = process.env.IRC_CHANNEL;

const client = module.exports.client = new irc.Client(server, user, {
  channels: [channel],
});

client.on('error', function(error) {
  console.error(error);
  console.error('Shutting Down...');
  process.exit(1);
});

module.exports.post = function(nodes, callback) {
  nodes.forEach(function(node) {
    // let name = `[${node.name}](${jenkins}/computer/${node.name})`;

    if (node.offline) {
      client.say(channel, `Jenkins slave ${node.name} is offline`);
    } else {
      client.say(channel, `Jenkins slave ${node.name} is online`);
    }
  });

  callback(null);
};
