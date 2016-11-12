"use strict";
var WebPage = require('../lib/webpage');
var utils   = require('../lib/utils');

/**
 * The Phantom Class contains all the functionality that would otherwise
 * be in the global `phantom`-object in PhantomJS.
 *
 * All functions that are part of PhantomJS' API include the documentation
 * from their webpage. Comments outside of the PhantomJS docs will include a
 * *Developer Note*-tag. In addition, all functions that can be found in the
 * API also have links to the respective pages. All functions are listed in alphabetical order
 *
 * The full PhantomJS documentation for the Phantom object can be found [here]{@link http://phantomjs.org/api/phantom/}
 */
class Phantom {
  constructor(phantom) {
    this.phantomInstance = phantom;
    this.process = phantom.phantom;
    this._hasExited = false;
  }

  /**
   * *Wrapper specific*
   *
   * Throws if the phantom process has been exited.
   *
   * @private
   */
  throwIfExited() {
    if (this._hasExited) {
      throw new Error('Do not use after calling .exit()');
    }
  }

  /**
   * [addCookie]{@link http://phantomjs.org/api/phantom/method/add-cookie.html}
   *
   * Add a Cookie to the CookieJar.
   *
   * Cookie object is as follows:
   * ```js
   * {
   *   domain  : string,
   *   value   : string, // required
   *   name    : string, // required
   *   httponly: boolean,
   *   path    : string,
   *   secure  : boolean
   * }
   * ```
   *
   * @param {Object} cookie
   * @returns {Promise(Boolean)} Whether successful or not
   */
  addCookie(cookie) {
    this.throwIfExited();

    if (typeof cookie !== 'object') {
      throw new TypeError('Cookie has to be an object');
    }

    if (typeof cookie.name !== 'string' || cookie.name.indexOf(' ') !== -1) {
      throw new TypeError('Cookie.name has to be a non-spaced string');
    }

    if (typeof cookie.value !== 'string') {
      throw new TypeError('Cookie.value must be a string');
    }

    return utils.genPromiseFn(this.phantomInstance, 'addCookie', cookie);
  }

  /**
   * [clearCookie]{@link http://phantomjs.org/api/phantom/method/clear-cookies.html}
   *
   * Delete all Cookies in the CookieJar
   *
   * @returns {Promise(Boolean)}
   */
  clearCookies() {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'clearCookies');
  }


  /**
   * Creates a Page. This is equivalent to doing `webpage.create()` in PhantomJS
   *
   * See [webpage docs]{@link ./webpage.md} for how to use the Page object
   *
   * @returns {Promise(Page)}
   */
  createPage() {
    this.throwIfExited();

    return new Promise((resolve, reject) => {
      this.phantomInstance.createPage(function(err, page) {
        if (err) {
          return reject(err);
        }
        resolve(new WebPage(page));
      });
    });
  }

  /**
   * [deleteCookie]{@link http://phantomjs.org/api/phantom/method/delete-cookie.html}
   *
   * Delete any Cookies in the CookieJar with a 'name' property
   * matching cookieName.
   * Returns true if successful, otherwise false
   *
   * @param  {String} cookieName
   * @returns {Promise(Boolean)} Whether successful or not
   */
  deleteCookie(cookieName) {
    this.throwIfExited();
    return utils.genPromiseFn(this.phantomInstance, 'deleteCookie', cookieName);
  }

  /**
   * [exit]{@link http://phantomjs.org/api/phantom/method/exit.html}
   *
   * Exits the phantom process, will lock down all other functions
   *
   * @returns {Promise()}
   */
  exit() {
    return new Promise((resolve, reject) => {
      if (this._hasExited) {
        return resolve();
      }
      this._hasExited = true;

      this.phantomInstance.exit(function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * *node-phantom-simple specific*
   *
   * Returns a property, the following can be retrieved:
   * - cookies
   * - cookiesEnabled
   * - libraryPath
   * - scriptName *deprecated*
   * - args *deprecated*
   * - version
   *
   * @param  {String} property
   * @returns {Promise(Value)}
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
   * *Wrapper specific*
   *
   * Retrieves a cookie by name. Does this by retrieving the cookie array
   * and finding the cookie that has the cookieName.
   *
   * @param  {String} cookieName name of the cookie (cannot contain spaces)
   * @returns {Promise(Undefined)|Promise(object)} Undefined if not found, otherwise cookie
   */
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
   * *Wrapper specific*
   *
   * Returns true if `phantom.exit()` has been run.
   *
   * @return {Boolean}
   */
  hasExited() {
    return this._hasExited;
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
   * @param  {String} filename
   * @returns {Promise(Boolean)} true if successful, false if not
   */
  injectJs(filename) {
    this.throwIfExited();

    if (typeof filename !== 'string') {
      throw new TypeError('Filename has to be a string');
    }

    return utils.genPromiseFn(this.phantomInstance, 'injectJs', filename);
  }

  /**
   * *node-phantom-simple specific*
   *
   * As the browser instance is a 'spawn' object, this
   * can be used to set certain event handlers on, such as
   * 'error'. All arguments are sent to the node-phantom-simples `on` handler
   */
  on() {
    this.throwIfExited();

    this.phantomInstance.on.apply(this.phantomInstance, arguments);
  }

  /**
   * *node-phantom-simple specific*
   *
   * Sets a property to a set value. The following can be changed:
   * - cookies
   * - cookiesEnabled
   * - libraryPath
   *
   * @param {String} property
   * @returns {Promise(Boolean)}
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
   * *Developer Note*: Sets a proxy by different settings.
   * This function is undocumented and is not in the API-documentation of PhantomJS.
   *
   * @param {String} ip        ip to the proxy
   * @param {String} port      Port of the proxy
   * @param {String} proxyType http, sock5 or non
   * @param {String} username  username of the proxy
   * @param {String} password  password of the proxy
   * @returns {Promise()}
   */
  setProxy(ip, port, proxyType, username, password) {
    this.throwIfExited();

    if (typeof ip !== 'string') {
      throw new TypeError('The proxy IP has to be a string');
    }

    if (typeof port !== 'string' && typeof port !== 'number') {
      throw new TypeError('The proxy port has to be a string or number');
    }

    if (typeof proxyType !== 'string') {
      throw new TypeError('The proxy type has to be a string');
    }

    if (typeof username !== 'string') {
      throw new TypeError('The proxy username has to be a string');
    }

    if (typeof password !== 'string') {
      throw new TypeError('The proxy password has to be a string');
    }

    return utils.genPromiseFn(this.phantomInstance, 'setProxy', ip, port, proxyType, username, password);
  }
}

/**
 * A list of allowed properties that are available through .set
 *
 * @private
 * @type {String[]}
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
 * @private
 * @type {String[]}
 */
Phantom.allowedGetProperties = [
  'version',     // Object
  'scriptName',  // String
  'args'         // Array(string)
].concat(Phantom.allowedSetProperties);


module.exports = Phantom;
