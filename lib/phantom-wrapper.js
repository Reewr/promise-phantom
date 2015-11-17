"use strict";
var WebPageWrapper = require('../lib/webpage-wrapper');
/**
 * @class
 * A small wrapper around the existing Phantom-object to make it play nice
 * with promises.
 */
class Phantom {
  constructor(ph) {
    this.ph = ph;
  }

  /**
   * Creates a page, with certain options
   * Currently on one option is available.
   * @param  {object} options
   *   @param {string} options.temporaryDirectory Where to store temp files
   * @async
   */
  createPage(options) {
    return new Promise((resolve, reject) => {
      this.ph.createPage(function(page, err) {
        if (err) {
          return reject(err);
        }
        resolve(new WebPageWrapper(page, options));
      });
    });
  }

  /**
   * Exits the process, this will call the onExit callback if specified as
   * in options
   * @return {[type]} [description]
   */
  exit() {
    this.ph.exit();
  }
};

module.exports = Phantom;
