/* jshint mocha: true */
'use strict';

const assert = require('assert');
const redis = require('../lib/redis');

let nodes;

beforeEach(function(done) {
  redis.flushdb(done);
});

describe('redis', function() {
  describe('module.exports', function() {
    it('returns a connection', function() {
      assert.equal(typeof redis.server_info, 'object');
    });
  });
});
