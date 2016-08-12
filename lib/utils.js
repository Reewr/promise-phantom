"use strict";
const crypto = require('crypto');
const fs     = require('fs');
const tmp    = require('tmp');
const mkpath = require('mkpath');

// Taken from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
const isNumber = /^(\-|\+)?([0-9]+|Infinity)$/;

// Taken from:
// https://github.com/ljharb/is-arrow-function
// but extracted as it had dependencies I did not need.
const isArrowFnWithParensRegex = /^\([^\)]*\) *=>/;
const isArrowFnWithoutParensRegex = /^[^=]*=>/;
const isNonArrowFnRegex = /^\s*function/;

const stripSlashes = /\/\//g;
const stripDots    = /\/\.+/g;

/**
 * Formats a string so that it has a nice name that can be used as filename
 *
 * @private
 * @param  {String}
 * @return {String}
 */
const toFilenameFriendly = function(str) {
  return str.replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '_');
};

/**
 * Calls crypto.randomBytes with a promise wrapper
 *
 * @private
 * @param  {Number} num number of bytes to use
 * @returns {Promise(String)}
 */
const randomBytes = function(num) {
  return module.exports.genPromiseFn(crypto, 'randomBytes', num);
};

/**
 * Returns a string through promise that is a random ID. This is used
 * for temporary storage of files
 *
 * @private
 * @returns {Promise(String)}
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
   * @module utils
   */

  /**
   * Uses fs.unlink to delete a file by promise
   *
   * @param  {String} filename
   * @returns {Promise()}
   */
  deleteFile: function(filename) {
    return module.exports.genPromiseFn(fs, 'unlink', filename);
  },

  /**
   * This function generates a filename that should be unique. It is composed
   * of a randomly generated ID as well as the datetime as it is called.
   *
   * @returns {Promise(String)}
   */
  generateFilename: function() {
    return new Promise(function(resolve, reject) {
      getId()
        .then((id) => resolve(id + '_' + Date.now()))
        .catch((err) => reject(err)); // Shouldn't happen, See .catch in getId
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
   * @param  {String} key
   * @return {Promise(Value)}
   */
  genPromiseFn: function(instance, key) {
    if (!instance || typeof instance !== 'object') {
      throw new TypeError('Instance-argument must be an object');
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
  },

  /**
   * Checks if a given function evaluates to an arrow function.
   *
   * @param {Function} fn the function to check
   * @returns {Boolean} true if it is an arrow function, otherwise false
   */
  isArrowFunction: function(fn) {
    var fnStr = fn.toString();
    return fnStr.length > 0 && !isNonArrowFnRegex.test(fnStr) &&
      (isArrowFnWithParensRegex.test(fnStr) || isArrowFnWithoutParensRegex.test(fnStr));
  },

  /**
   * Checks if a number is between two values. If the input is a string,
   * parseInt is performed after checking that it is indeed a valid number
   *
   * Non-numbers, NaN or Infinity returns false
   *
   * @param  {Number}         min      minimum number
   * @param  {Number}         max      maxmimum number
   * @param  {String|Number}  strOrNum the string or number to check
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
   * Returns true in a promise if the parameter is a directory.
   *
   * @param  {String}  directory
   * @returns {Promise(Boolean)}
   */
  isDir: function(directory) {
    return module.exports.lstat(directory)
      .then((stat) => stat.isDirectory(directory));
  },

  /**
   * Uses fs.readFile to load a file by promise
   *
   * @param  {String} filename
   * @returns {Promise(Buffer)}
   */
  loadFile: function(filename) {
    return module.exports.genPromiseFn(fs, 'readFile', filename);
  },

  /**
   * uses fs.lstat to get the stat object - used by isDir
   *
   * @param  {String} location
   * @returns {Promise(Stat)}
   */
  lstat: function(location) {
    return module.exports.genPromiseFn(fs, 'lstat', location);
  },

  /**
   * Promise-wrapper for mkpath. Creates all needed folders to a specific path
   *
   * @param {String} dirpath path to create
   * @param {String} mode mode to set on the folders
   * @returns {Promise()}
   */
  mkpath: function(dirpath, mode) {
    return new Promise((resolve, reject) => {
      let handler = function(err) {
        if (err) {
          return reject(err);
        }

        resolve();
      };

      if (mode) {
        return mkpath(dirpath, mode, handler);
      }

      mkpath(dirpath, handler);
    });
  },

  /**
   * Uses fs.writeFile to save a file by promise
   *
   * @param  {String} filename [description]
   * @param  {String} content  [description]
   * @returns {Promise()}
   */
  saveFile: function(filename, content) {
    return module.exports.genPromiseFn(fs, 'writeFile', filename, content);
  },

  /**
   * Strips certain characters within a string to make it more safe
   *
   * @param {String} filename filname to strip
   * @returns {String}
   */
  stripFilename: function(filename) {
    return filename.replace(stripSlashes, '/').replace(stripDots, '');
  },

  tmp: {

    /**
     * A promise wrapper around tmp.dir
     *
     * @param {Object|Undefined} options a list of options for tmp.dir
     * @returns {Promise({path, cleanup})}
     */
    dir: function(options) {
      return new Promise((resolve, reject) => {
        let fn = (err, path, cleanup) => {
          if (err) {
            return reject(err);
          }

          resolve({path: path, cleanup: cleanup});
        };

        if (options) {
          return tmp.dir(options, fn);
        }

        tmp.dir(fn);
      });
    },

    /**
     * A promise wrapper around tmp.file
     *
     * @param {Object|Undefined} options a list of options for tmp.file
     * @returns {Promise({path, fd, cleanup})}
     */
    file: function(options) {
      return new Promise((resolve, reject) => {
        let fn = (err, filePath, fd, cleanup) => {
          if (err) {
            return reject(err);
          }

          resolve({path: filePath, fd: fd, cleanup: cleanup});
        };

        if (options) {
          return tmp.file(options, fn);
        }

        tmp.file(fn);
      });
    }

  },

  /**
   * Promise version of setTimeout
   *
   * @param  {Number} time how long to wait in ms
   * @returns {Promise()}
   */
  wait: function(time) {
    time = typeof time === 'number' ? time : 0;
    return new Promise(function(resolve) {
      setTimeout(() => resolve(), time);
    });
  }
};
