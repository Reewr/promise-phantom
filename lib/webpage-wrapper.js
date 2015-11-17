"use strict";
let fs    = require('fs');
let utils = require('../lib/utils');

let isDef    = (x) => typeof x !== 'undefined' && x !== null;
let isNumber = (x) => typeof x === 'number';

class Page {
  constructor(page, options) {
    options = options || {};
    this.page = page;
    this.tempDir = options.temporaryDirectory;
  }

  /**
   * Sets the key to a value. Anything that would normally be a property in PhantomJS is
   * set through this function. If there are subproperties, you can do 'viewportSize.width'
   * @param {string}
   * @param {anything}
   */
  set(key, value) {
    return new Promise((resolve, reject) => {
      this.page.set(key, value, function() {
        resolve();
      });
    });
  }

  /**
   * Gets a value for a key. Anything that would normally be a property in PhantomJS can
   * be retrieved through this function. If there are subproperties, you can do
   * 'viewportSize.width' to retrieve the width of the of the viewport etc
   * @param  {string} key   [description]
   */
  get(key) {
    return new Promise((resolve, reject) => {
      this.page.get(key, function() {
        resolve.apply(null, arguments);
      });
    });
  }

  /**
   * Opens a website with PhantomJS. This website can be a local file
   * @param  {string} site Website to open. Can be local files
   */
  open(site, options) {
    return new Promise((resolve, reject) => {
      this.page.open(site, options, (status, err) => {
        if (err) {
          return reject(err);
        }
        resolve(status);
      });
    });
  }

  /**
   * evaluates a function within the scope of the page. An example would be:
   * @example
   * page.evaluate(function(title) {
   *   var text = document.querySelector('title').innerHTML = title;
   * }, ['This is my title']);
   * @param {function} fn Function to be evaulted in page-scope
   * @param {Array} args An array of arguments that will be sent to fn
   *
   * If anything is returned from the evaulted function, this will be sent through
   * resolve
   */
  evaluate(fn, args) {
    return new Promise((resolve, reject) => {
      if (!args) {
        args = [];
      } else if (!Array.isArray(args)) {
        args = [args];
      }

      let wrapperFn = function() {
        resolve.apply(null, arguments);
      };

      this.page.evaluate.apply(this.page, [fn, wrapperFn].concat(args));
    });
  }

  /**
   * @param  {string} filename The filename of where to render the file
   * @param  {object} options An object with settings, such as what format to use.
   */
  render(filename, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      this.page.render(filename, options, function() {
        resolve();
      });
    });
  }

  /**
   * @param  {string} Format to use when rendering ('png', 'jpeg'). PDF is not available
   * Will return the base64 string through the promise
   */
  renderBase64(format) {
    return new Promise((resolve, reject) => {
      this.page.renderBase64(format, function(base64, err) {
        if (err) {
          return reject(err);
        }

        resolve(base64);
      });
    });
  }

  /**
   * @private
   * @param  {string} loading async file that has already been rendered
   */
  _loadFile(filename) {
    let delFile = (handler, args) => {
      fs.unlink(filename, function(err) {
        handler.apply(null, args);
      });
    };

    return new Promise(function(resolve, reject) {
      fs.readFile(filename, function(err, data) {
        if (err) {
          return delFile(reject, [err]);
        }
        delFile(resolve, [data.toString()]);
      });
    });
  }

  /**
   * Renders a PDF and returns the content as a binary string. This needs to save
   * the file in order do this and therefore saves it in a temporary directory
   * with a unique filename. Deletes the file after it's read it.
   * @param  {object} options an Object of options, such as tempDir and format
   * @return {[type]}
   */
  renderPDF(options) {
    let tempDir = typeof options.tempDir === 'string' ? options.tempDir : this.tempDir;
    let loc = '';
    let setLoc = (fname) => {
      loc = tempDir + '/' + fname + '.pdf';
      return loc;
    };

    return new Promise((resolve, reject) => {
      utils.generateFilename()
      .then((fname) => this.render(setLoc(fname), options))
      .catch((err) => reject(err))
      .then(() => this._loadFile(loc))
      .catch((err) => reject(err))
      .then((fileContent) => resolve(fileContent))
      .catch((err) => reject(err));
    });
  }

  /**
   * Handler for catching console messages. The parameter will be a single
   * argument of type string
   * @param  {function} handler
   */
  onConsoleMessage(handler) {
    this.page.onConsoleMessage(handler);
  }

  /**
   * Whenever the URL is changed, the handler is called
   * @param  {function} handler
   */
  onUrlChanged(handler) {
    this.page.onUrlChanged(handler);
  }

  onResourceReceived(handler) {
    this.page.onResourceReceived(handler);
  }

  onLoadStarted(handler) {
    this.page.onLoadStarted(handler);
  }

  onLoadFinished(handler) {
    this.page.onLoadFinished(handler);
  }
}

module.exports = Page;
