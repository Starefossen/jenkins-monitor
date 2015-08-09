'use strict';

const async = require('async');
const redis = require('redis').createClient(6379, 'redis');

module.exports = redis;
