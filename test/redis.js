/* eslint func-names: 0, prefer-arrow-callback: 0 */
'use strict';

const assert = require('assert');
const redis = require('../lib/redis');

describe('redis', function () {
  beforeEach(function (done) {
    this.timeout(10000);
    redis.flushdb(done);
  });

  beforeEach(function (done) {
    this.timeout(10000);

    redis.hset('node:foo', 'offline', 0);
    redis.hset('node:bar', 'offline', 1);
    redis.hset('node:baz', 'offline', 2);
    redis.hset('node:bix', 'offline', 3);
    redis.hset('node:bez', 'offline', 4);
    redis.hset('node:pax', 'offline', 5, done);
  });

  describe('module.exports', function () {
    it('returns a connection', function () {
      assert.equal(typeof redis.serverInfo, 'object');
    });
  });

  describe('jenkinsChanged()', function () {
    it('returns empty array for no offline nodes', function (done) {
      const nodes = [{ name: 'foo', offline: 0 }];

      redis.jenkinsChanged(nodes, function (err, n) {
        assert.ifError(err);
        assert.equal(n.length, 0);
        assert.deepEqual(n, {});
        done();
      });
    });

    it('returns offline nodes after 3 consecutive times offline', function (done) {
      const nodes = [
        { name: 'foo', offline: 1 },
        { name: 'bar', offline: 1 },
        { name: 'baz', offline: 1 },
        { name: 'bix', offline: 1 },
        { name: 'bez', offline: 1 },
        { name: 'pax', offline: 1 },
      ];

      redis.jenkinsChanged(nodes, function (err1, n1) {
        assert.ifError(err1);
        assert.equal(n1.length, 1);
        assert.equal(n1[0].name, 'baz');

        redis.jenkinsChanged(nodes, function (err2, n2) {
          assert.ifError(err2);
          assert.equal(n2.length, 1);
          assert.equal(n2[0].name, 'bar');

          redis.jenkinsChanged(nodes, function (err3, n3) {
            assert.ifError(err3);
            assert.equal(n3.length, 1);
            assert.equal(n3[0].name, 'foo');

            done();
          });
        });
      });
    });

    it('returns online nodes after 3+ consecutive times offline', function (done) {
      const nodes = [
        { name: 'foo', offline: 0 },
        { name: 'bar', offline: 0 },
        { name: 'baz', offline: 0 },
        { name: 'bix', offline: 0 },
        { name: 'bez', offline: 0 },
        { name: 'pax', offline: 0 },
      ];

      redis.jenkinsChanged(nodes, function (err1, n1) {
        assert.ifError(err1);
        assert.equal(n1.length, 3);
        assert.equal(n1[0].name, 'bix');
        assert.equal(n1[1].name, 'bez');
        assert.equal(n1[2].name, 'pax');

        redis.jenkinsChanged(nodes, function (err2, n2) {
          assert.ifError(err2);
          assert.equal(n2.length, 0);
          assert.deepEqual(n2, {});

          done();
        });
      });
    });
  });
});
