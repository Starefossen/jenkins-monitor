/* eslint func-names: 0, prefer-arrow-callback: 0 */
'use strict';

const assert = require('assert');
const jenkins = require('../lib/jenkins');

const jsonist = require('jsonist');

const jsonistGetFn = jsonist.get;

describe('jenkins', function () {
  beforeEach(function () {
    jsonist.get = function (url, opts, cb) {
      const computers = require('./assets/computers.json'); // eslint-disable-line
      return cb(null, JSON.parse(JSON.stringify(computers)));
    };
  });

  after(function () {
    jsonist.get = jsonistGetFn;
  });

  describe('getComputers()', function () {
    it('returns all nodes', function (done) {
      this.timeout(10000);

      jenkins.getComputers(function (err, nodes) {
        assert.ifError(err);
        assert.equal(nodes.length, 68);
        done();
      });
    });
  });

  describe('getOffline()', function () {
    it('returns offline nodes', function (done) {
      this.timeout(10000);

      jenkins.getOffline(function (err, offline) {
        assert.ifError(err);
        assert.equal(offline.length, 3);

        offline.forEach(node => {
          assert.equal(node.offline, true);
          assert.equal(node.reason, 'Time out for last 5 try');
        });

        done();
      });
    });
  });
});
