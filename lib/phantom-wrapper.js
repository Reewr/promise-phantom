"use strict";
var WebPageWrapper = require('../lib/webpage-wrapper');
var utils = require('../lib/utils');

/**
 * @class
 * A small wrapper around the existing Phantom-object to make it play nice
 * with promises.
 */
class Phantom {
  constructor(phantom) {
    this.phantomInstance = phantom;
    this.process = phantom.phantom;
    this._hasExited = false;
  }

  /**
   * Throws if the phantom process has been exited.
   * @private
   */
  throwIfExited() {
    if (this._hasExited) {
      throw new Error('Do not use after calling .exit()');
    }
  }

  /**
   * Returns true if .exit() has been run.
   * @return {Boolean}
   */
  hasExited() {
    return this._hasExited;
  }

  /**
   * Creates a page, with certain options
   * This is equivalent to doing `webpage.create()` in PhantomJS
   * @promise {Object}
   */
  createPage() {
    this.throwIfExited();

    return new Promise((resolve, reject) => {
      this.phantomInstance.createPage(function(err, page) {
        if (err) {
          return reject(err);
        }
        resolve(new WebPageWrapper(page));
      });
    });
  }

  /**
   * *Developer Note*: Sets a proxy by different settings.
   * This function is undocumented and is not in the API of phantom.
   *
   * @param {string} ip        ip to the proxy
   * @param {string} port      Port of the proxy
   * @param {string} proxyType http, sock5 or non
   * @param {string} username  username of the proxy
   * @param {string} password  password of the proxy
   */
  setProxy(ip, port, proxyType, username, password) {
    this.throwIfExited();

    if (typeof ip !== 'string') {
      throw new TypeError('The proxy IP has to be a string');
    }

    if (typeof port !== 'string' || port !== 'number') {
      throw new TypeError('The proxy port has to be a string or number');
    }

    if (typeof proxyType !== 'string') {
      throw new TypeError('The proxy type has to be a string');
    }

    if (typeof username !== 'string') {
      throw new TypeError('The proxy username has to be a string');
    }

    if (typeof ip !== 'string') {
      throw new TypeError('The proxy password has to be a string');
    }

    return utils.genPromiseFn(this.phantomInstance, 'setProxy', ip, port, proxyType, username, password);
  }

  /**
   * [injectJs]{@link http://phantomjs.org/api/phantom/method/inject-js.html}
   *
   * Injects external script code from the specified file into
   * the Phantom outer space. If the file cannot be found in
   * the current directory, libraryPath is used for additional look up.
   * This function returns true if injection is successful,
   * otherwise it returns false.
   *
   * @param  {string} filename
   * @return {boolean} Whether successful or not
   */
  injectJs(filename) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'injectJs', filename);
  }

  /**
   * [addCookie]{@link http://phantomjs.org/api/phantom/method/add-cookie.html}
   *
   * Add a Cookie to the CookieJar.
   * Returns true if successfully added, othewise false
   *
   * Cookie object is as follows:
   * ```js
   * {
   *   domain  : string,
   *   value   : string,
   *   name    : string
   *   httponly: boolean,
   *   path    : string,
   *   secure  : boolean
   * }
   * ```
   *
   * @param {object}   cookie
   * @return {boolean} Whether successful or not
   */
  addCookie(cookie) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'addCookie', cookie);
  }

  getCookie(cookieName) {
    this.throwIfExited();
    if (typeof cookieName !== 'string' || cookieName.indexOf(' ') !== -1) {
      throw new TypeError('Cookie name has to be a non-space string');
    }

    return this.get('cookies').then((cookies) => {
      if (!cookies || cookies.length === 0) {
        return undefined;
      }

      let filteredCookies = cookies.filter(x => x.name === cookieName);

      if (filteredCookies.length === 0) {
        return undefined;
      }

      return filteredCookies[0];
    });
  }

  /**
   * [clearCookie]{@link http://phantomjs.org/api/phantom/method/clear-cookie.html}
   *
   * Delete all Cookies in the CookieJar
   */
  clearCookies() {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'clearCookies');
  }

  /**
   * [deleteCookie]{@link http://phantomjs.org/api/phantom/method/delete-cookie.html}
   *
   * Delete any Cookies in the CookieJar with a 'name' property
   * matching cookieName.
   * Returns true if successful, otherwise false
   *
   * @param  {string}  cookieName
   * @return {boolean} Whether successful or not
   */
  deleteCookie(cookieName) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'deleteCookie', cookieName);
  }

  /**
   * *node-phantom-simple specific function*
   *
   * Sets a property to a set value. The following can be changed:
   * - cookies
   * - cookiesEnabled
   * - libraryPath
   *
   * @param {string} property
   */
  set(property, value) {
    this.throwIfExited();

    if (Phantom.allowedSetProperties.indexOf(property) === -1) {
      let message = '"' + property + '" is not a property. Properties are: ';
      throw new TypeError(message + Phantom.allowedSetProperties.join('\n'));
    }

    return utils.genPromiseFn(this.phantomInstance, 'set', property, value);
  }

  /**
   * Returns a property, the following can be retrieved:
   * - cookies
   * - cookiesEnabled
   * - libraryPath
   * - scriptName *deprecated*
   * - args *deprecated*
   * - version
   *
   * @param  {string} property
   */
  get(property) {
    this.throwIfExited();

    if (Phantom.allowedGetProperties.indexOf(property) === -1) {
      let message = '"' + property + '" is not a property. Properties are: ';
      throw new TypeError(message + Phantom.allowedGetProperties.join('\n'));
    }

    return utils.genPromiseFn(this.phantomInstance, 'get', property);
  }

  /**
   * Exits the phantom process, will lock down all other functions
   */
  exit() {
    if (this._hasExited) {
      return;
    }

    this._hasExited = true;
    return utils.genPromiseFn(this.phantomInstance, 'exit');
  }

  /**
   * As the browser instance is a 'spawn' object, this
   * can be used to set certain event handlers on, such as
   * 'error'.
   */
  on() {
    this.throwIfExited();
    this.phantomInstance.on.apply(this.phantomInstance, arguments);
  }

}

/**
 * A list of allowed properties that are availble through .set
 *
 * @type {Array}
 */
Phantom.allowedSetProperties = [
  'cookies',        // Object
  'cookiesEnabled', // Booleam
  'libraryPath',    // String
];

/**
 * A list of allowed properties that is available through .get
 * The ones not retrieved from .allowedSetProperties are read-only values
 * properties
 *
 * @type {Array}
 */
Phantom.allowedGetProperties = [
  'version',     // Object
  'scriptName',  // String
  'args'         // Array(string)
].concat(Phantom.allowedSetProperties);


module.exports = Phantom;
