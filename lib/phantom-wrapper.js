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
      throw new TypeError('Do not use after calling .exit()');
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
   * Currently on one option is available.
   * @param  {object} options
   *   @param {string} options.temporaryDirectory Where to store temp files
   * @async
   */
  createPage(options) {
    this.throwIfExited();
    return new Promise((resolve, reject) => {
      this.phantomInstance.createPage(function(err, page) {
        if (err) {
          return reject(err);
        }
        resolve(new WebPageWrapper(page, options));
      });
    });
  }

  /**
   * *Developer Note*: Sets a proxy by different settings.
   * This function is undocumented and is not in the API of phantom.
   *
   * @param {string} ip        ip to the proxy
   * @param {string} port      Port of the proxy
   * @param {string} proxyType
   * @param {string} username
   * @param {string} password
   */
  setProxy(ip, port, proxyType, username, password) {
    this.throwIfExited();
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
   * @param {object} cookie
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
   * @param  {string} cookieName
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
   * @param {[type]} property [description]
   * @param {[type]} value    [description]
   */
  set(property, value) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'set', property, value);
  }

  /**
   * Returns a property, the following can be retrieved:
   * - cookies
   * - cookiesEnabled
   * - libraryPath
   * - scriptName
   * - version
   *
   * @param  {[type]} property [description]
   * @return {[type]}          [description]
   */
  get(property) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'get', property);
  }

  /**
   * Exits the phantom process
   */
  exit() {
    this.throwIfExited();
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

module.exports = Phantom;
