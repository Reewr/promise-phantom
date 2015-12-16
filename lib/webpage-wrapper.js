"use strict";
const utils = require('../lib/utils');
const path  = require('path');
const temp  = require('tmp');

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
 * - getCookie
 * - renderPdf,
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
 */
class Page {
  constructor(page, options) {
    options = options || {};
    this.page = page;
    this.templateRenderDirectory = options.templateRenderDir;
    this._closed = false;
  }

  /**
   * *Wrapper-specific*
   *
   * Tells you whether the page has ran `close` or not
   * @promise {Boolean}
   */
  isClosed() {
    return this._closed;
  }

  /**
   * *Wrapper-specific*
   *
   * Throws an error if the page has been called `close` on.
   */
  throwIfClosed() {
    if (this._closed) {
      throw new Error('Do not use the page object after page.close()');
    }
  }

  /**
   * *node-simple-phantom specific*
   *
   * Sets a function. This function does not have the same scope. It works
   * similar to how evaluate does. It can return values and can therefore
   * be used for handlers such as `onConfirm` or `onPrompt`
   *
   * @param {string}   name name of the event ('onConfirm', etc)
   * @param {Function} fn   handler of the event
   */
  setFn(name, fn) {
    this.throwIfClosed();

    if (typeof name !== 'string') {
      throw new TypeError('The event name must be a string');
    }

    if (typeof fn !== 'function') {
      throw new TypeError('The event handler must be a function');
    }

    return utils.genPromiseFn(this.page, 'setFn', name, fn);
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
   * Example: To set/get the value paperSize.width you would do the following:
   * @example
   * page.set('paperSize.width', '50px')
   *   .then((result) => {// result is true or false depending on success});
   * page.get('paperSize.width')
   *   .then((value) => // value of paperSize.width);
   *
   *
   * @param {string} name name of the property
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
   * *node-phantom-simple specific*
   *
   * As all operations are done over HTTP, the setting and getting
   * of properties uses callbacks to indicate that they're set or to return
   * a value
   * Will check the name against allowed properties. Throws error if the
   * property doesn't exist or if it's a read only value.
   *
   * Example: To set/get the value paperSize.width you would do the following:
   * @example
   * page.set('paperSize.width', '50px')
   *   .then((result) => {// result is true or false depending on success});
   * page.get('paperSize.width')
   *   .then((value) => // value of paperSize.width);
   *
   * @param {string} name  name of the property
   * @param {anything} value value of the property
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

    return utils.genPromiseFn(this.page, 'set', name, value);
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
   * has to be serializable.
   *
   * @param  {Function} fn function to be evaluated
   * @return {object|string|number|date}
   */
  evaluate(fn) {
    this.throwIfClosed();

    if (typeof fn !== 'function') {
      throw new TypeError('First argument must be the function that is to be evaluted');
    }

    // Non-leaking arguments
    let len  = arguments.length - 1;
    let args = [];

    for(let i = 0; i < len; i++) {
      args[i] = arguments[i+1];
    }

    return utils.genPromiseFn.apply(utils, [this.page, 'evaluate', fn].concat(args));
  }

  waitForSelector(selector, timeout) {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'waitForSelector', selector, timeout);
  }

  /**
   * [addCookie]{@link http://phantomjs.org/api/webpage/method/add-cookie.html}
   *
   * Adds a cookie to the webpage. Settings can be seen below. Some are required
   *
   * @param {object} options
   *   @param {string}           options.name            A valid cookie name
   *   @param {string}           options.value           A cookie value
   *   @param {string}           options.path            The path of the cookie
   *   @param {string}           options.domain=string   The domain of the cookie
   *   @param {boolean}          options.httponly=false  Whether to use HTTP only.
   *   @param {boolean}          options.secure=false    Whether it should be secure or not
   *   @param {Number}           options.expires         Number of miliseonds given
   *                                                     with Date.now / Date.getTime
   *                                                      it should be valid
   * @promise {boolean} true if successful, false if not.
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
   * [clearCookie]{@link http://phantomjs.org/api/webpage/method/clear-cookies.html}
   *
   * Deletes all the cookies visible to the current URL.
   *
   * @promise {boolean}
   */
  clearCookies() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'clearCookies');
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
   * @promise
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
   * [deletCookie]{@link http://phantomjs.org/api/webpage/method/delete-cookie.html}
   *
   * Delete any Cookies visible to the current URL with a name that matches
   * the argument.
   *
   * @param {string} name Cookie name
   * @promise {boolean} true if successful, false if not.
   */
  deleteCookie(name) {
    this.throwIfClosed();

    if (typeof name !== 'string') {
      throw new TypeError('Name needs to be a string');
    }

    return utils.genPromiseFn(this.page, 'deleteCookie', name);
  }

  /**
   * *Wrapper Specific*
   *
   * Retrives a cookie by a name. Returns undefined if none is found.
   * Name is not case-sensitive
   *
   * @param  {string} name
   * @promise {object} object of same type as can be found in `addCookie` documentation
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
   * [evaluateJavaScript]{@link http://phantomjs.org/api/webpage/method/evaluate-java-script.html}
   *
   * Evaluate a function as a string. Evaluates the given function string in the context
   * of the webpage. It is very familiar with `evaluate`.
   *
   * @param {string} javaScriptStr
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
   * Evaulates a given function in the context of the webpage without blocking
   * the current execution (Phantom process - not Node). Unlike `evaluate`, this
   * function cannot take any arguments and will not return any values.
   *
   * @param {function} fn Function to be evaluated
   */
  evaluateAsync(fn) {
    this.throwIfClosed();

    if (typeof fn !== 'function') {
      throw new TypeError('Argument needs to be a function');
    }

    return utils.genPromiseFn(this.page, 'evaluateAsync', fn);
  }

  /**
   * [getPage]{@link http://phantomjs.org/api/webpage/method/get-page.html}
   *
   * *Developer Note*: No documentation
   * @param  {string?} windowName
   */
  getPage(windowName) {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'getPage', windowName);
  }

  /**
   * [go]{@link http://phantomjs.org/api/webpage/method/go.html}
   *
   * *Developer Note*: No documentation
   */
  go(index) {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'go', index);
  }

  /**
   * [goBack]{@link http://phantomjs.org/api/webpage/method/go-back.html}
   *
   * *Developer Note*: It is assumed that this performs a go-back command,
   * much like what exists in browsers and returns to the previous page in history.
   */
  goBack() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'goBack');
  }

  /**
   * [goForward]{@link http://phantomjs.org/api/webpage/method/go-forward.html}
   *
   * *Developer Note*: It is assumed that this performs a go-forward command,
   * much like what exists in browsers and goes forward in the history.
   */
  goForward() {
    this.throwIfClosed();
    return utils.genPromiseFn(this.page, 'goForward');
  }

  /**
   * [includeJs]{@link http://phantomjs.org/api/webpage/method/include-js.html}
   *
   * Includes external script from specified URL, usually remote location on the
   * page and executes the callback upon completion.
   *
   * @promise {string} url The url to retrieve the JS from
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
   * @param  {string} filename filename to inject
   * @promise {boolean} true if successful, false otherwise
   */
  injectJs(filename) {
    this.throwIfClosed();

    if (typeof filename !== 'string') {
      throw new TypeError('Filename must be a string');
    }

    return utils.genPromiseFn(this.page, 'injectJs', filename);
  }

  /**
   * [open]{@link http://phantomjs.org/api/webpage/method/open.html}
   *
   * Opens the URL and loads it to the page. Once the page is loaded the promise function
   * is invoked. In addition, the page.onLoadFinished will also be called.
   * Will give a status in the form of 'success' or 'fail' string
   *
   * @param {string} url URL to do the request towards. Can be local file
   * @param {string|object} methodOrSettings The method as a string or a settings object
   *   @param {string}   settings.operation  The type of method - POST / GEt
   *   @param {encoding} settings.encoding   The encoding to use
   *   @param {object}   settings.headers    An object with headers
   *   @param {string}   settings.data       Stringified data (JSON etc)
   * @param {string} data Only used when methodOrSettings is a string
   * @promise {string} status of the load, either 'success' or 'fail'
   */
  open(url, methodOrSettings, data) {
    this.throwIfClosed();

    if (typeof url !== 'string') {
      throw new TypeError('URL has to be a string');
    }

    if (typeof methodOrSettings === 'object') {
      return utils.genPromiseFn(this.page, 'open', url, methodOrSettings);
    }

    return utils.genPromiseFn(this.page, 'open', url, methodOrSettings, data);
  }

  /**
   * [openUrl]{@link http://phantomjs.org/api/webpage/method/open-url.html}
   *
   * *Developer Note*: No documentation
   *
   * @param {string} url
   * @param {httpConf} httpConf
   * @param {settings} settings
   */
  openUrl(url, httpConf, settings) {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'openUrl', url, httpConf, settings);
  }

  /**
   * [reload]{@link http://phantomjs.org/api/webpage/method/reload.html}
   *
   * *Developer Note*: Performs a reload of the page.
   */
  reload() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'reload');
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
   * which gives the PDF back as a binary string.
   *
   * *Another development note*: PhantomJS says to support `GIF` images, however,
   * the documentation on
   * [Qt ImageWriter]{@link http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats}
   * does not include `GIF`.
   * Use with caution.
   * There is also an issue on [this]{@link https://github.com/ariya/phantomjs/issues/13135}
   *
   * @param {string} filename    Where to save the file.
   * @param {string} format=png  If format is not specified, the file extension
   *                             is extracted and used as the format.
   * @param {number} quality=100 String or number value between 0 and 100
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

    // UpperCase'd format screws up PhantomJSs
    // guessing of format
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
   * *Developer note*: PhantomJS says to support gifs, but Qt (library it is using)
   * does not support it. There is also an issue regarding this function
   * and the return of empty strings when using gifs:
   * [issue]{@link https://github.com/ariya/phantomjs/issues/13135}
   *
   * @param  {string} format=png Either 'png', 'gif' or 'jpeg'
   * @promise {string}            base64-encoded string
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
   * [sendEvent]{@link http://phantomjs.org/api/webpage/method/send-event.html}
   *
   * The events are not synthetic DOM events, each event is sent to the web page
   * as if it comes as part of user interaction.
   *
   * Mouse events
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
   * Keyboard events
   * sendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])
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
   * Third and fourth argument are not taken account for keyboard events.
   * Just give null for them.
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
   * [setContent]{@link http://phantomjs.org/api/webpage/method/set-content.html}
   *
   * Allows to set both page.content and page.url properties. The webpage
   * will be reloaded with new content and the current location set as the given
   * url, without any actual http request being made.
   *
   * @param {string} content The HTML content of the webpage
   * @param {string} url     The URL of the webpage
   */
  setContent(content, url) {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'setContent', content, url);
  }

  /**
   * [stop]{@link http://phantomjs.org/api/webpage/method/stop.html}
   *
   * *Developer Note*: It is assumed that this stops the page loading
   */
  stop() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'stop');
  }

  /**
   * [switchToFocusedFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-focused-frame.html}
   *
   * *Developer Note*: No documentation
   */
  switchToFocusedFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToFocusedFrame');
  }

   /**
   * [switchToFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-frame.html}
   *
   * *Developer Note*: No documentation
   */
  switchToFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToFrame');
  }

   /**
   * [switchToMainFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-main-frame.html}
   *
   * *Developer Note*: No documentation
   */
  switchToMainFrame() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'switchToMainFrame');
  }

   /**
   * [switchToParentFrame]{@link http://phantomjs.org/api/webpage/method/switch-to-parent-frame.html}
   *
   * *Developer Note*: No documentation
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
   * @param {string} selector
   * @param {string} filename
   */
  uploadFile(selector, filename) {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'uploadFile', selector, filename);
  }

  /**
   * *Developer Note*: There is little to no documentation on this function,
   * but from what I can gather from an [issue]{@link https://github.com/ariya/phantomjs/issues/10357}
   * on their github, this function clears the HTTP-cache.
   * [Commit]{@link https://github.com/ariya/phantomjs/commit/5768b705a019da719fa356fdbf370f3ea72b4c93}
   */
  clearMemoryCache() {
    this.throwIfClosed();

    return utils.genPromiseFn(this.page, 'clearMemoryCache');
  }

  /**
   * Loads the file before deleting it on both error and success
   * @private
   * @param  {string} loading async file that has already been rendered
   */
  _loadTempFile(filename) {
    return new Promise((resolve, reject) => {
      let data = null;
      let err  = null;
      utils.loadFile(filename)
        .then((x) => {
          data = x;
        })
        .then(() => resolve(data))
        .catch((x) => {
          err = x;
        })
        .then(() => reject(err))
        .catch((err) => reject(err));
    });
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
   * @param {object} options An object with multiple options
   */
  NYI_setOptions() {throw new Error('Not yet implemented');}

  /**
   * *Wrapper Specific*
   *
   * Renders a PDF and returns the content as a binary string. Due to PhantomJS
   * this function has to save a file to disk.
   * This wrapper uses [node-tmp]{@link https://github.com/raszi/node-tmp} to do
   * this. This saves a temporary file (in memory or file, depending on OS), which
   * is deleted after it is completed or throws an error.
   */
  renderPdf() {
    this.throwIfClosed();

    return new Promise((resolve, reject) => {
      temp.file((err, filePath, fd, cleanup) => {
        if (err) {
          return reject(err);
        }

        this.render(filePath, 'pdf')
          .then(() => this._loadTempFile(filePath))
          .then((content) => {
            cleanup();
            resolve(content.toString());
          })
          .catch(err => {
            cleanup();
            reject(err);
          });
      });
    });
  }

  /**
   * *Wrapper Specific*
   *
   * Renders a HTML string to a PDF by saving the HTML as a temporary file,
   * in the directory specified as `templateRenderDir` (this is nessassary
   * due to possible Javascript or CSS files that will be included) before it
   * uses `renderPdf` to save the PDF as a temporary file, loading it and then
   * returning the PDF string
   *
   * If you are sure that the HTML file does not request any JavaScript or
   * CSS files, you can omit the templateRenderDir. The file will then
   * be saved in a temporary directory and rendered like that.
   *
   * @param  {string} htmlString        the HTML string
   * @param  {string} templateRenderDir directory to save the temp HTML file
   * @promise {string}                   PDF
   */
  renderHtml(htmlString, templateRenderDir) {
    this.throwIfClosed();

    if (typeof htmlString !== 'string') {
      throw new TypeError('htmlString has to be a string');
    }

    if (typeof templateRenderDir !== 'string') {
      throw new TypeError('templateRenderDir has to be a string');
    }

    return new Promise((resolve, reject) => {
      utils.isDir(templateRenderDir)
        .then((isDir) => {
          if (!isDir) {
            return reject(new Error('Render directory is not a directory'));
          }

          return utils.generateFilename();
        }).then((generatedFilename) => {
          let fname    = templateRenderDir + '/' + generatedFilename + '.html';
          let contents = '';

          utils.saveFile(fname, htmlString)
            .then(() => this.open(fname))
            .then(() => this.renderPdf())
            .then((content) => {
              contents = content;
              return utils.deleteFile(fname);
            })
            .then(() => resolve(contents))
            .catch((err) => reject(err));
      }).catch((err) => reject(err));
    });
  }

  /**
   * *Wrapper Specific*
   *
   * Expects a template that has a .render function that takes the options
   * sent to it. A structure of such an example can be seen
   * at [reewr-template]{@link https://github.com/Reewr/reewr-template}.
   *
   * This function will render the the template into a PDF and returns the
   * content as a binary string
   *
   * @param  {object} template          template object with a .render function
   * @param  {string} templateRenderDir Where to render the html file
   * @param  {object} options           options that should be sent to the .render function
   * @promise {string}                  PDF string
   */
  renderTemplate(template, templateRenderDir, options) {
    this.throwIfClosed();

    if (!template || typeof template.render !== 'function') {
      throw new TypeError('Template argument is invalid - must have a render function');
    }

    if (typeof templateRenderDir !== 'string') {
      throw new TypeError('Template render directory must be a string');
    }

    let html = template.render(options);

    if (typeof html !== 'string') {
      throw new TypeError('template.render does not return a string');
    }

    return this.renderHtml(html, templateRenderDir);
  }

  /**
   * Sets a handler by the name given and checks the handler
   * to see whether it is a function or not.
   * Throws TypeError if it isnt a function.
   *
   * @private
   * @param {string}   name    name of the handler
   * @param {function} handler
   */
  _setHandler(name, handler) {
    this.throwIfClosed();

    if (typeof handler !== 'function') {
      throw new TypeError('Handler needs to be a function');
    }

    this.page[name] = handler;
  }

  /**
   * [onAlert]{@link http://phantomjs.org/api/webpage/handler/on-alert.html}
   *
   * This callback is invoked when there is a JavaScript alert on the web page.
   * The only argument passed to the callback is the string for the message.
   * There is no return value expected from the callback handler.
   *
   * @param  {function} handler `function(message) {}`
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
   * @param  {function} handler `function(object) {}`
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
   * @param  {function} handler `function(closingPage) {}`
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
   * @param {function} handler `function(message) {}`
   */
  onConfirm(handler) {
    this._setHandler('onConfirm', handler);
  }

  /**
   * [onConsoleMessage]{@link http://phantomjs.org/api/webpage/handler/on-console-message.html}
   *
   * This callback is invoked when there is a JavaScript console message on
   * the web page. The callback may accept up to three arguments:
   *   - the string for the message,
   *   - the line number,
   *   - and the source identifier.
   *
   * By default, console messages from the web page are not displayed.
   * Using this callback is a typical way to redirect it.
   *
   * Note: line number and source identifier are not used yet,
   * at least in phantomJS <= 1.8.1. You receive undefined values.
   *
   * @param {function} handler `function(message, lineNumber, sourceId) {}`
   */
  onConsoleMessage(handler) {
    this._setHandler('onConsoleMessage', handler);
  }

  /**
   * [onFilePicker]{@link http://phantomjs.org/api/webpage/handler/on-file-picker.html}
   *
   * *Developer Note*: No documentation, but it expects a return value, therefore
   * you will need to use .setFn to set this
   * @param {function} handler Handler `function(oldFile) {}`
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
   * is already initialize when recieved through a promise.
   *
   * @param  {function} handler `function() {}`
   */
  onInitialized(handler) {
    this._setHandler('onInitialized', handler);
  }

  /**
   * [onLoadFinished]{@link http://phantomjs.org/api/webpage/handler/on-load-finished.html}
   *
   * This callback is invoked when the page finishes the loading. It may accept a single argument
   * indicating the page's status: 'success' if no network error occured, otherwise 'fail'.
   *
   * Also see `page.open` for an alternate hook for the `onLoadFinished` callback.
   *
   * @param  {function} handler `function(status) {}`
   */
  onLoadFinished(handler) {
    this._setHandler('onLoadFinished', handler);
  }

  /**
   * [onLoadStarted]{@link http://phantomjs.org/api/webpage/handler/on-load-started.html}
   *
   * This callback is invoked when the page sarts the loading. There is no argument
   * passed to the callback.
   *
   * @param  {function} handler `function() {}`
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
   * @param  {function} handler `function(url, type, willNavigate, main) {}`
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
   * @param  {function} handler `function(newPage) {}`
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
   * @param  {function} handler `function(msg, defaultVal) {}`
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
   * @param  {function} handler `function(resourceError) {}`
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
   * @param  {function} handler `function(response) {}`
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
   * *NOTE*: Currently, the networkRequest object does not contain any functions.
   * This is due to an implementation issue in node-phantom-simple. An issue
   * has been created regarding [this]{@link https://github.com/baudehlo/node-phantom-simple/issues/98}
   *
   * Due to the asynchronous nature of node-phantom-simple, impelementing these functions
   * are simply too difficult. The networkRequest object is therefore an empty object
   *
   * @param  {function} handler `function(requestData, networkRequest) {}`
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
   * @param  {function} handler `function(request) {}`
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
   * @param  {function} handler `function(targetUrl) {}`
   */
  onUrlChanged(handler) {
    this._setHandler('onUrlChanged', handler);
  }

}

/**
 * A list of settings that should not be sent through `set` as they are
 * read-only variables
 *
 * @type {Arrays(string)}
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
 * @type {Array(string)}
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
  'paperSize.header.height',                 // string
  'paperSize.header.contents',               // function
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
 * @type {Array(string)}
 */
Page.allowedGetProperties = [].concat(
  Page.readOnlyProperties,
  Page.allowedSetProperties
);

/**
 * A list of settings that are undocumented in type and should therefore
 * not be type-checked when that is implemented in the future
 *
 * @type {Array(string)}
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
 * @type {Array(string)}
 */
Page.base64Formats = ['png', 'gif', 'jpeg'];

/**
 * A list of allowed formats for the render function
 *
 * @type {Array(string)}
 */
Page.validRenders = Page.base64Formats.concat(['pdf']);

module.exports = Page;
