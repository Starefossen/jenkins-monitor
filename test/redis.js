/* eslint func-names: 0 */
'use strict';

const assert = require('assert');
const redis = require('../lib/redis');

const jsonist = require('jsonist');
const jenkins = require('../lib/jenkins');
const _get = jsonist.get;

let nodes;

describe('redis', function() {
  before(function() {
    jsonist.get = function(url, cb) {
      const computers = require('./assets/computers.json');
      return cb(null, JSON.parse(JSON.stringify(computers)));
    };
  });

  after(function() {
    jsonist.get = _get;
  });

  beforeEach(function(done) {
    this.timeout(10000);
    redis.flushdb(done);
  });

  beforeEach(function(done) {
    this.timeout(10000);
    jenkins.getComputers(function(err, computers) {
      nodes = computers;
      done(err);
    });
  });

  describe('module.exports', function() {
    it('returns a connection', function() {
      assert.equal(typeof redis.server_info, 'object');
    });
  });

  describe('jenkinsChanged()', function() {
    it('returns offline nodes', function(done) {
      redis.jenkinsChanged(nodes, function(err, n) {
        assert.ifError(err);
        assert.equal(n.length, 3);
        assert.equal(n[0].name, 'iojs-linaro-armv8-ubuntu1404');
        assert.equal(n[1].name, 'iojs-nodesource-raspbian-wheezy-pi1p-3');
        assert.equal(n[2].name, 'iojs-voxer-osx1010-release-pkg-2');
        done();
      });
    });

    it('returns empty array for no changed nodes', function(done) {
      redis.jenkinsChanged(nodes, function(redisErr1) {
        assert.ifError(redisErr1);
        nodes = JSON.parse(JSON.stringify(require('./assets/computers')));
        redis.jenkinsChanged(nodes, function(redisErr2, n) {
          assert.ifError(redisErr2);
          assert.deepEqual(n, []);
          done();
        });
      });
    });

    it('returns only changed nodes', function(done) {
      redis.jenkinsChanged(nodes, function(redisErr1) {
        assert.ifError(redisErr1);

        nodes[5].offline = 1;
        nodes[6].offline = 1;

        redis.jenkinsChanged(nodes, function(redisErr2, n) {
          assert.ifError(redisErr2);
          assert.equal(n.length, 2);
          assert.equal(n[0].name, 'iojs-digitalocean-centos5-release-32-1');
          assert.equal(n[1].name, 'iojs-digitalocean-centos5-release-64-1');
          done();
        });
      });
    });
  });
});
