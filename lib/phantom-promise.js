"use strict";
let phantom = require('phantom');
let PhantomWrapper = require('../lib/phantom-wrapper');

module.exports = {
  create: function(options) {
    return new Promise(function(resolve, reject) {
      phantom.create(function(ph, err) {
        if (err) {
          return reject(err);
        }
        resolve(new PhantomWrapper(ph));
      }, options)
    });
  },
}
