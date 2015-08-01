'use strict';

const assert = require('assert');

describe('jenkins', function() {
  const jenkins = require('./jenkins');

  describe('status', function() {
    it('returns offline nodes', function(done) {
      this.timeout(10000);

      jenkins.getOffline(function(err, offline) {
        assert.ifError(err);
        console.log(offline);
        done();
      });
    });
  });
});
