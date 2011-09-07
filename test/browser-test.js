require('./helper');

vows.describe('browser').addBatch({
  '.request': {
    'returns an instance of Request': function() {
      window = {
        XMLHttpRequest: {
          location: {
            host: 'example.com',
            port: 80
          }
        }
      };

      var http = require('../browser'),
          Request = require('../lib/request');

      assert.instanceOf(http.request(), Request);
    }
  }
}).export(module);
