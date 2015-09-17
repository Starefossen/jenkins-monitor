/* jshint mocha: true */
'use strict';

const assert = require('assert');
const jenkins = require('../lib/jenkins');

const jsonist = require('jsonist');
const _get = jsonist.get;

beforeEach(function() {
  jsonist.get = function(url, cb) {
    return cb(null, JSON.parse(JSON.stringify(require('./assets/computers.json'))));
  };
});

after(function() {
  jsonist.get = _get;
});

describe('jenkins', function() {
  describe('getComputers()', function() {
    it('returns all nodes', function(done) {
      this.timeout(10000);

      jenkins.getComputers(function(err, nodes) {
        assert.ifError(err);
        assert.equal(nodes.length, 68);
        done();
      });
    });
  });

  describe('getOffline()', function() {
    it('returns offline nodes', function(done) {
      this.timeout(10000);

      jenkins.getOffline(function(err, offline) {
        assert.ifError(err);
        assert.equal(offline.length, 3);
        done();
      });
    });
  });
});
