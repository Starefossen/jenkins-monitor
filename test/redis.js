/* jshint mocha: true */
'use strict';

const assert = require('assert');
const redis = require('../lib/redis');

let nodes;

beforeEach(function(done) {
  redis.flushdb(done);
  nodes = JSON.parse(JSON.stringify(require('./assets/computers')));
});

describe('redis', function() {
  describe('module.exports', function() {
    it('returns a connection', function() {
      assert.equal(typeof redis.server_info, 'object');
    });
  });

  describe('jenkinsChanged()', function() {
    it('returns offline nodes', function(done) {
      redis.jenkinsChanged(nodes.computer, function(err, n) {
        assert.ifError(err);
        assert.equal(n.length, 3);
        assert.equal(n[0].displayName, 'iojs-linaro-armv8-ubuntu1404');
        assert.equal(n[1].displayName, 'iojs-nodesource-raspbian-wheezy-pi1p-3');
        assert.equal(n[2].displayName, 'iojs-voxer-osx1010-release-pkg-2');
        done();
      });
    });

    it('returns empty array for no changed nodes', function(done) {
      redis.jenkinsChanged(nodes.computer, function(err, n) {
        assert.ifError(err);
        nodes = JSON.parse(JSON.stringify(require('./assets/computers')));
        redis.jenkinsChanged(nodes.computer, function(err, n) {
          assert.ifError(err);
          assert.deepEqual(n, []);
          done();
        });
      });
    });

    it('returns only changed nodes', function(done) {
      redis.jenkinsChanged(nodes.computer, function(err, n) {
        assert.ifError(err);

        nodes = JSON.parse(JSON.stringify(require('./assets/computers')));
        nodes.computer[5].temporarilyOffline = true;
        nodes.computer[6].temporarilyOffline = true;

        redis.jenkinsChanged(nodes.computer, function(err, n) {
          assert.ifError(err);
          assert.equal(n.length, 2);
          assert.equal(n[0].displayName, 'iojs-digitalocean-centos5-release-32-1');
          assert.equal(n[1].displayName, 'iojs-digitalocean-centos5-release-64-1');
          done();
        });
      });
    });
  });
});
