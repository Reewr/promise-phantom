"use strict";
const utils = require('../lib/utils');
const path  = require('path');
const co    = require('co');

/**
 * Prints a line which specifies that the inputted function cannot use ES6 syntax
 *
 * @private
 * @param {Boolean} silenced if true, nothing will be outputted
 * @param {String} fnName name of the function
 */
const printDeprecatedArrowFn = function(silenced, fnName) {
  if (!silenced) {
    console.error('DEPRECATED - ES6 syntax are not supported with `%s`. See doc. Please use ES5 syntax!', fnName);
  }
};

/**
 * The Page object contains most of the functionality of PhantomJS and it is
 * what you will be interacting with the most of the time when using this wrapper.
 *
 * This wrapper does not contain functions that has been marked by PhantomJS as
 * deprecated. If you really need the functionality of these functions, they can
 * be retrieved through page.page.deprecatedFunction(callback), but I would
 * advise you not to do that.
 *
 * The following functions have been declared deprecated by PhantomJS:
 * - childFramesCount
 * - childFramesName
 * - currentFrameName
 * - release (use close instead)
 * - switchToChildFrame
 *
 * In addition to all the functions mentioned by the PhantomJS API, this wrapper
 * also contains some utility functions that makes it easier to use production
 * where you would need to create PDF reports.
 *
 * The added functions are:
 * - addLocalResource
 * - clearLocalResources
 * - getCookie
 * - getLocalResource
 * - openTemplate
 * - openHtml
 * - removeLocalResource
 * - renderPdf
 * - renderTemplate
 * - renderHtml
 *
 * All functions that are part of PhantomJS' API include the documentation
 * from their webpage. Comments outside of the PhantomJS docs will include a
 * *Developer Note*-tag. In addition, all functions that can be found in the
 * API also have links to the respective pages.
 *
 * The full documentation for the PhanomJS page can be found at [here]{@link http://phantomjs.org/api/webpage/}
 *
 * There are multiple functions that send functions to PhantomJS, such as `page.evaluate` or `page.setFn`. Sadly,
 * PhantomJS does not support ES6 yet. In v3, all of these functions will try to warn on ES6 syntax. It currently
 * only warns on arrow functions. In v4, these warnings will become thrown errors. Please use ES5 syntax for these
 * functions.
 *
 * These deprecated warnings can be silenced by setting `page.deprecateSilence` to `false`.
 *
 * All functions are listed in alphabetical order
 */
class Page {
  constructor(page) {
    this.page             = page;
    this.deprecateSilence = false;
    this._closed          = false;
    this._localResources  = [];

    this._onLoadFinishedHandlers = [];
    this._onLoadQueue = [];
    this.page.onLoadFinished = (status) => {
      this._startedLoading = false;
      this._onLoadQueue.forEach(x => x());
      this._onLoadFinishedHandlers.forEach(x => x(status));
    };
  }

  /**
   * Opens a HTML file using .set('content') - helper
   * function for openHtml
   *
   * @private
   * @param  {String} htmlString
   * @param  {String} templateRenderDir
   * @returns {Promise(String)} status either success or fail
   */
  *_openHtml(htmlString) {
    let options  = yield utils.tmp.dir({unsafeCleanup: true});
    let filename = yield utils.generateFilename();
    let fullPath = options.path + '/' + filename + '.html';

    yield utils.saveFile(fullPath, htmlString);

    yield this._saveLocalResources(options);

    let status = yield this.open(fullPath);

    yield this.waitForLoad();

    options.cleanup();

    return status;
  }

  /**
   * Opens a HTML file in a render directory so that it can correctly
   * load local files included in the HTML
   * Helper function for openHtml
   * Uses co to simplify the syntax due to promise uses
   *
   * @private
   * @param  {String} htmlString
   * @param  {String} templateRenderDir
   * @returns {Promise(String)} either success or fail
   */
  *_openHtmlInRenderDir(htmlString, templateRenderDir) {
    let isDir = yield utils.isDir(templateRenderDir);

    if (!isDir) {
      throw new Error('Render directory is not a directory');
    }

    let generatedFilename = yield utils.generateFilename();
    let fname = templateRenderDir + '/' + generatedFilename + '.html';

    yield utils.saveFile(fname, htmlString);
    let status = yield this.open(fname);

    yield utils.deleteFile(fname);

    return status;
  }


  /**
   * Saves all the local resources to a temporary directory
   * that is given to this function.
   *
   * This function will create paths as needed depending
   * on what the local resources specifies
   *
   * @private
   * @param {String} directory path to the directory
   * @returns {Promise()}
   */
  *_saveLocalResources(directory) {
    for(var file of this._localResources) {
      let filename = directory.path + '/' + file.filename;
      filename = utils.stripFilename(filename);

      let path = filename.split('/');
      path.pop();

      if (path.length > 0) {
        yield utils.mkpath(path.join('/'));
      }

      yield utils.saveFile(filename, file.content);
    }
  }

  /**
   * Sets a handler by the name given and checks the handler
   * to see whether it is a function or not.
   * Throws TypeError if it isn't a function.
   *
   * @private
   * @param {String}   name    name of the handler
   * @param {Function} handler
   */
  _setHandler(name, handler) {
    this.throwIfClosed();

    if (typeof handler !== 'function') {
      throw new TypeError('Handler needs to be a function');
    }

    if (name === 'onLoadFinished') {
      this._onLoadFinishedHandlers.push(handler);
    }

    this.page[name] = handler;
  }

  /**
   * *Wrapper-specific*
   *
   * Throws an error if the page has been called `close` on.
   * @private
   */
  throwIfClosed() {
    if (this._closed) {
      throw new Error('Do not use the page object after page.close()');
    }
  }

  /**
   * *Wrapper Specific*
   *
   * This allows you to set multiple settings in one go. This does exactly the
   * same as multiple this.set calls.
   *
   * In addition to this, it also checks if all values are correct according
   * to the PhantomJS docs. Some options are missing from the check
   * and will not be validated, as they lack documentation. These are the following:
   *
   * *NOT YET IMPLEMENTED*
   *
   * - event
   * - focusedFrameName
   * - frameTitle
   * - frameCount
   * - offlineStoragePath
   * - offlineStorageQuota
   * - ownsPages
   * - pages
   * - pagesWindowName
   * - windowName
   *
   * The following options are read-only values are will throw errors when used:
   * - framePlainText
   * - frameUrl
   * - framesName
   *
   * @private
   * @param {Object} options An object with multiple options
   * @returns {Promise()}
   */
  NYI_setOptions() {throw new Error('Not yet implemented');}

  /**
   * [addCookie]{@link http://phantomjs.org/api/webpage/method/add-cookie.html}
   *
   * Adds a cookie to the webpage. Settings can be seen below. Some are required
   *
   * @param {Object} options
   *   @param {String}           options.name            A valid cookie name
   *   @param {String}           options.value           A cookie value
   *   @param {String}           options.path            The path of the cookie
   *   @param {String}           options.domain=string   The domain of the cookie
   *   @param {Boolean}          options.httponly=false  Whether to use HTTP only.
   *   @param {Boolean}          options.secure=false    Whether it should be secure or not
   *   @param {Number}           options.expires         Number of milliseconds given
   *                                                     with Date.now / Date.getTime
   *                                                      it should be valid
   * @returns {Promise(Boolean)} true if successful, false if not
   */
  addCookie(options) {
    this.throwIfClosed();

    if (!options || typeof options !== 'object') {
      throw new TypeError('Options has to be an object');
    }
    if (typeof options.name !== 'string') {
      throw new TypeError('Options.name has to be defined as a string');
    }

    if (typeof options.value !== 'string') {
      throw new TypeError('Options.value has to be defined as a string');
    }

    if (typeof options.path !== 'string') {
      throw new TypeError('Options.path has to be defined as a string');
    }

    return utils.genPromiseFn(this.page, 'addCookie', options);
  }

  /**
   * *Wrapper Specific*
   *
   * Adds a local resource for use in pages that are rendered
   * using temporary files. As they pages themselves are
   * located within the temp directories of the operating
   * system (/tmp etc), including images, fonts and other
   * resources can be tricky.
   *
   * If you need a local resource to be available, be it font,
   * image, css or javascript, you can add these using this
   * function. All files located within the local resource
   * storage of this page will be available when the page
   * is loaded.
   *
   * @example
   * let page = yield phantom.createPage();
   * let css  = 'body {background-color: #ccc;}';
   * let html = '' +
   *   '<html>' +
   *     '<head>' +
   *       '<title>Title</title>' +
   *       '<link rel="stylesheet" href="css/my-css-file.css">' +
   *     '</head>' +
   *   '</html>';
   *
   * let cssBuffer = new Buffer(css);
   *
   * page.addLocalResource({
   *   name    : 'mycssfile',
   *   filename: 'css/my-css-file.css',
   *   content : cssBuffer
   * });
   *
   * let status = yield page.openHtml(html);
   *
   * @param {Object} options
   * @param {String} options.name Unique name, used for retrieval/removal
   * @param {Buffer} options.content A buffer of the file content
   * @param {String} options.filename Full filename and directory of
   *                                   the file as it should be stored
   *                                   in the temporary directory in
   *                                   order to be retrievable by the page
   *
   */
  addLocalResource(options) {
    if (!options) {
      throw new TypeError('Options must be an object');
    }

    if (typeof options.name !== 'string' || options.name === '') {
      throw new TypeError('Name of the resource must be a defined string');
    }

    if (typeof options.filename !== 'string' || options.filename === '') {
      throw new TypeError('Filename must be a defined string');
    }

    let isBuffer = options.content instanceof Buffer;

    if (!isBuffer) {
      throw new TypeError('options.content must be a buffer');
    }

    this._localResources.push(options);
  }

  /**
   * [clearCookie]{@link http://phantomjs.org/api/webpage/method/clear-cookies.html}
   *
   * Deletes all the cookies visible to the current URL.
   *
   * @returns {Promise(Boolean)}
   */
  clearCookies() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'clearCookies');
  }

  /**
   * *Wrapper Specific*
   *
   * Removes all resouces within the resource-list
   *
   * @returns {Boolean} returns true if some were removed, otherwise false
   */
  clearLocalResources() {
    if (this._localResources.length === 0) {
      return false;
    }

    this._localResources = [];

    return true;
  }

  /**
   * *Developer Note*: There is little to no documentation on this function,
   * but from what I can gather from an [issue]{@link https://github.com/ariya/phantomjs/issues/10357}
   * on their github, this function clears the HTTP-cache.
   * [Commit]{@link https://github.com/ariya/phantomjs/commit/5768b705a019da719fa356fdbf370f3ea72b4c93}
   *
   * @returns {Promise()}
   */
  clearMemoryCache() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'clearMemoryCache');
  }

  /**
   * [close]{@link http://phantomjs.org/api/webpage/method/close.html}
   *
   * Closes the page and releases the memory heap associated with it. Do
   * not use the page instance after calling this.
   *
   * Due to some technical limitations, the page object might not be completely
   * garbage collected. This is often encountered when the same object is used
   * over and over again. Calling this function may stop the increasing
   * heap allocation
   *
   * *Developer note*: Calling this function will lock down all the other
   * functions, causing them to throw errors if they are used.
   *
   * @returns {Promise()}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this._closed) {
        return resolve();
      }

      this._closed = true;
      utils.genPromiseFn(this.page, 'close')
        .then(() => {
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * [deleteCookie]{@link http://phantomjs.org/api/webpage/method/delete-cookie.html}
   *
   * Delete any Cookies visible to the current URL with a name that matches
   * the argument.
   *
   * @param {String} name Cookie name
   * @returns {Promise(Boolean)} true if successful, false if not.
   */
  deleteCookie(name) {
    this.throwIfClosed();

    if (typeof name !== 'string') {
      throw new TypeError('Name needs to be a string');
    }

    return utils.genPromiseFn(this.page, 'deleteCookie', name);
  }

  /**
   * [evaluate]{@link http://phantomjs.org/api/webpage/method/evaluate.html}
   *
   * Evaluates the given function in the context of the web page. The execution
   * is sandboxed. Any extra arguments to this function will be sent to the sandboxed
   * function in the same order. These arguments has to be serializeable!
   *
   * The function can also return value. However, this functionality is still a
   * bit unstable and can therefore cause undefined returns. The return value
   * has to be JSON.stringifiable.
   *
   * **Note**: If the value argument is a function it should not
   * include any ES6 syntax, including arrow functions. This
   * is due to it being stringified and sent to PhantomJS which evaluates
   * it and PhantomJS only supports ES5. This will be an error in v4
   *
   * **Developer Note**: Errors that are thrown by this function, through either
   * `throw new Error()` or other methods, will not be caught by the evaluated
   * function. These are instead caught by the `page.onError` handler.
   *
   * @example
   * page.evaluate(function(name, id) {
   *   document.body.setAttribute('name', name);
   *   document.body.setAttribute('id', id);
   *   return document.getElementById('my-div').textContent;
   * }, 'name-of-body', 'id-of-body').then((textContent) => {
   *   // do something with text content
   * });
   *
   * @param  {Function} fn function to be evaluated
   * @returns {Promise(StringifiableValue)}
   */
  evaluate(fn) {
    this.throwIfClosed();

    if (typeof fn !== 'function') {
      throw new TypeError('First argument must be the function that is to be evaluted');
    }

    if (utils.isArrowFunction(fn)) {
      printDeprecatedArrowFn(this.deprecateSilence, 'page.evaluate');
    }

    // Non-leaking arguments
    let len  = arguments.length - 1;
    let args = [];

    for(let i = 0; i < len; i++) {
      args[i] = arguments[i+1];
    }

    return utils.genPromiseFn.apply(utils, [this.page, 'evaluate', fn].concat(args));
  }

  /**
   * [evaluateJavaScript]{@link http://phantomjs.org/api/webpage/method/evaluate-java-script.html}
   *
   * Evaluate a function as a string. Evaluates the given function string in the context
   * of the webpage. It is very familiar with `evaluate`.
   *
   * @param {String} javaScriptStr
   * @returns {Promise()}
   */
  evaluateJavaScript(javaScriptStr) {
    this.throwIfClosed();

    if (typeof javaScriptStr !== 'string') {
      throw new TypeError('Argument needs to be a string');
    }

    return utils.genPromiseFn(this.page, 'evaluateJavaScript', javaScriptStr);
  }

  /**
   * [evaulateAsync]{@link http://phantomjs.org/api/webpage/method/evaluate-async.html}
   *
   * Evaluates a given function in the context of the webpage without blocking
   * the current execution (Phantom process - not Node). Unlike `evaluate`, this
   * function cannot take any arguments and will not return any values.
   *
   * *Developer Note*: It seems like the signature of the function is wrong according
   * to [this](http://stackoverflow.com/questions/22474525/how-we-can-use-evaluateasync-in-phantomjs) stackoverflow
   * question. I cannot find any sources to back it up, so I will have to check this later.
   *
   * @param {Function} fn Function to be evaluated
   * @param {Number} num number of milliseconds to wait until the function should run
   * @param {Args} args arguments to send
   * @returns {Promise()}
   */
  evaluateAsync(fn, num, args) {
    this.throwIfClosed();

    if (typeof fn !== 'function') {
      throw new TypeError('Argument needs to be a function');
    }

    if (utils.isArrowFunction(fn)) {
      printDeprecatedArrowFn(this.deprecateSilence, 'page.evaluateAsync');
    }

    return utils.genPromiseFn(this.page, 'evaluateAsync', fn, num, args);
  }

  /**
   * *node-phantom-simple specific*
   *
   * As all operations are done over HTTP, the setting and getting
   * of properties uses callbacks to indicate that they're set or to return
   * a value.
   * The name is checked against allowed properties and will throw a type error
   * if the name doesn't exist.
   *
   * The legal properties to change using this method are the following:
   *
   * Name                              | Type           | Description
   * ----------------------------------|----------------|---------------------------------------------------
   * [canGoBack][1]                    | Boolean        | Sets whether the page should be able to go back.
   * [canGoForward][2]                 | Boolean        | Sets whether the page should be able to go forward.
   * [clipRect][3]                     | Object         | Defines the rectangular area to be rendered
   * [clipRect.top][3]                 | Number         | Defines the top point of the rectangular area
   * [clipRect.left][3]                | Number         | Defines the left point of the rectangular area
   * [clipRect.width][3]               | Number         | Defines the width of the rectangular area
   * [clipRect.width][3]               | Number         | Defines the height of the rectangular area
   * [content][4]                      | String         | This property contains the HTML of the page.
   * [cookies][5]                      | Object[]       | A list of all the cookies defined on the page
   * [customHeaders][6]                | Object         | Specifies headers that should be included on requests
   * [event][7]                        | Undocumented   | No documentation
   * [focusedFrameContent][8]          | Undocumented   | No documentation
   * [frameContent][9]                 | Undocumented   | No documentation
   * [frameName][10]                   | Undocumented   | No documentation
   * [framePlainText][11]              | String         | Retrieve the plaintext content of the active frame
   * [frameTitle][12]                  | String         | Retrieve the title of the active frame
   * [frameUrl][13]                    | String         | Retrieve the url of the active frame
   * [framesCount][14]                 | Number         | Retrieve the number of active frames
   * [framesName][15]                  | String[]       | Retrieve a list of the frame names
   * [libraryPath][16]                 | String         | Stores the path used by `page.injectJs`
   * [navigationLocked][17]            | Boolean        | If true, the page wont be able to navigate from current page
   * [offlineStoragePath][18]          | String         | The path to the offline storage
   * [offlineStorageQuota][19]         | Undocumented   | No documentation
   * [ownsPages][20]                   | Undocumented   | No documentation
   * [pagesWindowName][21]             | String         | No documentation
   * [pages][22]                       | Object         | No documentation
   * [paperSize][23]                   | Object         | Defines the size of teh webpage when rendered to PDF
   * [paperSize.width][23]             | Number         | Defines the width of the webpage when rendered to PDF
   * [paperSize.height][23]            | Number         | Defines the height of the webpage when rendered to PDF
   * [papersize.format][23]            | String         | Supported are 'A3', 'A4', 'A5', 'Legal', 'Letter' and 'Tabloid'
   * [paperSize.orientation][23]       | String         | Orientation of the document, either 'landscape' or 'portrait'
   * [paperSize.margin][23]            | Object, Number | Margin of the document.
   * [paperSize.margin.top][23]        | Number         | Top margin of the document
   * [paperSize.margin.right][23]      | Number         | Right margin of the document
   * [paperSize.margin.bottom][23]     | Number         | Bottom margin of the document
   * [paperSize.margin.left][23]       | Number         | Left margin of the document
   * [paperSize.header][23]            | Object         | Can be used to add a repeating header on all pages
   * [paperSize.header.height][23]     | Number         | The total height of the header                // string
   * [paperSize.header.contents][23]   | Function       | Function that should be executed to get header
   * [paperSize.footer][23]            | Object         | Can be used to add a repeating footer on all pages
   * [paperSize.footer.height][23]     | Number         | The total height of the footer
   * [paperSize.footer.contents][23]   | Function       | Function that should be executed to get header
   * [plainText][24]                   | String         | Retrieve the content in plaintext
   * [scrollPosition][25]              | Object         | Defines the scroll position on the page
   * [scrollPosition.top][25]          | Number         | Defines the top scroll position
   * [scrollPosition.left][25]         | Number         | Defines the left scroll position
   * [setttings][26]                   | Object         | Settings that can be set, must be set before `page.open`
   * [settings.localToRemoteUrlAccessEnabled][26] | Boolean   | Whether local resource can access remote Urls.
   * [settings.javascriptEnabled][26]  | Boolean        | Whether JavaScript should be enabled or not
   * [settings.loadImages][26]         | Boolean        | Whether inline images should be loaded
   * [settings.userAgent][26]          | String         | Defines the user agent sent to server
   * [settings.userName][26]           | String         | Sets the username used for HTTP authentication
   * [settings.password][26]           | String         | Sets the password used for HTTP authentication
   * [settings.XSSAuditingEnabled][26] | Boolean        | Whether load requests should be monitored for XSS-attempts
   * [settings.webSecurityEnabled][26] | Boolean        | Whether web security should be enabled or not
   * [settings.resourceTimeout][26]    | Number         | How many milliseconds it should wait before cancelling resources
   * [title][27]                       | String         | Retrieve the title of the page
   * [url][28]                         | String         | Retrieve the url of the page
   * [viewportSize][29]                | Object         | Size of the windows that PhantomJS has.
   * [viewportSize.width][29]          | Number         | Width of the window, height must also be defined
   * [viewportSize.height][29]         | Number         | Height of the window
   * [windowName][30]                  | String         | Name of the window
   * [zoomFactor][31]                  | Number         | Sets how far in the page should be zoomed
   *
   * [1]: http://phantomjs.org/api/webpage/property/can-go-back.html
   * [2]: http://phantomjs.org/api/webpage/property/can-go-forward.html
   * [3]: http://phantomjs.org/api/webpage/property/clip-rect.html
   * [4]: http://phantomjs.org/api/webpage/property/content.html
   * [5]: http://phantomjs.org/api/webpage/property/cookies.html
   * [6]: http://phantomjs.org/api/webpage/property/custom-headers.html
   * [7]: http://phantomjs.org/api/webpage/property/event.html
   * [8]: http://phantomjs.org/api/webpage/property/focused-frame-name.html
   * [9]: http://phantomjs.org/api/webpage/property/frame-content.html
   * [10]: http://phantomjs.org/api/webpage/property/frame-name.html
   * [11]: http://phantomjs.org/api/webpage/property/frame-plain-text.html
   * [12]: http://phantomjs.org/api/webpage/property/frame-title.html
   * [13]: http://phantomjs.org/api/webpage/property/frame-url.html
   * [14]: http://phantomjs.org/api/webpage/property/frames-count.html
   * [15]: http://phantomjs.org/api/webpage/property/frames-name.html
   * [16]: http://phantomjs.org/api/webpage/property/library-path.html
   * [17]: http://phantomjs.org/api/webpage/property/navigation-locked.html
   * [18]: http://phantomjs.org/api/webpage/property/offline-storage-path.html
   * [19]: http://phantomjs.org/api/webpage/property/offline-storage-quota.html
   * [20]: http://phantomjs.org/api/webpage/property/owns-pages.html
   * [21]: http://phantomjs.org/api/webpage/property/pages-window-name.html
   * [22]: http://phantomjs.org/api/webpage/property/pages.html
   * [23]: http://phantomjs.org/api/webpage/property/paper-size.html
   * [24]: http://phantomjs.org/api/webpage/property/plain-text.html
   * [25]: http://phantomjs.org/api/webpage/property/scroll-position.html
   * [26]: http://phantomjs.org/api/webpage/property/settings.html
   * [27]: http://phantomjs.org/api/webpage/property/title.html
   * [28]: http://phantomjs.org/api/webpage/property/url.html
   * [29]: http://phantomjs.org/api/webpage/property/viewport-size.html
   * [30]: http://phantomjs.org/api/webpage/property/window-name.html
   * [31]: http://phantomjs.org/api/webpage/property/zoom-factor.html
   *
   * Example: To set/get the value paperSize.width you would do the following:
   * @example
   * page.set('paperSize.width', '50px')
   *   .then((result) => {// result is true or false depending on success});
   * page.get('paperSize.width')
   *   .then((value) => // value of paperSize.width);
   *
   *
   * @param {String} name name of the property
   * @returns {Promise(value)}
   */
  get(name) {
    this.throwIfClosed();

    if (Page.allowedGetProperties.indexOf(name) === -1) {
      let message = '"' + name + '" is not a valid key. Valid keys are: ';
      throw new TypeError(message + Page.allowedGetProperties.join(',\n'));
    }

    return utils.genPromiseFn(this.page, 'get', name);
  }

  /**
   * *Wrapper Specific*
   *
   * Retrieves a cookie by a name. Returns undefined if none is found.
   * Name is not case-sensitive
   *
   * @param  {String} name
   * @returns {Promise(Object)} object of same type as can be found in `addCookie` documentation
   */
  getCookie(name) {
    this.throwIfClosed();

    if (typeof name !== 'string') {
      throw new TypeError('Name needs to be a string');
    }

    name = name.toLowerCase();
    let filterCookies = (c) => c.name && c.name.toLowerCase() === name;

    return this.get('cookies').then((c) => c.filter(filterCookies)[0]);
  }

  /**
   * *Wrapper Specific*
   *
   * Retrieves a resource from the resource-list by name, if it exists.
   *
   * @param {String} name the name of the resource
   * @returns {Object|Null} null if no resource was found,
   *                        otherwise the resource
   */
  getLocalResource(name) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a string');
    }

    for(let i = 0; i < this._localResources.length; i++) {
      if (this._localResources[i].name === name) {
        return this._localResources[i];
      }
    }

    return null;
  }

  /**
   * [getPage]{@link http://phantomjs.org/api/webpage/method/get-page.html}
   *
   * Does not work properly due to an issue with node-phantom-simple
   * [issue](https://github.com/baudehlo/node-phantom-simple/issues/131)
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Returns a Child Page that matches the given "window.name".
   * This utility method is faster than accessing the
   * "windowName" property of every "page.pages"
   * and try to match.
   *
   * @param  {String} windowName
   * @returns {Promise(Page)|Promise(null)} Returns the page that matches 'window.name'
   *                                        or null if none is found
   */
  getPage(windowName) {
    throw new Error('Not implemented due to an issue in node-phantom-simple');
    this.throwIfClosed();

    if (typeof windowName !== 'string') {
      throw new TypeError('window name must be a string');
    }

    return utils.genPromiseFn(this.page, 'getPage', windowName).then(page => {
      return page ? new Page(page) : null;
    });
  }

  /**
   * [go]{@link http://phantomjs.org/api/webpage/method/go.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Go to the page identified by its relative location to the current page.
   * For example '-1' for the previous page or 1 for the next page.
   *
   * Modelled after JavaScript "window.go(num)" method:
   * {@see https://developer.mozilla.org/en-US/docs/DOM/window.history#Syntax}.
   *
   * @param {Number} historyRelativeIndex
   * @returns {Promise(Boolean)} true if it goes forward/backward in Navigation History, false otherwise
   */
  go(historyRelativeIndex) {
    this.throwIfClosed();

    if (typeof historyRelativeIndex !== 'number') {
      throw new TypeError('historyRelativeIndex must be a number');
    }

    return utils.genPromiseFn(this.page, 'go', historyRelativeIndex);
  }

  /**
   * [goBack]{@link http://phantomjs.org/api/webpage/method/go-back.html}
   *
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Goes back in the Navigation History
   *
   * @returns {Promise(Boolean)} true if it does go back in Navigation History, false otherwise
   */
  goBack() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'goBack');
  }

  /**
   * [goForward]{@link http://phantomjs.org/api/webpage/method/go-forward.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Goes forward in the Navigation History
   *
   * @returns {Promise(Boolean)} true if goes forward in Navigation History, false otherwise
   */
  goForward() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'goForward');
  }

  /**
   * *Wrapper-specific*
   *
   * Tells you whether the page has ran `close` or not
   * @returns {Promise(Boolean)}
   */
  isClosed() {
    return this._closed;
  }

  /**
   * [includeJs]{@link http://phantomjs.org/api/webpage/method/include-js.html}
   *
   * Includes external script from specified URL, usually remote location on the
   * page and executes the callback upon completion.
   *
   * @param {String} url The url to retrieve the JS from
   * @returns {Promise()}
   */
  includeJs(url) {
    this.throwIfClosed();

    if (typeof url !== 'string') {
      throw new TypeError('Filename must be a string');
    }

    return utils.genPromiseFn(this.page, 'includeJs', url);
  }

  /**
   * [injectJs]{@link http://phantomjs.org/api/webpage/method/inject-js.html}
   *
   * Injects external script code from specified file into the page
   * like (`includeJs`, except the file does not need to be accessible from hosted
   * page).
   *
   * If File cannot be found in the current directory, the libraryPath (state
   * in PhantomJS) is used for additional lookup.
   *
   * @param  {String} filename filename to inject
   * @returns {Promise()} true if successful, false otherwise
   */
  injectJs(filename) {
    this.throwIfClosed();

    if (typeof filename !== 'string') {
      throw new TypeError('Filename must be a string');
    }

    return utils.genPromiseFn(this.page, 'injectJs', filename);
  }

  /**
   * [onAlert]{@link http://phantomjs.org/api/webpage/handler/on-alert.html}
   *
   * This callback is invoked when there is a JavaScript alert on the web page.
   * The only argument passed to the callback is the string for the message.
   * There is no return value expected from the callback handler.
   *
   * @param  {Function} handler `function(message) {}`
   */
  onAlert(handler) {
    this._setHandler('onAlert', handler);
  }

  /**
   * [onCallback]{@link http://phantomjs.org/api/webpage/handler/on-callback.html}
   *
   * **Note**: THIS HANDLER IS EXPERIMENTAL
   * Introduced: PhantomJS 1.6 This callback is invoked when there is a
   * JavaScript window.callPhantom call made on the web page.
   * The only argument passed to the callback is a data object.
   *
   * Note: window.callPhantom is still an experimental API.
   * In the near future, it will be likely replaced with a
   * message-based solution which will still provide the same functionality.
   *
   * Although there are many possible use cases for this inversion of control,
   * the primary one so far is to prevent the need for a PhantomJS script
   * to be continually polling for some variable on the web page.
   *
   * @param  {Function} handler `function(object) {}`
   */
  onCallback(handler) {
    this._setHandler('onCallback', handler);
  }

  /**
   * [onClosing]{@link http://phantomjs.org/api/webpage/handler/on-closing.html}
   *
   * This callback is invoked when the WebPage object is being closed,
   * either via page.close in the PhantomJS outer space or via window.close
   * in the page's client-side.
   *
   * It is not invoked when child/descendant pages are being closed unless you
   * also hook them up individually. It takes one argument, closingPage,
   * which is a reference to the page that is closing.
   * Once the onClosing handler has finished executing (returned),
   * the WebPage object closingPage will become invalid.
   *
   * *Developer note*: The page you get through this handler will already be invalid,
   * as the onClosing handler in PhantomJS has already returned. This is, again, due to
   * the async nature of node-phantom-simple.
   *
   * If you need to do something special with the closingPage, this should
   * be done through .setFn
   *
   * @param  {Function} handler `function(closingPage) {}`
   */
  onClosing(handler) {
    this._setHandler('onClosing', handler);
  }

  /**
   * [onConfirm]{@link http://phantomjs.org/api/webpage/handler/on-confirm.html}
   *
   * This callback is invoked when there is a JavaScript confirm on the web page.
   * The only argument passed to the callback is the string for the message.
   *
   * The return value of the callback handler can be either true or false,
   * which are equivalent to pressing the "OK" or "Cancel" buttons
   * presented in a JavaScript confirm, respectively.
   *
   * *Developer Note*: This function cannot return values due to the async driver
   * nature of node-phantom-simple. If you need to return a value, please use
   * `page.setFn('onConfirm', function() {});`
   *
   * @param {Function} handler `function(message) {}`
   */
  onConfirm(handler) {
    this._setHandler('onConfirm', handler);
  }

  /**
   * [onConsoleMessage]{@link http://phantomjs.org/api/webpage/handler/on-console-message.html}
   *
   * This callback is invoked when there is a JavaScript console message on
   * the web page. The callback may accept up to three arguments:
   *
   * - the string for the message,
   * - the line number,
   * - and the source identifier.
   *
   * By default, console messages from the web page are not displayed.
   * Using this callback is a typical way to redirect it.
   *
   * Note: line number and source identifier are not used yet,
   * at least in phantomJS <= 1.8.1. You receive undefined values.
   *
   * @param {Function} handler `function(message, lineNumber, sourceId) {}`
   */
  onConsoleMessage(handler) {
    this._setHandler('onConsoleMessage', handler);
  }

  /**
   * [onError]{@link http://phantomjs.org/api/webpage/handler/on-error.html}
   *
   * This callback is invoked when there is a JavaScript execution error on
   * the web page. The callback may accept up to two arguments:
   *
   * - the error message,
   * - the stack trace [as an Array],
   *
   * By default, errors from the web page are not displayed.
   * Using this callback is a typical way to redirect it.
   *
   * @param {Function} handler `function(message, trace) {}`
   */
  onError(handler) {
    this._setHandler('onError', handler);
  }

  /**
   * [onFilePicker]{@link http://phantomjs.org/api/webpage/handler/on-file-picker.html}
   *
   * *Developer Note*: No documentation, but it expects a return value, therefore
   * you will need to use .setFn if you are to return any values
   *
   * @param {Function} handler Handler `function(oldFile) {}`
   */
  onFilePicker(handler) {
    this._setHandler('onFilePicker', handler);
  }

  /**
   * [onInitialized]{@link http://phantomjs.org/api/webpage/handler/on-initialized.html}
   *
   * This callback is invoked after the web page is created but before a URL is loaded. The callback
   * may be used to change global objects
   *
   * *Developer Note*: Due to the async nature of node-phantom-simple, this call will
   * most likely not be set in time, before the page is already initialized. Therefore
   * it is suggested to not use this function and instead assume that the page
   * is already initialize when received through a promise.
   *
   * @param {Function} handler `function() {}`
   */
  onInitialized(handler) {
    this._setHandler('onInitialized', handler);
  }

  /**
   * [onLoadFinished]{@link http://phantomjs.org/api/webpage/handler/on-load-finished.html}
   *
   * This callback is invoked when the page finishes the loading. It may accept a single argument
   * indicating the page's status: 'success' if no network error occurred, otherwise 'fail'.
   *
   * Also see `page.open` for an alternate hook for the `onLoadFinished` callback.
   *
   * @param {Function} handler `function(status) {}`
   */
  onLoadFinished(handler) {
    this._setHandler('onLoadFinished', handler);
  }

  /**
   * [onLoadStarted]{@link http://phantomjs.org/api/webpage/handler/on-load-started.html}
   *
   * This callback is invoked when the page starts the loading. There is no argument
   * passed to the callback.
   *
   * @param {Function} handler `function() {}`
   */
  onLoadStarted(handler) {
    this._setHandler('onLoadStarted', handler);
  }

  /**
   * [onNavigationRequested]{@link http://phantomjs.org/api/webpage/handler/on-navigation-requested.html}
   *
   * By implementing this callback, you will be notified when a navigation
   * event happens and know if it will be blocked (by `page.navigationLocked`)
   *
   * **Arguments to the callback**
   * - `url`: The target URL of this navigation event
   * - `type`: Possible values include:
   *   - 'Undefined'
   *   - 'LinkClicked'
   *   - 'FormSubmitted'
   *   - 'BackOrForward'
   *   - 'Reload'
   *   - 'FormResubmitted'
   *   - 'Other'
   * - `willNavigate`: true if navigation will happen, false if it is locked
   * - `main`: true if this event comes from the main frame, false if it comes from an iframe of some other sub-frame
   *
   * @param {Function} handler `function(url, type, willNavigate, main) {}`
   */
  onNavigationRequested(handler) {
    this._setHandler('onNavigationRequested', handler);
  }

  /**
   * [onPageCreated]{@link http://phantomjs.org/api/webpage/handler/on-page-created.html}
   *
   * This callback is invoked when a new child window
   * (but not deeper descendant windows) is created by the page,
   *  e.g. using `window.open`.
   *
   * In the PhantomJS outer space, this `WebPage` object will not yet have
   * called its own `page.open` method yet and thus does
   * not yet know its requested URL (`page.url`).
   *
   * Therefore, the most common purpose for utilizing a `page.onPageCreated` callback
   * is to decorate the page (e.g. hook up callbacks, etc.).
   *
   * @param {Function} handler `function(newPage) {}`
   */
  onPageCreated(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }

    this._setHandler('onPageCreated', function(page) {
      handler(new Page(page));
    });
  }

  /**
   * [onPrompt]{@link http://phantomjs.org/api/webpage/handler/on-prompt.html}
   *
   * This callback is invoked when there is a JavaScript `prompt` on the webpage.
   * The arguments passed to the callback are the string of the message and the
   * default value for the prompt answer. The return value of the callback handler
   * should be a string
   *
   * *Developer Note*: This function cannot return values due to the async driver
   * nature of node-phantom-simple. If you need to return a value, please use
   * `page.setFn('onPrompt', function() {});`
   *
   * @param {Function} handler `function(msg, defaultVal) {}`
   */
  onPrompt(handler) {
    this._setHandler('onPrompt', handler);
  }

  /**
   * [onResourceError]{@link http://phantomjs.org/api/webpage/handler/on-resource-error.html}
   *
   * This callback is invoked when a web page was unable to load resource.
   * The only argument to the callback is the `resourceError` metadata object.
   *
   * The `resourceError` metadata object contains these properties:
   *  - `ìd`: the number of the request
   *  - `url`: the resource url
   *  - `errorCode`: the [errorCode]{@link http://doc.qt.io/qt-4.8/qnetworkreply.html#NetworkError-enum}
   *  - `errorString`: The error description
   *
   * @param {Function} handler `function(resourceError) {}`
   */
  onResourceError(handler) {
    this._setHandler('onResourceError', handler);
  }

  /**
   * [onResourceReceived]{@link http://phantomjs.org/api/webpage/handler/on-resource-received.html}
   *
   * This callback is invoked when a resource requested by the page is received.
   * The only argument to the callback is the response metadata object.
   *
   * If the resource is large and sent by the server in multiple chunks,
   * onResourceReceived will be invoked for every chunk received by PhantomJS.
   *
   * The response metadata object contains these properties:
   * - `id` : the number of the requested resource
   * - `url` : the URL of the requested resource
   * - `time` : Date object containing the date of the response
   * - `headers` : list of http headers
   * - `bodySize` : size of the received content decompressed (entire content or chunk content)
   * - `contentType` : the content type if specified
   * - `redirectURL` : if there is a redirection, the redirected URL
   * - `stage` : "start", "end" (FIXME: other value for intermediate chunk?)
   * - `status` : http status code. ex: 200
   * - `statusText` : http status text. ex: OK
   *
   * @param {Function} handler `function(response) {}`
   */
  onResourceReceived(handler) {
    this._setHandler('onResourceReceived', handler);
  }

  /**
   * [onResourceRequested]{@link http://phantomjs.org/api/webpage/handler/on-resource-requested.html}
   *
   * This callback is invoked when the page requests a resource.
   * he first argument to the callback is the requestData metadata object.
   * The second argument is the networkRequest object itself.
   *
   * The requestData metadata object contains these properties:
   * - id : the number of the requested resource
   * - method : http method
   * - url : the URL of the requested resource
   * - time : Date object containing the date of the request
   * - headers : list of http headers
   *
   * *Developer Note*: Currently, the networkRequest object does not contain any functions.
   * This is due to an implementation issue in node-phantom-simple. An issue
   * has been created regarding [this]{@link https://github.com/baudehlo/node-phantom-simple/issues/98}
   *
   * Due to the asynchronous nature of node-phantom-simple, impelementing these functions
   * are simply too difficult. The networkRequest object is therefore an empty object
   *
   * @param {Function} handler `function(requestData, networkRequest) {}`
   */
  onResourceRequested(handler) {
    this._setHandler('onResourceRequested', handler);
  }

  /**
   * [onResourceTimeout]{@link http://phantomjs.org/api/webpage/handler/on-resource-timeout.html}
   *
   * This callback is invoked when a resource requested by the page timeout
   * according to settings.resourceTimeout.
   * The only argument to the callback is the request metadata object.
   *
   * The request metadata object contains these properties:
   * - id: the number of the requested resource
   * - method: http method
   * - url: the URL of the requested resource
   * - time: Date object containing the date of the request
   * - headers: list of http headers
   * - errorCode: the error code of the error
   * - errorString: text message of the error
   *
   * @param {Function} handler `function(request) {}`
   */
  onResourceTimeout(handler) {
    this._setHandler('onResourceTimeout', handler);
  }

  /**
   * [onUrlChanged]{@link http://phantomjs.org/api/webpage/handler/on-url-changed.html}
   *
   * This callback is invoked when the URL changes, e.g. as it navigates
   * away from the current URL.
   * The only argument to the callback is the new targetUrl string.
   *
   * To retrieve the old URL, use the onLoadStarted callback.
   *
   * @param {Function} handler `function(targetUrl) {}`
   */
  onUrlChanged(handler) {
    this._setHandler('onUrlChanged', handler);
  }


  /**
   * [open]{@link http://phantomjs.org/api/webpage/method/open.html}
   *
   * Opens the URL and loads it to the page. Once the page is loaded the promise function
   * is invoked. In addition, the page.onLoadFinished will also be called.
   * Will give a status in the form of 'success' or 'fail' string
   *
   * @param {String} url URL to do the request towards. Can be local file
   * @param {String|Object} methodOrSettings The method as a string or a settings object
   *   @param {String}   settings.operation  The type of method - POST / GEt
   *   @param {String} settings.encoding   The encoding to use
   *   @param {Object}   settings.headers    An object with headers
   *   @param {String}   settings.data       Stringified data (JSON etc)
   * @param {String} data Only used when methodOrSettings is a string
   * @returns {Promise(String)} status of the load, either 'success' or 'fail'
   */
  open(url, methodOrSettings, data) {
    this.throwIfClosed();

    if (typeof url !== 'string') {
      throw new TypeError('URL has to be a string');
    }

    this._startedLoading = true;

    if (typeof methodOrSettings === 'object') {
      return utils.genPromiseFn(this.page, 'open', url, methodOrSettings);
    }

    return utils.genPromiseFn(this.page, 'open', url, methodOrSettings, data);
  }

  /**
   * *Wrapper Specific*
   *
   * Uses a HTML string to open a webpage. If templateRenderDir
   * is undefined, a temporary file is created to store the HTML.
   * Use templateRenderDir if the HTML code includes scripts that has to be
   * retrieved from file, as PhantomJS will look relative to the save location
   * for these files if they are local ones.
   *
   * *Note* Do not use .openHtml and then .renderHtml, as renderHtml opens the
   * template again. If you need to render after using .openHtml,
   * use .renderPdf, .render or .renderBase64
   *
   * @example
   * let htmlString = '<html><head></head><body>This is a body</body></html>';
   * page.openHtml(htmlString)
   *   .then(() => page.evaluate(function() {return document.body.textContent;}))
   *   .then((textContent) => // textContent === 'This is a body')
   *
   * @param  {String} htmlString        String to render
   * @param  {String} templateRenderDir Where to save the HTML file (optional)
   * @returns {Promise(String)} either success or fail
   */
  openHtml(htmlString, templateRenderDir) {
    this.throwIfClosed();

    if (typeof htmlString !== 'string') {
      throw new TypeError('htmlString has to be a string');
    }

    if (typeof templateRenderDir !== 'string') {
      return co(this._openHtml(htmlString));
    }

    return co(this._openHtmlInRenderDir(htmlString, templateRenderDir));
  }

  /**
   * *Wrapper Specific*
   *
   * Expects a template that has a .render function that takes the options
   * sent to it. A structure of such an example can be seen
   * at [reewr-template]{@link https://github.com/Reewr/reewr-template}.
   *
   * This function will render the template, save the file and open it.
   * After this has completed, the page should be ready and can be run evaluations
   * on.
   *
   * If templateRenderDir is omitted, the HTML file will be saved in a temporary
   * directory (memory or file depending on OS). If the HTML file / template
   * has any includes such as CSS or JS files that are local files, you should
   * specify a templateRenderDir so that it can correctly load these. Remember
   * to specify the location of these CSS and JS files relative to the templateRenderDir
   *
   * *Note* Do not use .openTemplate and then .renderTemplate, as renderTemplate opens the
   * template again. If you need to render after using .openTemplate,
   * use .renderPdf, .render or .renderBase64
   *
   * @example
   * let template = {
   *   render: function(options) {
   *     return jade.render(options); // jade used as an example
   *   }
   * };
   * page.openTemplate(template, {pretty: true})
   *   .then(() => // do something with the open page)
   *   .then(() => page.renderPdf())
   *   .then((pdf) => // rendered pdf)
   *
   * @param  {Object} template          template object with a .render function
   * @param  {String} templateRenderDir Where to render the html file
   * @param  {Object} options           options that should be sent to the .render function
   * @returns {Promise(String)} status that is either fail or success
   */
  openTemplate(template, templateRenderDir, options) {
    this.throwIfClosed();

    if (!template || typeof template.render !== 'function') {
      throw new TypeError('Template argument is invalid - must have a render function');
    }

    if (typeof templateRenderDir === 'object') {
      options = templateRenderDir;
      templateRenderDir = undefined;
    }

    let html = template.render(options);

    if (typeof html !== 'string') {
      throw new TypeError('template.render must return a string');
    }

    return new Promise((resolve, reject) => {
      this.openHtml(html, templateRenderDir)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * [openUrl]{@link http://phantomjs.org/api/webpage/method/open-url.html}
   *
   * *Developer Note*: No documentation
   *
   * @param {String} url
   * @param {HttpConf} httpConf
   * @param {Settings} settings
   * @returns {Promise()}
   */
  openUrl(url, httpConf, settings) {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'openUrl', url, httpConf, settings);
  }

  /**
   * [reload]{@link http://phantomjs.org/api/webpage/method/reload.html}
   *
   * *Developer Note*: Performs a reload of the page.
   *
   * @returns {Promise()}
   */
  reload() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'reload');
  }

  /**
   * *Wrapper Specific*
   *
   * Removes a localresource by name. Returns true if removed,
   *
   * @param {String} name the name of the resource to remove
   * @returns {Boolean} true if removed, false if not found
   */
  removeLocalResource(name) {
    if (typeof name !== 'string') {
      throw new TypeError('The name must be a string');
    }

    if (this._localResources.length === 0) {
      return false;
    }

    let preLength = this._localResources.length;
    this._localResources = this._localResources.filter(x => x.name !== name);
    let postLength = this._localResources.length;

    return preLength !== postLength;
  }

  /**
   * [render]{@link http://phantomjs.org/api/webpage/method/render.html}
   *
   * Renders the webpage to an image buffer and saves it as the specified
   * filename. Currently the ouput format is automatically set based on the file
   * extension.
   *
   * *Developer Note*: Sadly, due to how PhantomJS handles PDF rendering, the
   * PDF needs to be saved to a file. This wrapper does however include `renderPdf`
   * which gives the PDF back as a buffer
   *
   * *Another Developer Note*: PhantomJS says to support `GIF` images, however,
   * the documentation on
   * [Qt ImageWriter]{@link http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats}
   * does not include `GIF`.
   * Use with caution.
   * There is also an issue on [this]{@link https://github.com/ariya/phantomjs/issues/13135}
   *
   * @param {String} filename      Where to save the file.
   * @param {String} [format=png]  If format is not specified, the file extension
   *                               is extracted and used as the format.
   * @param {Number} [quality=100] String or number value between 0 and 100
   * @returns {Promise()}
   */
  render(filename, format, quality) {
    this.throwIfClosed();

    quality = quality || 100;
    let isValidQuality = utils.isBetween(-1, 101, quality);

    if (typeof filename !== 'string') {
      throw new TypeError('Filename has to be a string');
    }

    if (!isValidQuality) {
      throw new TypeError('Quality has to be a numbet between 0 and 100');
    }

    // Upper-cased format screws up PhantomJSs guessing of format
    if (!format) {
      format = path.extname(filename).replace('.', '').toLowerCase();
    } else {
      format = format.toLowerCase();
    }

    if (format === '' || Page.validRenders.indexOf(format) === -1) {
      let message = 'Format is invalid: "' + format + '". Valid are: ';
      throw new TypeError(message + Page.validRenders.join(',\n'));
    }

    let settings = {quality: quality, format: format};

    return utils.genPromiseFn(this.page, 'render', filename, settings);
  }

  /**
   * [renderBase64]{@link http://phantomjs.org/api/webpage/method/render-base64.html}
   *
   * Renders the webpage to an image buffer and returns the result as a
   * Base64-encoded string representation of that image.
   *
   * *Developer Note*: PhantomJS says to support `GIF` images, however,
   * the documentation on
   * [Qt ImageWriter]{@link http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats}
   * does not include `GIF`.
   * Use with caution.
   * There is also an issue on [this]{@link https://github.com/ariya/phantomjs/issues/13135}
   *
   * @param  {String} [format=png] Either 'png', 'gif' or 'jpeg'
   * @returns {Promise(String)}  base64-encoded string
   */
  renderBase64(format) {
    this.throwIfClosed();

    if (typeof format !== 'string') {
      format = 'png';
    }

    if (Page.base64Formats.indexOf(format.toLowerCase()) === -1) {
      let message = 'Invalid format: "' + format + '". Valid formats are: ';
      throw new TypeError(message + Page.base64Formats.join(',\n'));
    }

    return utils.genPromiseFn(this.page, 'renderBase64');
  }

  /**
   * *Wrapper Specific*
   *
   * Renders a HTML string to a PDF by saving the HTML as a temporary file,
   * in the directory specified as `templateRenderDir` (this is nessassary
   * due to possible Javascript or CSS files that will be included) before it
   * uses `renderPdf` to save the PDF as a temporary file, loading it and then
   * returning the Buffer
   *
   * If you are sure that the HTML file does not request any JavaScript or
   * CSS files, you can omit the templateRenderDir. The file will then
   * be saved in a temporary directory and rendered like that.
   *
   * Will throw error if the page fails to open. Sadly, due to lack of error
   * message from phantomJS, the exact reason why this happened is not known.
   *
   * *Note* Do not use .openHtml and then .renderHtml, as renderHtml opens the
   * template again. If you need to render after using .openHtml,
   * use .renderPdf, .render or .renderBase64
   *
   * @example
   * let htmlString = '<html><head></head><body>This is a body</body></html>';
   * page.renderHtml(htmlString)
   *   .then((pdf) => // pdf now contains the rendered version of the htmlstring)
   *
   * @param  {String} htmlString        the HTML string
   * @param  {String} templateRenderDir directory to save the temp HTML file
   * @returns {Promise(Buffer)}         PDF
   */
  renderHtml(htmlString, templateRenderDir) {
    this.throwIfClosed();

    if (typeof htmlString !== 'string') {
      throw new TypeError('htmlString has to be a string');
    }

    return new Promise((resolve, reject) => {
      this.openHtml(htmlString, templateRenderDir).then((status) => {
        if (status !== 'success') {
          return reject(new Error('Failed on opening page correctly'));
        }

        this.renderPdf().then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  /**
   * *Wrapper Specific*
   *
   * Renders a PDF and returns the content as a buffer. Due to PhantomJS
   * this function has to save a file to disk.
   * This wrapper uses [node-tmp]{@link https://github.com/raszi/node-tmp} to do
   * this. This saves a temporary file (in memory or file, depending on OS), which
   * is deleted after it is completed or throws an error.
   *
   * @returns {Promise(Buffer)} buffer
   */
  renderPdf() {
    this.throwIfClosed();

    let opts;
    return utils.tmp.file({postfix: '.pdf'})
      .then((options) => {
        opts = options;
        return this.render(opts.path, 'pdf');
      })
      .then(() => utils.loadFile(opts.path))
      .then((content) => {
        opts.cleanup();
        return content;
      });
  }

  /**
   * *Wrapper Specific*
   *
   * Expects a template that has a .render function that takes the options
   * sent to it. A structure of such an example can be seen
   * at [reewr-template]{@link https://github.com/Reewr/reewr-template}.
   *
   * This function will render the template into a PDF and returns the
   * content as a Buffer
   *
   * If templateRenderDir is omitted, the HTML file will be saved in a temporary
   * directory (memory or file depending on OS). If the HTML file / template
   * has any includes such as CSS or JS files that are local files, you should
   * specify a templateRenderDir so that it can correctly load these. Remember
   * to specify the location of these CSS and JS files relative to the templateRenderDir
   *
   * Will throw error if the page fails to open. Sadly, due to lack of error
   * message from phantomJS, the exact reason why this happened is not known.
   *
   * *Note* Do not use .openTemplate and then .renderTemplate, as renderTemplate opens the
   * template again. If you need to render after using .openTemplate,
   * use .renderPdf, .render or .renderBase64
   *
   * @param  {Object} template          template object with a .render function
   * @param  {String} templateRenderDir Where to render the html file
   * @param  {Object} options           options that should be sent to the .render function
   * @returns {Promise(Buffer)}         PDF
   */
  renderTemplate(template, templateRenderDir, options) {
    this.throwIfClosed();

    if (!template || typeof template.render !== 'function') {
      throw new TypeError('Template argument is invalid - must have a render function');
    }

    if (typeof templateRenderDir === 'object') {
      options = templateRenderDir;
      templateRenderDir = undefined;
    }

    let html = template.render(options);

    if (typeof html !== 'string') {
      throw new TypeError('template.render does not return a string');
    }

    return new Promise((resolve, reject) => {
      this.renderHtml(html, templateRenderDir)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * [sendEvent]{@link http://phantomjs.org/api/webpage/method/send-event.html}
   *
   * The events are not synthetic DOM events, each event is sent to the web page
   * as if it comes as part of user interaction.
   *
   * ## Mouse events
   *
   * `sendEvent(mouseEventType[, mouseX, mouseY, button='left'])`
   *
   * The first argument is the event type. Supported types are:
   * 'mouseup', 'mousedown', 'mousemove', 'doubleclick' and 'click'.
   * The next two arguments are optional but represent the mouse position
   * for the event.
   *
   * The button parameter (defaults to left) specifies the button to push.
   * For 'mousemove', however, there is no button pressed (i.e. it is not dragging).
   *
   * ## Keyboard events
   *
   * `sendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])`
   *
   * The first argument is the event type. The supported types are:
   * keyup, keypress and keydown.
   * The second parameter is a key (from page.event.key), or a string.
   * You can also indicate a fifth argument, which is an integer indicating
   * the modifier key.
   *
   * - 0: No modifier key is pressed
   * - 0x02000000: A Shift key on the keyboard is pressed
   * - 0x04000000: A Ctrl key on the keyboard is pressed
   * - 0x08000000: An Alt key on the keyboard is pressed
   * - 0x10000000: A Meta key on the keyboard is pressed
   * - 0x20000000: A keypad button is pressed
   *
   * Third and fourth argument are not taken account for keyboard events.
   * Just give null for them.
   *
   * @param {String}          eventType    See above
   * @param {Number|String[]} mouseXOrKeys See above
   * @param {Number|Null}     mouseY       See above
   * @param {String}          button       See above
   * @param {String}          modifier     See above
   * @returns {Promise()}
   */
  sendEvent(eventType, mouseXOrKeys, mouseY, button, modifier) {
    this.throwIfClosed();

    return utils.genPromiseFn(
      this.page,
      'sendEvent',
      eventType,
      mouseXOrKeys,
      mouseY,
      button,
      modifier
    );
  }

  /**
   * *node-phantom-simple specific*
   *
   * As all operations are done over HTTP, the setting and getting
   * of properties uses callbacks to indicate that they're set or to return
   * a value
   *
   * Will check the name against allowed properties. Throws error if the
   * property doesn't exist or if it's a read only value.
   *
   * The legal properties to change using this method are the following:
   *
   * Name                              | Type           | Description
   * ----------------------------------|----------------|---------------------------------------------------
   * [canGoBack][1]                    | Boolean        | Sets whether the page should be able to go back.
   * [canGoForward][2]                 | Boolean        | Sets whether the page should be able to go forward.
   * [clipRect][3]                     | Object         | Defines the rectangular area to be rendered
   * [clipRect.top][3]                 | Number         | Defines the top point of the rectangular area
   * [clipRect.left][3]                | Number         | Defines the left point of the rectangular area
   * [clipRect.width][3]               | Number         | Defines the width of the rectangular area
   * [clipRect.width][3]               | Number         | Defines the height of the rectangular area
   * [content][4]                      | String         | This property contains the HTML of the page.
   * [cookies][5]                      | Object[]       | A list of all the cookies defined on the page
   * [customHeaders][6]                | Object         | Specifies headers that should be included on requests
   * [event][7]                        | Undocumented   | No documentation
   * [libraryPath][16]                 | String         | Stores the path used by `page.injectJs`
   * [navigationLocked][17]            | Boolean        | If true, the page wont be able to navigate from current page
   * [offlineStoragePath][18]          | String         | The path to the offline storage
   * [offlineStorageQuota][19]         | Undocumented   | No documentation
   * [ownsPages][20]                   | Undocumented   | No documentation
   * [pagesWindowName][21]             | String         | No documentation
   * [pages][22]                       | Object         | No documentation
   * [paperSize][23]                   | Object         | Defines the size of the webpage when rendered to PDF
   * [paperSize.width][23]             | Number         | Defines the width of the webpage when rendered to PDF
   * [paperSize.height][23]            | Number         | Defines the height of the webpage when rendered to PDF
   * [papersize.format][23]            | String         | Supported are 'A3', 'A4', 'A5', 'Legal', 'Letter' and 'Tabloid'
   * [paperSize.orientation][23]       | String         | Orientation of the document, either 'landscape' or 'portrait'
   * [paperSize.margin][23]            | Object, Number | Margin of the document.
   * [paperSize.margin.top][23]        | Number         | Top margin of the document
   * [paperSize.margin.right][23]      | Number         | Right margin of the document
   * [paperSize.margin.bottom][23]     | Number         | Bottom margin of the document
   * [paperSize.margin.left][23]       | Number         | Left margin of the document
   * [paperSize.header][23]            | Object         | Can be used to add a repeating header on all pages
   * [paperSize.header.height][23]     | Number         | The total height of the header                // string
   * [paperSize.header.contents][23]   | Function       | Function that should be executed to get header
   * [paperSize.footer][23]            | Object         | Can be used to add a repeating footer on all pages
   * [paperSize.footer.height][23]     | Number         | The total height of the footer
   * [paperSize.footer.contents][23]   | Function       | Function that should be executed to get header
   * [scrollPosition][25]              | Object         | Defines the scroll position on the page
   * [scrollPosition.top][25]          | Number         | Defines the top scroll position
   * [scrollPosition.left][25]         | Number         | Defines the left scroll position
   * [setttings][26]                   | Object         | Settings that can be set, must be set before `page.open`
   * [settings.localToRemoteUrlAccessEnabled][26] | Boolean   | Whether local resource can access remote Urls.
   * [settings.javascriptEnabled][26]  | Boolean        | Whether JavaScript should be enabled or not
   * [settings.loadImages][26]         | Boolean        | Whether inline images should be loaded
   * [settings.userAgent][26]          | String         | Defines the user agent sent to server
   * [settings.userName][26]           | String         | Sets the username used for HTTP authentication
   * [settings.password][26]           | String         | Sets the password used for HTTP authentication
   * [settings.XSSAuditingEnabled][26] | Boolean        | Whether load requests should be monitored for XSS-attempts
   * [settings.webSecurityEnabled][26] | Boolean        | Whether web security should be enabled or not
   * [settings.resourceTimeout][26]    | Number         | How many milliseconds it should wait before cancelling resources
   * [viewportSize][29]                | Object         | Size of the windows that PhantomJS has.
   * [viewportSize.width][29]          | Number         | Width of the window, height must also be defined
   * [viewportSize.height][29]         | Number         | Height of the window
   * [windowName][30]                  | String         | Name of the window
   * [zoomFactor][31]                  | Number         | Sets how far in the page should be zoomed
   *
   * [1]: http://phantomjs.org/api/webpage/property/can-go-back.html
   * [2]: http://phantomjs.org/api/webpage/property/can-go-forward.html
   * [3]: http://phantomjs.org/api/webpage/property/clip-rect.html
   * [4]: http://phantomjs.org/api/webpage/property/content.html
   * [5]: http://phantomjs.org/api/webpage/property/cookies.html
   * [6]: http://phantomjs.org/api/webpage/property/custom-headers.html
   * [7]: http://phantomjs.org/api/webpage/property/event.html
   * [8]: http://phantomjs.org/api/webpage/property/focused-frame-name.html
   * [9]: http://phantomjs.org/api/webpage/property/frame-content.html
   * [10]: http://phantomjs.org/api/webpage/property/frame-name.html
   * [11]: http://phantomjs.org/api/webpage/property/frame-plain-text.html
   * [12]: http://phantomjs.org/api/webpage/property/frame-title.html
   * [13]: http://phantomjs.org/api/webpage/property/frame-url.html
   * [14]: http://phantomjs.org/api/webpage/property/frames-count.html
   * [15]: http://phantomjs.org/api/webpage/property/frames-name.html
   * [16]: http://phantomjs.org/api/webpage/property/library-path.html
   * [17]: http://phantomjs.org/api/webpage/property/navigation-locked.html
   * [18]: http://phantomjs.org/api/webpage/property/offline-storage-path.html
   * [19]: http://phantomjs.org/api/webpage/property/offline-storage-quota.html
   * [20]: http://phantomjs.org/api/webpage/property/owns-pages.html
   * [21]: http://phantomjs.org/api/webpage/property/pages-window-name.html
   * [22]: http://phantomjs.org/api/webpage/property/pages.html
   * [23]: http://phantomjs.org/api/webpage/property/paper-size.html
   * [24]: http://phantomjs.org/api/webpage/property/plain-text.html
   * [25]: http://phantomjs.org/api/webpage/property/scroll-position.html
   * [26]: http://phantomjs.org/api/webpage/property/settings.html
   * [27]: http://phantomjs.org/api/webpage/property/title.html
   * [28]: http://phantomjs.org/api/webpage/property/url.html
   * [29]: http://phantomjs.org/api/webpage/property/viewport-size.html
   * [30]: http://phantomjs.org/api/webpage/property/window-name.html
   * [31]: http://phantomjs.org/api/webpage/property/zoom-factor.html
   *
   * *Developer Note*: `paperSize.header.contents` and `paperSize.footer.contents` take
   * functions that are evaluated in PhantomJS, meaning they will not have
   * the context of where you are creating them. In addition, the HTML
   * returned by these functions are rendered in a HTML document outside
   * of the main document (the page itself) and will therefore not have access to
   * resources such as CSS and JS. In order to style HTML, you will have to
   * add the CSS inline, such as `<div style="font-size: 10px;"></div>`.
   *
   * Another thing to keep in mind is that images are loaded async, so in
   * order to have an image in the footer/header, these are to be loaded
   * prior to rendering the footer/header. This can be done by adding the
   * image to the main document and then setting the display to none.
   *
   * **Note**: If the value argument is a function it should not
   * include any ES6 syntax, including arrow functions. This
   * is due to it being stringified and sent to PhantomJS which evaluates
   *
   * it and PhantomJS only supports ES5. This will be an error in v4
   *
   * Example: To set/get the value paperSize.width you would do the following:
   * @example
   * page.set('paperSize.width', '50px')
   *   .then((result) => {// result is true or false depending on success});
   * page.get('paperSize.width')
   *   .then((value) => // value of paperSize.width);
   *
   * @param {String} name  name of the property
   * @param {Anything} value value of the property
   * @returns {Promise()}
   */
  set(name, value) {
    this.throwIfClosed();

    if (Page.allowedGetProperties.indexOf(name) === -1) {
      let message = '"' + name + '" is not a valid key. Valid keys are ';
      throw new TypeError(message + Page.allowedSetProperties.join(',\n'));
    }

    if (Page.readOnlyProperties.indexOf(name) !== -1) {
      let message = '"' + name + '" is a readOnly-property and cannot be set';
      throw new TypeError(message);
    }

    if (typeof value === 'function' && utils.isArrowFunction(value)) {
      printDeprecatedArrowFn(this.deprecateSilence, 'page.set');

    }


    return utils.genPromiseFn(this.page, 'set', name, value);
  }

  /**
   * [setContent]{@link http://phantomjs.org/api/webpage/method/set-content.html}
   *
   * Allows to set both page.content and page.url properties. The webpage
   * will be reloaded with new content and the current location set as the given
   * url, without any actual http request being made.
   *
   * @param {String} content The HTML content of the webpage
   * @param {String} url     The URL of the webpage
   * @returns {Promise()}
   */
  setContent(content, url) {
    this.throwIfClosed();

    if (typeof content !== 'string') {
      throw new TypeError('The content of the page must be a string');
    }

    if (typeof url !== 'string') {
      throw new TypeError('The url must be a string');
    }

    return utils.genPromiseFn(this.page, 'setContent', content, url);
  }

  /**
   * *node-simple-phantom specific*
   *
   * Sets a function. This function does not have the same scope. It works
   * similar to how evaluate does. It can return values and can therefore
   * be used for handlers such as `onConfirm` or `onPrompt`
   *
   * **Note**: The function argument does **not** support ES6 and should
   * therefore not use any ES6 syntax, including arrow functions. This
   * is due to it being stringified and sent to PhantomJS which evaluates
   * it and PhantomJS only supports ES5. This will be an error in v4
   *
   * @param {String}   name name of the event ('onConfirm', etc)
   * @param {Function} fn   handler of the event
   * @returns {Promise()}
   */
  setFn(name, fn) {
    this.throwIfClosed();

    if (typeof name !== 'string') {
      throw new TypeError('The event name must be a string');
    }

    if (typeof fn !== 'function') {
      throw new TypeError('The event handler must be a function');
    }

    if (utils.isArrowFunction(fn)) {
      printDeprecatedArrowFn(this.deprecateSilence, 'page.setFn');
    }

    return utils.genPromiseFn(this.page, 'setFn', name, fn);
  }

  /**
   * [stop]{@link http://phantomjs.org/api/webpage/method/stop.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Stops loading page (if the page is loading)
   *
   * NOTE: This method does nothing when page is not actually loading.
   * It's effect can be applied in that very short window of time between
   * "onLoadStarted" and "onLoadFinished".
   *
   * *Another Developer Note*: This function may not work properly, as the short
   * time in between these two events may be missed due to events being polled
   * by node-phantom-simple
   *
   * @returns {Promise()}
   */
  stop() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'stop');
  }

  /**
   * [switchToFocusedFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-focused-frame.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Switches to the currently focused frame, as per QWebPage. This is the frame whose
   * window element was last focus()ed, and is currently the target of key events.
   *
   * @returns {Promise()}
   */
  switchToFocusedFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToFocusedFrame');
  }

  /**
   * [switchToFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-frame.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Switches focus from the Current Frame to a Child Frame, identified by it positional order.
   *
   * @param {Number} framePosition Position of the Frame inside the Child Frames Array (i.e "window.frames[i]")
   * @returns {Promise(boolean)} true if the frame was found, false otherwise
   */
  switchToFrame(framePosition) {
    this.throwIfClosed();

    if (typeof framePosition !== 'number') {
      throw new TypeError('Name of the child must be a string');
    }

    return utils.genPromiseFn(this.page, 'switchToFrame');
  }

  /**
   * [switchToMainFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-main-frame.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Switches focus to the Main Frame within this Page.
   *
   * @returns {Promise()}
   */
  switchToMainFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToMainFrame');
  }

  /**
   * [switchToParentFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-parent-frame.html}
   *
   * *Developer Note*: Above link contains no information.
   * This is taken from [PhantomJS source code comments]{@link https://github.com/ariya/phantomjs/blob/master/src/webpage.h}
   *
   * Switches focus to the Parent Frame of the Current Frame (if it exists).
   *
   * @returns {Promise(Boolean)} true if the Current Frame is not a Main Frame,
   *                             false otherwise (i.e. there is no parent frame to switch to)
   */
  switchToParentFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToParentFrame');
  }

  /**
   * [uploadFile]{@link http://phantomjs.org/api/webpage/method/upload-file.html}
   *
   * Updates the specified file (filename) to the form element associated with
   * selector. This function is used to automate the upload of a file, which is
   * usually handled with a file dialog in a traditional browser. Since there
   * is no dialog in this headless mode, such an upload mechanism is handled
   * via this special function instead
   *
   * @param {String} selector
   * @param {String} filename
   * @returns {Promise()}
   */
  uploadFile(selector, filename) {
    this.throwIfClosed();

    if (typeof selector !== 'string') {
      throw new TypeError('Selector has to be a string');
    }

    if (typeof filename !== 'string') {
      throw new TypeError('Filename has to be a string');
    }

    return utils.genPromiseFn(this.page, 'uploadFile', selector, filename);
  }

  /**
   * *Wrapper Specific*
   *
   * Waits for the page to be loaded before
   * fulfilling the promise.
   *
   * Will reject the promise if the time for the page
   * to load takes more than specified by `timeout`, which
   * defaults to 20 seconds (20 000 milliseocnds)
   *
   * @example
   * let page = yield phantom.createPage();
   * let status = yield page.open('http://www.google.com');
   *
   * yield page.waitForLoad();
   * yield page.render('./google.pdf');
   *
   * @params {Number} [timeout=20000] time to wait before rejecting
   * @returns {Promise()}
   */
  waitForLoad(timeout) {
    if (typeof timeout !== 'number') {
      timeout = 20000;
    }

    return new Promise((resolve, reject) => {
      if (!this._startedLoading) {
        return resolve();
      }

      let timeoutId = setTimeout(() => {
        reject(new Error('Loading took too long'));
      }, timeout);

      this._onLoadQueue.push(() => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  }

  /**
   * *node-phantom-simple specific*
   *
   * Uses page.evaluate in order select an element on the page to
   * see if it exists. This operation is performed every 150 ms until it
   * reaches the timeout limit. If the limit is exceeded, an error is thrown.
   * If an element is found prior to this, the function returns, indicating
   * that the element has been rendered.
   *
   * The selector is a selector accepted by document.querySelectorAll.
   * This can be useful when an element has to be active, but is appended by Javascript
   * and doesn't exist at pageload.
   *
   * @example
   * page.open(somePage)
   *   .then(() => page.waitForSelector('.select'))
   *   .then(() => {
   *     // ready to do something as the whole page is now rendered
   *   });
   *
   * @param  {String} selector selector such as '.myclass' or '#myid'
   * @param  {Number} timeout  How long to wait at maximum before throwing error, 10 seconds is default
   * @returns {Promise()}
   */
  waitForSelector(selector, timeout) {
    this.throwIfClosed();

    if (typeof selector !== 'string') {
      throw new TypeError('The selector has to be a string');
    }

    if (typeof timeout !== 'number') {
      timeout = 10000;
    }

    return utils.genPromiseFn(this.page, 'waitForSelector', selector, timeout);
  }
}

/**
 * A list of settings that should not be sent through `set` as they are
 * read-only variables
 *
 * @private
 * @type {String[]}
 */
Page.readOnlyProperties = [
  'framePlainText',   // string
  'frameUrl',         // string
  'framesName',       // array(string)
  'plainText',        // string
  'title',            // string
  'url',              // string
];


/**
 * A list of all the variables that can be used in .set function.
 * @todo Add typecheck and check before sending the options to PhantomJS to optimize
 *
 * @private
 * @type {String[]}
 */
Page.allowedSetProperties = [
  'canGoBack',                               // boolean
  'canGoForward',                            // boolean
  'clipRect',                                // object
  'clipRect.top',                            // number
  'clipRect.left',                           // number
  'clipRect.width',                          // number
  'clipRect.height',                         // number
  'content',                                 // string
  'cookies',                                 // array(object)
  'customHeaders',                           // object
  'event',                                   // undocumented
  'focusedFrameName',                        // undocumented
  'frameContent',                            // string
  'framesName',                              // undocumented
  'frameTitle',                              // string
  'framesCount',                             // string
  'libraryPath',                             // string
  'navigationLocked',                        // boolean
  'offlineStoragePath',                      // undocumented
  'offlineStorageQuota',                     // undocumented
  'ownsPages',                               // undocumented
  'pages',                                   // undocumented
  'pagesWindowName',                         // undocumented
  'paperSize',                               // object
  'paperSize.width',                         // string
  'paperSize.height',                        // string
  'papersize.format',                        // string
  'paperSize.orientation',                   // string
  'paperSize.margin',                        // object || string
  'paperSize.margin.top',                    // string
  'paperSize.margin.right',                  // string
  'paperSize.margin.bottom',                 // string
  'paperSize.margin.left',                   // string
  'paperSize.header',                        // object
  'paperSize.header.height',                 // string
  'paperSize.header.contents',               // function
  'paperSize.footer',                        // string
  'paperSize.footer.height',                 // string
  'paperSize.footer.contents',               // function
  'scrollPosition',                          // object
  'scrollPosition.top',                      // number
  'scrollPosition.left',                     // number
  'settings',                                // object
  'settings.javascriptEnabled',              // boolean
  'settings.loadImages',                     // boolean
  'settings.localToRemoteUrlAccessEnabled',  // boolean
  'settings.userAgent',                      // string
  'settings.userName',                       // string
  'settings.password',                       // string
  'settings.XSSAuditingEnabled',             // boolean
  'settings.webSecurityEnabled',             // boolean
  'settings.resourceTimeout',                // number
  'viewportSize',                            // object
  'viewportSize.width',                      // number
  'viewportSize.height',                     // number
  'windowName',                              // string
  'zoomFactor'                               // number
];

/**
 * A list of all the variables that can be retrieved through .get
 * These also include any readOnly variables
 *
 * @private
 * @type {String[]}
 */
Page.allowedGetProperties = [].concat(
  Page.readOnlyProperties,
  Page.allowedSetProperties
);

/**
 * A list of settings that are undocumented in type and should therefore
 * not be type-checked when that is implemented in the future
 *
 * @private
 * @type {String[]}
 */
Page.passProperties = [
  'event',
  'focusedFrameName',
  'frameTitle',
  'frameCount',
  'offlineStoragePath',
  'offlineStorageQuota',
  'ownsPages',
  'pages',
  'pagesWindowName',
  'windowName'
];

/**
 * A list of allowed formats for the base64 format
 *
 * @private
 * @type {String[]}
 */
Page.base64Formats = ['png', 'gif', 'jpeg'];

/**
 * A list of allowed formats for the render function
 *
 * @private
 * @type {String[]}
 */
Page.validRenders = Page.base64Formats.concat(['pdf']);

module.exports = Page;
