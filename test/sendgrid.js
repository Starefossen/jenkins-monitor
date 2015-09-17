/* jshint mocha: true */
'use strict';

const assert = require('assert');
const sendgrid = require('../lib/sendgrid');

let nodes;
let send = sendgrid.sendgrid.send;

describe('sendgrid', function() {
  beforeEach(function() {
    sendgrid.sendgrid.send = function() {};
    nodes = [
      {
        name: 'foo',
        offline: true,
      },{
        name: 'bar',
        offline: false,
      }
    ];
  });

  afterEach(function() {
    sendgrid.sendgrid.send = send;
  });

  describe('notify', function() {
    it('sends an email', function(done) {
      sendgrid.sendgrid.send = function(email, cb) {
        assert.equal(email.from, process.env.SENDGRID_SENDER);
        assert.equal(email.subject, '[jenkins-monitor] Downtime Alert');
        assert.equal(typeof email.text, 'object');

        cb(null);
      };

      sendgrid.notify(nodes, done);
    });
  });
});
