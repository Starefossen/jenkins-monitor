/* eslint func-names: 0, prefer-arrow-callback: 0 */
'use strict';

const assert = require('assert');
const irc = require('../lib/irc');

const notice = irc.client.notice;
let nodes;

describe('irc', function () {
  beforeEach(function () {
    irc.client.notice = function () {};
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

  afterEach(function () {
    irc.client.notice = notice;
  });

  describe('#notify()', function () {
    it('posts nodes to irc', function (done) {
      let i = 0;

      irc.client.notice = function (channel, message) {
        i++;

        assert.equal(channel, process.env.IRC_CHANNEL);

        if (i === 1) {
          assert.equal(message, 'Jenkins slave foo is offline');
        } else {
          assert.equal(message, 'Jenkins slave bar is online');
          done();
        }
      };

      irc.notify(nodes, function (err) {
        assert.ifError(err);
      });
    });
  });
});
