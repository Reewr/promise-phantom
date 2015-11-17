"use strict";
let crypto  = require('crypto');
let util    = require('util');

/**
 * Formats a string so that it has a nice name that can be used as filename
 * @param  {string}
 * @return {string}
 */
let toFilenameFriendly = function(str) {
  return str.replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '_');
};

/**
 * Returns a date string of now in the form of
 * 'day-month-year_hour-minutes-seconds-miliseconds'
 * @return {string}
 */
let getDateStr = function() {
  let now   = new Date();
  let d = now.getDate();
  let m = now.getMonth();
  let y = now.getFullYear();
  let H = now.getHours();
  let M = now.getMinutes();
  let S = now.getSeconds();
  let MS = now.getMilliseconds();
  return util.format('%s-%s-%s_%s-%s-%s-%s', d, m, y, M, S, MS);
};

/**
 * Returns a string through promise that is a random ID. This is used
 * for temporary storage of files
 * @return {string}
 */
let getId = function() {
  return new Promise(function(resolve, reject) {
    crypto.randomBytes(32, (err, buf) => {
      if (err) {
        return reject(err);
      }

      resolve(toFilenameFriendly(buf.toString('base64')));
    });
  })
};

module.exports = {
  /**
   * This function generates a filename that should be unique. It is composed
   * of a randomly generated ID as well as the datetime as it is called.
   * @return {string}
   */
  generateFilename: function() {
    return new Promise(function(resolve, reject) {
      getId().then((id) => {
        resolve(id + '_' + getDateStr());
      }).catch((err) => reject(err));
    });
  }
}
