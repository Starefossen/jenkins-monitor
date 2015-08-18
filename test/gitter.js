/* jshint mocha: true */
'use strict';

const assert = require('assert');
const gitter = require('../lib/gitter');
const jsonist = require('jsonist');

let nodes;
let post = jsonist.post;

beforeEach(function() {
  jsonist.post = function() {};
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
  jsonist.post = post;
});

describe('gitter', function() {
  it('posts nodes to gitter', function(done) {
    let i = 0;
    const level = ['error', 'success'];

    jsonist.post = function(url, data, opts, cb) {
      assert.equal(url, process.env.GITTER_WEBHOOK_URL);
      assert.equal(typeof data.message, 'string');
      assert.equal(data.level, level[i++]);

      cb(null, { success: true }, {});
    };

    gitter.post(nodes, done);
  });

  it('returns any errors', function(done) {
    jsonist.post = function(url, data, opts, cb) {
      cb(new Error('I am borked'));
    };

    gitter.post(nodes, function(err) {
      assert(/I am borked/.test(err));
      done();
    });
  });
});
