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

  describe('checkNode()', () => {
    [
      { name: 'foo', offline: false, online: false },
      { name: 'bar', offline: false, online: false },
      { name: 'baz', offline: true, online: false },
      { name: 'bix', offline: false, online: true },
      { name: 'bez', offline: false, online: true },
      { name: 'pax', offline: false, online: true },
      { name: 'unknown', offline: false, online: false },
    ].forEach(test => {
      it(`sets ${test.name} changed=${test.offline} when offline`, done => {
        const node = { name: test.name, offline: 1 };

        redis.checkNode(node).then(n => process.nextTick(() => {
          assert.equal(n.changed, test.offline);
          done();
        }));
      });

      it(`sets ${test.name} changed=${test.online} when online`, done => {
        const node = { name: test.name, offline: 0 };

        redis.checkNode(node).then(n => process.nextTick(() => {
          assert.equal(n.changed, test.online);
          done();
        }));
      });
    });
  });

  describe('checkNodes()', () => {
    it('returns changed status for multiple offline nodes', done => {
      const nodes = [
        { name: 'foo', offline: 1 },
        { name: 'bar', offline: 1 },
        { name: 'baz', offline: 1 },
        { name: 'bix', offline: 1 },
        { name: 'bez', offline: 1 },
        { name: 'pax', offline: 1 },
      ];

      redis.checkNodes(nodes).then(n => process.nextTick(() => {
        assert.deepEqual(n, [
          { name: 'foo', offline: 1, changed: false },
          { name: 'bar', offline: 1, changed: false },
          { name: 'baz', offline: 1, changed: true },
          { name: 'bix', offline: 1, changed: false },
          { name: 'bez', offline: 1, changed: false },
          { name: 'pax', offline: 1, changed: false },
        ]);

        done();
      }));
    });

    it('returns changed status for multiple online nodes', done => {
      const nodes = [
        { name: 'foo', offline: 0 },
        { name: 'bar', offline: 0 },
        { name: 'baz', offline: 0 },
        { name: 'bix', offline: 0 },
        { name: 'bez', offline: 0 },
        { name: 'pax', offline: 0 },
      ];

      redis.checkNodes(nodes).then(n => process.nextTick(() => {
        assert.deepEqual(n, [
          { name: 'foo', offline: 0, changed: false },
          { name: 'bar', offline: 0, changed: false },
          { name: 'baz', offline: 0, changed: false },
          { name: 'bix', offline: 0, changed: true },
          { name: 'bez', offline: 0, changed: true },
          { name: 'pax', offline: 0, changed: true },
        ]);

        done();
      }));
    });
  });

  describe('getChanged()', () => {
    it('returns only changed nodes', () => {
      const nodes = [
        { name: 'foo', offline: 0, changed: false },
        { name: 'bar', offline: 0, changed: false },
        { name: 'baz', offline: 0, changed: false },
        { name: 'bix', offline: 0, changed: true },
        { name: 'bez', offline: 0, changed: true },
        { name: 'pax', offline: 0, changed: true },
      ];

      assert.deepEqual(redis.getChanged(nodes), [
        { name: 'bix', offline: 0, changed: true },
        { name: 'bez', offline: 0, changed: true },
        { name: 'pax', offline: 0, changed: true },
      ]);
    });
  });
});
