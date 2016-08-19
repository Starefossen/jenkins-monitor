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

  describe('getNodes()', () => {
    it('returns all nodes', done => {
      jenkins.getNodes().then(nodes => process.nextTick(() => {
        assert.equal(nodes.length, 68);
        done();
      }));
    });
  });

  describe('getOffline()', () => {
    it('filters out online nodes', done => {
      jenkins.getNodes()
        .then(jenkins.getOffline)
        .then(nodes => process.nextTick(() => {
          nodes.forEach(node => {
            assert.equal(node.offline, true);
            assert.equal(node.reason, 'Time out for last 5 try');
          });
          done();
        }));
    });
  });

  describe('summary()', function () {
    it('returns a summary of offline only nodes', function () {
      const nodes = [{
        offline: true,
      }, {
        offline: true,
      }];

      assert.equal(jenkins.summary(nodes), '2 Jenkins nodes are offline.');
    });

    it('returns a summary of online only nodes', function () {
      const nodes = [{
        offline: false,
      }, {
        offline: false,
      }, {
        offline: false,
      }];

      assert.equal(jenkins.summary(nodes), '3 Jenkins nodes are online.');
    });

    it('returns a summary of mixed nodes', function () {
      const nodes = [{
        offline: true,
      }, {
        offline: true,
      }, {
        offline: false,
      }];

      assert.equal(jenkins.summary(nodes), [
        '2 Jenkins nodes are offline',
        '1 node is online.',
      ].join(', and '));
    });
  });
});
