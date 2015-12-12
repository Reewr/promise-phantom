"use strict";
const crypto  = require('crypto');
const fs      = require('fs');

// Taken from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
const isNumber = /^(\-|\+)?([0-9]+|Infinity)$/;

/**
 * Formats a string so that it has a nice name that can be used as filename
 *
 * @param  {string}
 * @return {string}
 */
const toFilenameFriendly = function(str) {
  return str.replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '_');
};

/**
 * Calls crypto.randomBytes with a promise wrapper
 *
 * @async
 * @param  {[type]} num [description]
 * @return {[type]}     [description]
 */
const randomBytes = function(num) {
  return module.exports.genPromiseFn(crypto, 'randomBytes', num);
};

/**
 * Returns a string through promise that is a random ID. This is used
 * for temporary storage of files
 *
 * @async
 * @return {string}
 */
const getId = function() {
  return new Promise(function(resolve, reject) {
    randomBytes(32)
      .then((buf) => toFilenameFriendly(buf.toString('base64')))
      .then((str) => resolve(str))
      .catch((err) => reject(err)); // Should never happen,
                                    // except when lacking entropy in OS
                                    // Can happen after OS startup
  });
};

module.exports = {

  /**
   * Checks if a number is between two values. If the input is a string,
   * parseInt is performed after checking that is indeed a valid number
   *
   * Non-numbers, NaN or Infinity returns false
   *
   * @param  {number}         min      minimum number
   * @param  {number}         max      maxmimum number
   * @param  {string|number}  strOrNum the string or number to check
   * @return {Boolean}
   */
  isBetween(min, max, strOrNum) {
    if (typeof strOrNum === 'string' && !isNumber.test(strOrNum)) {
      return false;
    }

    if (typeof strOrNum === 'string') {
      strOrNum = parseInt(strOrNum);
    }

    if (isNaN(strOrNum) || !isFinite(strOrNum)) {
      return false;
    }

    return strOrNum > min && strOrNum < max;
  },

  /**
   * This function generates a filename that should be unique. It is composed
   * of a randomly generated ID as well as the datetime as it is called.
   *
   * @async
   * @return {string}
   */
  generateFilename: function() {
    return new Promise(function(resolve, reject) {
      getId()
        .then((id) => resolve(id + '_' + Date.now()))
        .catch((err) => reject(err)); // Shouldn't happen, See .catch in getId
    });
  },

  /**
   * uses fs.lstat to get the stat object - used by isDir
   *
   * @async
   * @param  {string} location
   * @return {err|stat}
   */
  lstat: function(location) {
    return module.exports.genPromiseFn(fs, 'lstat', location);
  },

  /**
   * Returns true in a promise if the parameter is a directory.
   *
   * @async
   * @param  {string}  directory
   * @return {Boolean}
   */
  isDir: function(directory) {
    return module.exports.lstat(directory)
      .then((stat) => stat.isDirectory(directory));
  },

  /**
   * Uses fs.readFile to load a file by promise
   *
   * @async
   * @param  {string} filename
   * @returns {buffer|err}
   */
  loadFile: function(filename) {
    return module.exports.genPromiseFn(fs, 'readFile', filename);
  },

  /**
   * Uses fs.writeFile to save a file by promise
   *
   * @async
   * @param  {string} filename [description]
   * @param  {string} content  [description]
   */
  saveFile: function(filename, content) {
    return module.exports.genPromiseFn(fs, 'writeFile', filename, content);
  },

  /**
   * Uses fs.unlink to delete a file by promise
   *
   * @async
   * @param  {string} filename
   */
  deleteFile: function(filename) {
    return module.exports.genPromiseFn(fs, 'unlink', filename);
  },

  /**
   * Promise version of setTimeout
   *
   * @param  {number} time how long to wait in ms
   */
  wait: function(time) {
    time = typeof time === 'number' ? time : 0;
    return new Promise(function(resolve) {
      setTimeout(() => resolve(), time);
    });
  },

  /**
   * Generates a generic promise function that just calls a function with name
   * key, on the instance. All this does is that it sends all the arguments
   * on to the function.
   *
   * This function expects that the function that is wrapped is using node-convention
   * of error / success. For instance, it will work on all 'fs' functions
   * as they expect the last argument to be a callback of type `function(err, result)`
   *
   * @example
   * var fs = require('fs');
   * utils.genPromise(fs, 'readFile', filename)
   *   .then((data) => doSomething(data))
   *   .catch((err) => doSomethingElse(err));
   *
   * @async
   * @param  {Object} instance
   * @param  {string} key
   * @return {promise}
   */
  genPromiseFn: function(instance, key) {
    if (!instance || typeof instance !== 'object') {
      throw new TypeError('Instance-argument must be an object');
    }

    if (typeof key !== 'string') {
      throw new TypeError('Key-argument must be a string');
    }

    if (!instance || typeof instance[key] !== 'function') {
      throw new TypeError('Invalid key: "' + key + '" - function does not exist');
    }

    // Non-leaking arguments
    let len  = arguments.length - 2;
    let args = [];

    for(let i = 0; i < len; i++) {
      args[i] = arguments[i+2];
    }

    return new Promise((resolve, reject) => {
      let handler = function(err) {
        if (err) {
          return reject(err);
        }

        // Non-leaking arguments
        let len2  = arguments.length - 1;
        let args2 = [];

        for(let i = 0; i < len2; i++) {
          args2[i] = arguments[i+1];
        }

        resolve.apply(null, args2);
      };

      args.push(handler);

      instance[key].apply(instance, args);
    });
  }
};
