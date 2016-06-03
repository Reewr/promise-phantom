"use strict";
const driver  = require('node-phantom-simple');
const Phantom = require('./lib/phantom');

/**
 * @module promise-phantom
 */

module.exports = {

  /**
   * The main function of the promise-phantom. This creates a new
   * phantom object * that is used to, for instance, create pages.
   * Using this function starts up a web-server of PhantomJS
   * through node-phantom-simple.
   *
   * The options object has three different variables that are allowed:
   * - *options.path*, a string to where phantomJS executable is located
   * - *options.ignoreErrorPattern*, a regex that can be used to silence
   *                                 warnings generated by Qt and PhantomJS.
   * - *options.parameters*, an object of key/value pair sent to PhantomJS.
   *
   * [commandLine options]{@link http://phantomjs.org/api/command-line.html}
   *
   * The following settings are allowed in `options.parameters`:
   *
   * Name                          | Values                   | Description
   * ----------------------------- | ------------------------ | -------------------------------
   * `cookies-file`                | /path/to/cookies.txt     | Specifies the file name to store the persistent Cookies.
   * `disk-cache`                  | true, false, yes, no     | Enables disk cache (at desktop services cache storage location, default is false).
   * `ignore-ssl-errors`           | true, false, yes, no     | Ignores SSL errors, such as expired or self-signed certificate errors (default is false).
   * `load-images`                 | true, false, yes, no     | Load all inlined images (default is true).
   * `local-storage-path`          | string                   | Path to save LocalStorage content and WebSQL content.
   * `local-storage-quota`         | number                   | Number maximum size to allow for data.
   * `local-to-remote-url-access`  | true, false, yes, no     | Allows local content to access remote URL (default is false).
   * `max-disk-cache-size`         | number                   | Size limits the size of disk cache (in KB).
   * `output-encoding`             | string                   | Encoding sets the encoding used for terminal output (default is utf8).
   * `remote-debugger-port`        | number                   | Starts the script in a debug harness and listens on the specified port
   * `remote-debugger-autorun`     | string                   | Runs the script in the debugger immediately: `yes` or `no` (default)
   * `proxy=address`               | string                   | Specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080).
   * `proxy-type`                  | http, socks5, none       | Specifies the type of the proxy server (default is http).
   * `proxy-auth`                  | string                   | Specifies the authentication information for the proxy, e.g. --proxy-auth=username:password).
   * `script-encoding`             | string                   | Encoding sets the encoding used for the starting script (default is utf8).
   * `ssl-protocol`                | sslv3, sslv2, tlsv1, any | Sets the SSL protocol for secure connections (default is SSLv3).
   * `ssl-certificates-path`       | value                    | Sets the location for custom CA certificates (if none set, uses system default).
   * `web-security`                | true, false, yes, no     | Enables web security and forbids cross-domain XHR (default is true).
   * `webdriver`                   | string                   | Starts in `Remote WebDriver mode` (embedded GhostDriver): `[[:]]` (default `127.0.0.1:8910`)
   * `webdriver-selenium-grid-hub` | string                   | URL to the Selenium Grid HUB: `URLTOHUB` (default `none`) (NOTE: works only together with `--webdriver`)
   *
   * As of version 2.2.3 of node-phantom-simple, the parameter option may also
   * be an array of verbatim keys and values.name
   *
   * See [Phantom]{@link ./phantom.md} for more info regarding the
   * promised Phantom-object
   *
   * @param {object} options
   * @param {string} options.path Path to phantomJS/SlimerJS.
   *                              If this is not set, node-phantom-simple
   *                              will search $PATH
   * @param {object} options.parameters An object of key/value of options for PhantomJS
   * @promise {Phantom} A wrapper around the Browser object
   * @example
   * var driver = require('promise-phantom');
   * driver.create({
   *   path: '/path/to/phantomjs',
   *   parameters: {
   *     'ignore-ssl-errors': 'yes',
   *     'ssl-protocol': 'any'
   *   }
   * }).then(() => {
   *   console.log('Driver is ready');
   * }).catch((err) => {
   *   console.log('An error occured', err);
   * });
   */
  create: function(options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      driver.create(options, function(err, browser) {
        if (err) {
          return reject(err);
        }
        resolve(new Phantom(browser));
      });
    });
  }
};
