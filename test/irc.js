/* eslint func-names: 0 */
'use strict';

const assert = require('assert');
const irc = require('../lib/irc');

const say = irc.client.say;
let nodes;

describe('irc', function() {
  beforeEach(function() {
    irc.client.say = function() {};
    nodes = [
      {
        name: 'foo',
        offline: true,
      }, {
        name: 'bar',
        offline: false,
      },
    ];
  });

  afterEach(function() {
    irc.client.say = say;
  });

  describe('#post()', function() {
    it('posts nodes to irc', function(done) {
      let i = 0;

      irc.client.say = function(channel, message) {
        i++;

        assert.equal(channel, process.env.IRC_CHANNEL);

        if (i === 1) {
          assert.equal(message, 'Jenkins slave foo is offline');
        } else {
          assert.equal(message, 'Jenkins slave bar is online');
          done();
        }
      };

      irc.post(nodes, function(err) {
        assert.ifError(err);
      });
    });
  });
});
