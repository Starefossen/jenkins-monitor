/* jshint mocha: true */
'use strict';

const assert = require('assert');
const jenkins = require('../lib/jenkins');

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
        assert.equal(offline.length, 5);
        done();
      });
    });
  });
});
