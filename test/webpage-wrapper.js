'use strict';
const test    = require('bandage');
const driver  = require('../lib/phantom-promise');
const utils   = require('../lib/utils');
const pageW   = require('../lib/webpage-wrapper');

const isErrorEqual = function* (t, message, fn, err) {
  let numTest = err && err.message === '' ? 2 : 3;

  yield t.test(message, function* (st) {
    st.plan(numTest);
    st.throws(fn, 'It should throw');

    let caughtErr = yield fn().then(() => {}).catch(err => err);

    st.equals(caughtErr.name, err.name, 'Error names should be equal');

    if (numTest === 2) {
      return;
    }

    st.equals(caughtErr.message, err.message, 'Error messages should be equal');
  });
};

const phantom = driver.create().then(() => {

test('Should create a webpage object', function* T(t) {
  let page = yield phantom.createPage();

  t.ok(page instanceof pageW, 'Page should be instance of pageWrapper');

  yield page.close();
});

test('Should remove functions after close', function * T(t) {
  let page = yield phantom.createPage();

  yield page.close();

  t.notOk(page.close, 'Page.close should be a false value');
});

test('Page.Open, Page.onLoadStarted, Page.onLoadFinished', function* T(t) {
  let page = yield phantom.createPage();

  t.plan(2);
  page.onLoadStarted(function() { t.pass('onLoadStarted called'); });
  page.onLoadFinished(function() { t.pass('onLoadFinished called'); });
  yield page.open('./test/resources/test.html');

  yield page.close();
});

test('Page.addCookie, Page.getCookie, Page.clearCookies, Page.deleteCookie', function* T(t) {
  let page = yield page.createPage();
  let cookieOptions = {
    name    : 'phantom-cookie',
    value   : 'phantom-value',
    path    : '/',
    domain  : 'google.com',
    httponly: false,
    secure  : false
  };
  let filterCookie = x => x.name && x.name === cookieOptions.name;

  yield t.test('Should throw error on invalid input', function ST(st) {
    let undef;
    let noName  = {value: 'test', path : '/'};
    let noValue = {name : 'test', path : '/'};
    let noPath  = {name : 'test', value: 'test-val'};

    isErrorEqual('page.addCookie should throw on no inputs or empty object', st, () => {
      return page.addCookie(undef);
    }, new TypeError('Options has to be an object'));

    isErrorEqual('page.addCookie should throw on no name', st, () => {
      return page.addCookie(noName);
    }, new TypeError('Options.name has to be defined as a string'));

    isErrorEqual('page.addCookie should throw on no value', st, () => {
      return page.addCookie(noValue);
    }, new TypeError('Options.value has to be defined as a string'));

    isErrorEqual('page.addCookie should throw on no path', st, () => {
      return page.addCookie(noPath);
    }, new TypeError('Options.path has to be defined as a string'));

    isErrorEqual('page.deleteCookie should throw on no name or not string', st, () => {
      return page.deleteCookie(5);
    }, new TypeError('Name needs to be a string'));

    isErrorEqual('page.getCookie should throw on no name or not string', st, () => {
      return page.getCookie(5);
    }, new TypeError('Name needs to be a string'));
  });

  yield t.test('Should add cookie', function* ST(st) {
    let addedCookie = yield page.addCookie(cookieOptions);
    let cookies = yield page.get('cookies');
    let cookie  = cookies.filter(filterCookie)[0];

    st.ok(addedCookie, 'Should return true on successful add');
    st.equals(cookies.length, 1, 'Cookies array should one element');
    st.equals(cookie, cookieOptions, 'Cookie should be equal to added cookie');
  });

  yield t.test('Should delete cookies', function* ST(st) {
    let cookies = yield page.get('cookies');
    let cookie  = cookies.filter(filterCookie)[0];

    st.equals(cookies.length, 1, 'Cookie object contain 1 element from previous test');
    st.equals(cookie, cookieOptions, 'Cookie should be equal to previously added cookie');

    let result = yield page.deleteCookie(cookieOptions.name);
    cookies = yield page.get('cookies');
    cookie  = cookies.filter(filterCookie)[0];

    st.ok(result, 'Result should be true, indicating deletion of cookie');
    st.equals(cookies.length, 0, 'Cookies list should be empty');
    st.equals(cookie, undefined, 'Cookie shoule be undefined');
  });

  yield t.test('Should be able to get cookies through getCookie', function *ST(st) {
    let addedCookie = yield page.addCookie(cookieOptions);
    let cookies = yield page.get('cookies');
    let cookie1 = yield page.getCookie(cookieOptions.name);
    let cookie2 = cookies.filter(filterCookie)[0];

    st.ok(addedCookie, 'Should return true on successful add of cookie');
    st.equals(cookies.length, 1, 'Cookie should exist');
    st.equals(cookie1, cookie2, 'Cookie gotten through `cookies` should be equal to getCookie');
  });

  yield t.test('Should clear all cookies', function *ST(st) {
    let result  = yield page.clearCookies();
    let cookies = yield page.get('cookies');
    let cookie  = yield page.getCookie(cookieOptions.name);

    st.ok(result, 'Result shoule be true, indicating clearing of cookies');
    st.equals(cookies.length, 0, 'The cookie array should be empty');
    st.equals(cookie, undefined, 'The cookie should be undefined');
  });

  yield page.close();
});

test('Page.set, Page.get, Page.NYI_setOptions', function* T(t) {
  let page = phantom.createPage();

  yield t.test('Should throw error on invalid input', function ST(st) {

    isErrorEqual('page.set should throw on invalid key', st, () => {
      return page.set('this-property-does-not-exist', 5);
    }, new TypeError());

    isErrorEqual('page.set should throw on read-only values', st, () => {
      return page.set('framePlainText', '');
    }, new TypeError());

    isErrorEqual('page.get should throw on invalid key', st, () => {
      return page.get('this-property-does-not-exist', 5);
    }, new TypeError());

    isErrorEqual('page.NYI_setOptions should throw on error on call', st, () => {
      return page.NYI_setOptions();
    }, new Error('Not yet implemented'));
  });

  yield t.test('Should set property and be able to retrieve, no object', function* ST(st) {
    let setWidth = 500;
    let result = yield page.set('viewportSize.width', setWidth);
    let width  = yield page.get('viewportSize.width');

    st.ok(result, 'Should return true to indicate setting of variable');
    st.equals(width, setWidth, 'Value should be set and retrievable');
  });

  yield t.test('Should set property and be able to retrieve, object', function* ST(st) {
    let setViewportSize = {width: 1000, height: 1000};
    let result       = yield page.set('viewportSize', setViewportSize);
    let viewportSize = yield page.get('viewportSize');
    let width        = yield page.get('viewportSize.width');
    let height       = yield page.get('viewportSize.height');

    st.ok(result, 'Should return true to indicate setting of variable');
    st.equals(setViewportSize, viewportSize, 'Objects should be equal');
    st.equals(setViewportSize.width, width, 'Width should be equal');
    st.equals(setViewportSize.height, height, 'Height should be equal');
  });

  yield page.close();
});

test('Page.injectJs, Page.evaluate, Page.onConsoleMessage, Page.open', function* T(t) {
  let page = yield phantom.create();
  let file = './test/resources/test.html';
  let url  = 'http://www.google.com';

  yield t.test('Should throw errors on invalid input', function ST(st) {
    isErrorEqual('page.evaluate should throw when a function is not given as first argument', st, () => {
      return page.evaluate(5, function() {});
    }, new TypeError('First argument must be the function that is to be evaluted'));

    isErrorEqual('page.injectJs should throw on non-strings', st, () => {
      return page.injectJs(5);
    }, new TypeError('Filename must be a string'));

    isErrorEqual('page.onConsoleMessage should throw on non-functions', st, () => {
      return page.onConsoleMessage('test');
    }, new TypeError('Handler needs to be a function'));

    isErrorEqual('page.open should throw on non-strings for URLs', st, () => {
      return page.open({'this-is-not-a-string': true});
    }, new TypeError('URL has to be a string'));
  });

  yield t.test('page.open should be able to open both files and webpages', function* ST(st) {
    let statusWebpage = yield page.open(url);
    let statusFile    = yield page.open(file);

    st.equals(statusWebpage, 'success', 'Webpage should be successful');
    st.equals(statusFile, 'success', 'File opening should be successful');
  });

  yield t.test('page.evaluate should take in arguments, do something and return', function* ST(st) {
    let status = yield page.open(file);
    let fn = function(number) {
      return typeof number === 'number' ? 15 : -1;
    };

    let resultEval1 = yield page.evaluate(fn, 10);
    let resultEval2 = yield page.evaluate(fn, 'string');

    st.equals(status, 'success', 'Page.open should be successful');
    st.equals(resultEval1, 15, 'Page.evaluate should return 15 on numbers');
    st.equals(resultEval2, -1, 'Page.evaluate should return -1 on anything else');
  });

  yield t.test('page.onConsoleMessage should catch messages', function* ST(st) {
    st.plan(3);
    let status  = yield page.open(file);
    let message = 'This is a message';
    let fn = function(incMessage) {
      console.log(incMessage);
      return true;
    };

    page.onConsoleMessage(function(incMessage) {
      st.pass('Caught console message');
      st.equals(message, incMessage, 'Messages should be equal');
    });

    let resultEval = yield page.evaluate(fn, message);

    st.equals(status, 'success', 'page.open should return "success"');
    st.ok(resultEval, 'page.Evaluate should return true');
  });

  yield t.test('page.injectJs should inject JavaScript and run it.', function* ST(st) {
    st.plan(5);
    let testFn = function testFunction() { console.log('I was called'); };
    let status = yield page.open('./test/resources/test.html');

    yield utils.saveFile('./test/resources/js.js', testFn.toString());

    page.onConsoleMessage(function(message) {
      st.pass('Caught console message');
      st.equals('I was called', message, 'Messages should be equal');
    });

    let resultInject = yield page.injectJs('./test/resources/js.js');
    let resultEval   = yield page.evaluate(function() {
      /* jshint ignore:start */
      testFunction(); // js-hint complains that this does not exist, this is browser scope
      /* jshint ignore:end */
      return 5;
    });

    st.equals(status, 'success', 'Page.open should be successful');
    st.ok(resultInject, 'Page.injectJs should be truish');
    st.equals(resultEval, 5, 'Page.injectJS should be true');

    yield utils.deleteFile('./test/resources/js.js');
  });

  yield page.close();
});

test('Page.onResourceRequested, page.onResourceRecieved, page.onResourceError', function* T(t) {
  let page = yield phantom.createPage();

  yield t.test('Should throw errors on invalid input', function ST(st) {

    isErrorEqual('page.onResourceRequested should throw on non-functions', st, () => {
      return page.onResourceRequested('test');
    }, new TypeError('Handler needs to be a function'));

    isErrorEqual('page.onResourceReceived should throw on non-functions', st, () => {
      return page.onResourceReceived('test');
    }, new TypeError('Handler needs to be a function'));

    isErrorEqual('page.onResourceError should throw on non-functions', st, () => {
      return page.onResourceError('test');
    }, new TypeError('Handler needs to be a function'));

  });

  yield t.test('Should call resourceRequested, resourceRecieved', function* ST(st) {
    page.onConsoleMessage(function(message) {
      st.equals(message, 'Script loaded', 'Script should call console.log');
    });

    /* jshint ignore:start */
    // Network data has to be defined, otherwise requestData is an array of two elements
    page.onResourceRequested(function(requestData, networkData) {

      if (requestData.url.indexOf('html') !== -1) {
        st.ok(requestData.url.indexOf('test-resource.html') !== -1, 'Requested: test-resource.html');
      } else {
        st.ok(requestData.url.indexOf('test-resource.js') !== -1, 'Requested: test-resource.js');
      }
    });
    /* jshint ignore:end */

    page.onResourceReceived(function(response) {
      let hasHTML = response.url.indexOf('html') !== -1;

      if (hasHTML && response.stage === 'start') {
        st.ok(response.url.indexOf('test-resource.html') !== -1, 'Receieved Start: test-resource.html');
      } else if (response.stage === 'start') {
        st.ok(response.url.indexOf('test-resource.js') !== -1, 'Receieved Start: test-resource.js');
      }

      if (hasHTML && response.stage === 'end') {
        st.pass('Receieved End: test-resource.html');
      } else if (response.stage === 'end') {
        st.pass('Receieved End: test-resource.js');
      }
    });

    page.onResourceError(function(err) {
      console.log(err);
    });

    yield page.open('./test/resources/test-resource.html');
  });

  yield page.close();
});

test('Page.renderBase64, page.renderPDF, page.renderTemplate, page.render', function * T(t) {
  let page = yield phantom.createPage();

  yield t.test('Should throw errors on invalid input', function ST(st) {
    let renderBase64Msg = 'page.renderBase64 should throw error on invalid format';
    let renderPDFMsg1   = 'page.renderPDF should throw error non-strings';
    let renderPDFMsg2   = 'page.renderPDF should throw error on non-directory';
    let renderTemp1Msg  = 'page.renderTemplate should throw on non-objects without .render function';
    let renderTemp2Msg  = 'page.renderTemplate should throw on .render functions not returning strings';

    isErrorEqual(renderBase64, st, () => page.renderBase64(), new TypeError());
    isErrorEqual(renderPDFMsg1, st, () => page.renderPDF(), new TypeError());
    isErrorEqual(renderPDFMsg2, st, () => page.renderPDF('./not-a-directory'), new TypeError());
    isErrorEqual(renderTemp1Msg, st, () => page.renderTemplate({}), new TypeError());
    isErrorEqual(renderTemp2Msg, st, () => {
      return page.renderTemplate({render: () => true})
    }, new TypeError());

  });
});

// test('Page should renderBase64 images', function* T(t) {
//   let page  = yield phantom.createPage();

//   yield page.open('./test/resources/test.html');
//   let res = yield page.renderBase64('png');

//   t.ok(res, 'Result should be defined');

//   yield page.close();
// });


// }).catch(err => {throw err;});

// test('Page should be able to render pdf to file', function * T(t) {
//   let page  = yield phantom.createPage();

//   yield page.open('./test/resources/test.html');
//   yield page.render('./test/resources/test-pdf.pdf', {format: 'pdf'});

//   let myFile = yield utils.loadFile('./test/resources/test-pdf.pdf');
//   yield utils.deleteFile('./test/resources/test-pdf.pdf');

//   t.ok(myFile, 'PDF should exist');

//   yield page.close();
// });

// test('Page should be able to render pdf to string', function* T(t) {
//   let page  = yield phantom.createPage();

//   yield page.open('./test/resources/test.html');
//   let file = yield page.renderPDF('./test');

//   t.ok(file.toString(), 'PDFs should be equal');

//   yield page.close();
// });

// test('Page should fail on render pdf to string if temp directory is not set', function* T(t) {
//   t.plan(2);

//   let page = yield phantom.createPage();

//   yield page.open('./test/resources/test.html');

//   try {
//     yield page.renderPDF();
//   } catch (err) {
//     t.ok(err, 'Error is defined');
//     t.equals(err.message, 'Temporary Directory has to be a string', 'Error should be descriptive');
//   }

//   yield page.close();
// });

// test('Page.renderTemplate should accept an object with render function', function* T(t) {
//   t.plan(2);

//   let page           = yield phantom.createPage({templateRenderDir: './test'});
//   let sentOptions    = {this: 'should', be: 'sent', to: 'render'};
//   let templateObject = {
//     render: function(options) {
//       t.pass('Render was called');
//       t.equals(sentOptions, options, 'Options should be sent to it');
//       return '' +
//         '<!DOCTYPE html>' +
//         '<html>' +
//         '<head><title>Test</title></head>' +
//         '<body>Body</body>' +
//         '</html>';
//     }
//   };

//   let file = yield page.renderTemplate(templateObject, sentOptions);

//   t.ok(file, 'FileString should be defined');

//   yield page.close();
// });

