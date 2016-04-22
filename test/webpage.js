/* globals alert, prompt, describe, it, before, after, beforeEach, afterEach*/
'use strict';
const chai   = require('chai');
const driver = require('../index');
const utils  = require('../lib/utils');
const Page   = require('../lib/webpage');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;
const expectDoneCalls = function(num, done) {
  return function(err) {
    if (err) {
      return done(err);
    }
    num--;

    if (num <= 0) {
      return done();
    }
  };
};

describe('Page', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';
  let resourcePage = './test/resources/test-resource.html';
  let cookieOptions = {
    name    : 'phantom-cookie',
    value   : 'phantom-value',
    path    : '/',
    httponly: false,
    secure  : false,
    expires : (new Date()).getTime() + (1000 * 60 * 60)
  };

  before(function startPhantom(done) {
    driver.create().then((ph) => {
      phantom = ph;
      done();
    }).catch((err) => done(err));
  });

  after(function stopPhantom(done) {
    phantom.exit().then(done).catch(done);
  });

  beforeEach(function startPage(done) {
    if (page) {
      throw new Error('Page was not closed');
    }

    phantom.createPage().then(p => {
      page = p;
      done();
    }).catch(err => done(err));
  });

  afterEach(function closePage(done) {
    if (!page) {
      return done();
    }

    page.close().then(() => {
      page = null;
      done();
    }).catch(err => done(err));
  });

  describe('Page.open', function() {
    it('should throw on invalid options', function() {
      expect(() => page.open(5)).to.throw(TypeError);
      expect(() => page.open({})).to.throw(TypeError);
    });

    it('should open page, call onLoadStarted, then onLoadFinished', function(done) {
      let isDone = expectDoneCalls(3, done);

      page.onLoadStarted(() => isDone());
      page.onLoadFinished(() => isDone());
      page.open(testPage, {operation: 'GET'}).then((status) => {
        expect(status).to.be.equal('success');
        isDone();
      }).catch(err => done(err));
    });

    it('should open both files and webpages', function(done) {
      this.timeout(5000);
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return page.open('http://www.google.com').should.eventually.equal('success');
      }).then(() => {
        return page.clearCookies();
      }).should.notify(done);
    });
  });

  describe('Page.setContent', function() {
    it('should throw error on invalid input', function() {
      expect(() => page.setContent()).to.throw(TypeError);
      expect(() => page.setContent('content')).to.throw(TypeError);
      expect(() => page.setContent('content', 5)).to.throw(TypeError);
    });

    it('should set the content', function(done) {
      let content = {url: 'http://www.mywebpage.com/', content: 'Content'};

      let fn = function() {
        return {url: window.location.href, content: document.body.innerHTML};
      };

      let html = '<html><head><title>title</title></head>' +
          '<body>' + content.content + '</body>';

      page.setContent(html, content.url).then(() => {
        return page.evaluate(fn);
      }).should.eventually.deep.equal(content).notify(done);
    });
  });

  describe('Page.addCookie', function() {
    it('should throw on no inputs', function() {
      expect(() => page.addCookie()).to.throw(TypeError);
    });

    it('should throw on empty object', function() {
      let empty = {};
      expect(() => page.addCookie(empty)).to.throw(TypeError);
    });

    it('should throw on options without name', function() {
      let noName = {value: 'test', path: '/'};
      expect(() => page.addCookie(noName)).to.throw(TypeError);
    });

    it('should throw on options without value', function() {
      let noValue = {name: 'test', path: '/'};
      expect(() => page.addCookie(noValue)).to.throw(TypeError);
    });

    it('should throw on options without path', function() {
      let noPath = {name: 'test', value: 'test-val'};
      expect(() => page.addCookie(noPath)).to.throw(TypeError);
    });

    it('should add cookie and return true', function(done) {
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return page.addCookie(cookieOptions);
      }).should.eventually.equal(true).then(() => {
        return page.getCookie(cookieOptions.name);
      }).then(cookie => {
        return cookie.name === cookieOptions.name;
      }).should.eventually.equal(true).notify(done);
    });
  });

  describe('Page.getCookie', function() {
    it('should throw on no name or not a string', function() {
      expect(() => page.getCookie()).to.throw(TypeError);
    });

    it('should get cookie by name if exists', function(done) {
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return page.addCookie(cookieOptions);
      }).should.eventually.equal(true).then(() => {
        return page.getCookie(cookieOptions.name);
      }).then(cookie => {
        return cookie.name === cookieOptions.name;
      }).should.eventually.equal(true).notify(done);
    });

    it('should return undefined on cookies that does not exist', function() {
      return page.getCookie('does-not-exist').should.eventually.equal(undefined);
    });
  });

  describe('Page.deleteCookie', function() {
    it('should throw on no name or not a string', function() {
      expect(() => page.deleteCookie()).to.throw(TypeError);
    });

    it('should delete cookie and return true', function(done) {
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return page.addCookie(cookieOptions);
      }).should.eventually.equal(true).then(() => {
        return page.getCookie(cookieOptions.name);
      }).then(cookie => {
        return cookie.name === cookieOptions.name;
      }).should.eventually.equal(true).then(() => {
        return page.deleteCookie(cookieOptions.name);
      }).should.eventually.equal(true).notify(done);
    });
  });

  describe('Page.clearCookies', function(done) {
    it('should clear all cookies added and return true', function() {
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return page.addCookie(cookieOptions);
      }).should.eventually.equal(true).then(() => {
        return page.getCookie(cookieOptions.name);
      }).then(cookie => {
        return cookie.name === cookieOptions.name;
      }).should.eventually.equal(true).then(() => {
        return page.clearCookies();
      }).should.eventually.equal(true).notify(done);
    });
  });

  describe('Page.getPage', function() {
    it('should throw error on non-strings', function() {
      expect(() => page.getPage({not: 'a string'})).to.throw(TypeError);
    });

    it('should return null on windows that does not exist', function() {
      return page.getPage('someName').should.eventually.equal(null);
    });
  });

  describe('Page.set', function() {
    it('should throw on keys that doesn\'t exist', function() {
      expect(() => page.set('this-does-not-exist')).to.throw(TypeError);
    });

    it('should throw on keys that are read only', function() {
      expect(() => page.set('framePlainText')).to.throw(TypeError);
    });

    it('should set valid values', function(done) {
      let height = 400;
      return page.set('viewportSize.height', height).should.eventually.equal(true).then(() => {
        return page.get('viewportSize.height').should.eventually.equal(height).notify(done);
      });
    });
  });

  describe('Page.go', function() {
    it('should throw on non-numbers', function() {
      expect(() => page.go('string')).to.throw();
    });

    it('should return false when it does not move', function() {
      return page.go(5).should.eventually.equal(false);
    });
  });

  describe('Page.go[Forward|Back]', function() {
    it('should return false when it does not move', function() {
      return page.goBack().should.eventually.equal(false);
    });

    it('should return false when it does not move', function() {
      return page.goForward().should.eventually.equal(false);
    });
  });

  describe('Page.get', function() {
    it('should throw on keys that doesn\'t exist', function() {
      expect(() => page.get('this-does-not-exist')).to.throw(TypeError);
    });

    it('should retrieve values', function(done) {
      let viewportSize = {height: 500, width: 600};
      return page.set('viewportSize', viewportSize).should.eventually.equal(true).then(() => {
        return page.get('viewportSize').should.eventually.deep.equal(viewportSize).notify(done);
      });
    });
  });

  describe('Page.NYI_setOptions', function() {
    it('should throw an error', function() {
      expect(() => page.NYI_setOptions()).to.throw(Error);
    });
  });

  describe('Page.onConsoleMessage', function() {
    it('should throw error on non-functions', function() {
      expect(() => page.onConsoleMessage(5)).to.throw(TypeError);
    });

    it('should give be called with console messages from client', function(done) {
      page.onConsoleMessage(function(message) {
        expect(message).to.equal('Script loaded');
        done();
      });
      page.open(resourcePage);
    });
  });

  describe('Page.evaluate', function() {
    it('should throw error on non-functions as first argument', function() {
      expect(() => page.evaluate(5, function() {})).to.throw(TypeError);
    });

    it('should evaluate a function and call it', function(done) {
      let sendMessage = 'Hello World!';
      page.onConsoleMessage(function(message) {
        expect(message).to.equal(sendMessage);
        done();
      });

      return page.open(testPage).then(() => {
        return page.evaluate(function(msg) {
          console.log(msg);
          return 5;
        }, sendMessage).should.eventually.equal(5);
      }).should.eventually.equal('success');
    });

    it('should pass arguments to evaluated fn and return values', function() {
      let object = {hello: 'world'};
      return page.evaluate(function(o) {
        return o;
      }, object).should.eventually.deep.equal(object);
    });
  });

  describe('page.evaluateAsync', function() {
    it('should throw on non-functions', function() {
      expect(() => page.evaluateAsync(5)).to.throw(TypeError);
    });

    it('should execute the function, but return undefined', function(done) {
      this.timeout(5000);
      let sendMessage = 'this is a message';
      page.onConsoleMessage(function(message) {
        expect(message).to.equal(sendMessage);
        done();
      });

      page.open('http://www.google.com').then(() => {
        page.evaluateAsync(function(args) {
          console.log('this is a message', args);
        }, 1000, ['test']).should.eventually.equal(undefined).notify(done);
      });
    });
  });

  describe('Page.evaluateJavascript', function() {
    it('should throw on non-strings', function() {
      expect(() => page.evaluateJavaScript({})).to.throw(TypeError);
      expect(() => page.evaluateJavaScript(5)).to.throw(TypeError);
      expect(() => page.evaluateJavaScript(null)).to.throw(TypeError);
    });

    let fn = function() {
      return 5 + 5;
    }.toString();

    it('should execute string functions and return correct result', function() {
      return page.evaluateJavaScript(fn.toString()).should.eventually.equal(10);
    });

    it('should execute string functions and return correct result', function() {
      return page.evaluateJavaScript(fn.toString()).should.eventually.not.equal(11);
    });
  });

  describe('Page.onAlert', function() {
    let msg = 'I am alert';

    let fn = function() {
      alert('I am alert');
      return true;
    };

    it('should be called whenever alerts are raised', function(done) {
      let isDone = expectDoneCalls(2, done);

      page.onAlert(function(message) {
        expect(message).to.equal(msg);
        isDone();
      });

      page.open(testPage)
        .then(() => page.evaluate(fn)).should.eventually.equal(true).notify(isDone);
    });
  });

  describe('Page.includeJs', function() {
    it('should throw on non-strings', function() {
      expect(() => page.includeJs({})).to.throw(TypeError);
      expect(() => page.includeJs(5)).to.throw(TypeError);
      expect(() => page.includeJs(null)).to.throw(TypeError);
    });

    let scriptUrl = 'https://raw.githubusercontent.com/Reewr/promise-phantom/master/test/resources/test-resource.js';
    let message = 'Script loaded';

    it('should retrieve JS from a website', function(done) {
      this.timeout(5000);
      let isDone = expectDoneCalls(2, done);

      page.onConsoleMessage(function(msg) {
        expect(msg).to.equal(message);
        isDone();
      });
      page.includeJs(scriptUrl).should.eventually.equal('success').notify(isDone);
    });
  });

  describe('Page.injectJs', function() {
    let testFn = function testFunction() {
      console.log('I was called');
      return 5;
    };
    let injectFile = './test/resources/js.js';

    it('should throw on non-strings', function() {
      expect(() => page.injectJs(5)).to.throw(TypeError);
    });

    before(function(done) {
      utils.saveFile(injectFile, testFn.toString())
        .then(done)
        .catch(done);
    });

    after(function(done) {
      utils.wait(500).then(() => {
        return utils.deleteFile(injectFile);
      }).then(done).catch(done);
    });

    it('should inject and run Javascript', function(done) {
      page.onConsoleMessage(function(message) {
        expect(message).to.equal('I was called');
      });
      // testFunction is defined, but not in this scope (node-scope)
      return page.open(testPage).then(() => {
        return page.injectJs(injectFile).should.eventually.equal(true).then(() => {
          return page.evaluate(function() {
            /* jshint ignore:start */
            return testFunction();
            /* jshint ignore:end */
          }).should.eventually.equal(5).notify(done);
        });
      });
    });
  });

  describe('Page.onResourceRequested', function() {
    it('should throw errors on non-functions', function() {
      expect(() => page.onResourceRequested(5)).to.throw(TypeError);
    });

    /* jshint ignore:start */
    it('should call when requesting data', function(done) {
      // network data has to be defined, otherwise requestData is an array
      page.onResourceRequested(function(requestData, networkData) {
        expect(requestData.url.indexOf('html')).to.not.equal(-1);
        done();
      });

      return page.open(testPage).should.eventually.equal('success');
    });
    /* jshint ignore:end */
  });

  describe('Page.onResourceReceived', function() {
    it('should throw errors on non-functions', function() {
      expect(() => page.onResourceReceived(5)).to.throw(TypeError);
    });

    it('should call when getting data', function(done) {
      let isDone = expectDoneCalls(2, done);
      page.onResourceReceived(function(response) {
        expect(response.url.indexOf('html')).to.not.equal(-1);
        isDone();
      });

      return page.open(testPage).should.eventually.equal('success');
    });
  });

  describe('Page.onResourceError', function() {
    it('should throw errors on non-functions', function() {
      expect(() => page.onResourceError(5)).to.throw(TypeError);
    });

    it('should call when it causes an error', function(done) {
      page.onResourceError(function(err) {
        expect(err).to.not.be.equal(undefined);
        expect(err.url.indexOf('does-not-exist.js')).to.not.equal(-1);
        done();
      });

      return page.open(resourcePage).should.eventually.equal('success');
    });
  });

  describe('Page.renderBase64', function() {
    it('should throw errors on invalid formats', function() {
      expect(() => page.renderBase64('not-accepted')).to.throw(TypeError);
    });

    it('should render images to a base64 string', function() {
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return Promise.all([
          page.renderBase64().should.eventually.not.equal(''),
          page.renderBase64('jpeg').should.eventually.not.equal(''),
          page.renderBase64('gif').should.eventually.not.equal('')
        ]);
      });
    });
  });

  describe('Page.render', function() {
    let file1 = './test/resources/rendered_png.png';
    let file2 = './test/resources/rendered_jpg.jpeg';
    let file3 = './test/resources/rendered_pdf.pdf';

    it('should throw on non-string filenames', function() {
      expect(() => page.render(5)).to.throw(TypeError);
    });

    it('should throw on non-accepted format', function() {
      expect(() => page.render('filename.myown')).to.throw(TypeError);
    });

    it('should throw on invalid quality', function() {
      expect(() => page.render('myfile.pdf', 'pdf', 'not')).to.throw(TypeError);
    });

    it('should render images to file', function(done) {
      this.timeout(5000);
      return page.open(testPage).should.eventually.equal('success').then(() => {
        return Promise.all([
          page.render(file1).should.eventually.equal(true),
          page.render(file2).should.eventually.equal(true),
          page.render(file3).should.eventually.equal(true)
        ]).then(() => {
          return Promise.all([
            utils.deleteFile(file1),
            utils.deleteFile(file2),
            utils.deleteFile(file3)
          ]).should.notify(done);
        });
      });
    });
  });

  describe('Page.renderPdf', function() {
    it('should render template to a buffer', function(done) {
      return page.open(testPage).then(() => {
        return page.renderPdf();
      }).should.eventually.be.instanceOf(Buffer).notify(done);
    });
  });

  describe('Page.renderTemplate', function() {
    it('should throw on non-objects without .render function', function() {
      expect(() => page.renderTemplate({})).to.throw(TypeError);
    });

    it('should throw on .render functions that does not return strings', function() {
      expect(() => page.renderTemplate({render: () => true})).to.throw(TypeError);
    });

    it('should render templates to a buffer', function(done) {
      let sentOptions = {this: 'should', be: 'sent', to: 'render'};
      let templateObject = {
        render: (options) => {
          expect(options).to.deep.equal(sentOptions);
          return '' +
            '<!DOCTYPE html>' +
            '<html>' +
            '<head><title>Test</title></head>' +
            '<body>Body</body>' +
            '</html>';
        }
      };

      return page.renderTemplate(templateObject, sentOptions)
        .should
        .eventually
        .be
        .instanceOf(Buffer).notify(done);
    });
  });

  describe('Page.renderHtml', function() {
    let html =  '' +
      '<!DOCTYPE html>' +
      '<html>' +
      '<head><title>Test</title></head>' +
      '<body>Body</body>' +
      '</html>';

    it('should throw on non-strings', function() {
      expect(() => page.renderHtml(true)).to.throw(TypeError);
    });

    it('should be rejected on non existing directories', function() {
      return page.renderHtml('someString', 'this-is-not-directory').should.be.rejectedWith(Error);
    });

    it('should be rejected on non-directories', function() {
      return page.renderHtml('someString', './index.js').should.be.rejectedWith(Error);
    });

    it('should render a pdf', function(done) {
      return page.renderHtml(html).should.eventually.be.instanceOf(Buffer).notify(done);
    });
  });

  describe('Page.addLocalResource, Page.getLocalResource', function() {
    it('should throw error on invalid input', function() {
      expect(() => page.addLocalResource()).to.throw(TypeError);
      expect(() => page.addLocalResource({name: ''})).to.throw(TypeError);
      expect(() => page.addLocalResource({name: {}})).to.throw(TypeError);
      expect(() => page.addLocalResource({name: 'something', filename: ''})).to.throw(TypeError);
      expect(() => page.addLocalResource({name: 'name', filename: 'file', content: {}})).to.throw(TypeError);
    });

    it('should throw error on invalid input to getLocalResource', function() {
      expect(() => page.getLocalResource()).to.throw(TypeError);
      expect(() => page.getLocalResource(5)).to.throw(TypeError);
    });

    it('should add local resource and be retrievable through getLocalResource', function() {
      let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
      page.addLocalResource(options);
      let result = page.getLocalResource(options.name);

      expect(result).to.deep.equal(options);
    });

    it('should fail to retrieve names that are not equal', function() {
      let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
      page.addLocalResource(options);
      let result1 = page.getLocalResource(options.name);
      let result2 = page.getLocalResource('myfile');

      expect(result1).to.deep.equal(options);
      expect(result2).to.equal(null);
    });
  });

  describe('Page.removeLocalResource', function() {
    it('should throw error on invalid input', function() {
      expect(() => page.removeLocalResource()).to.throw(TypeError);
      expect(() => page.removeLocalResource(5)).to.throw(TypeError);
    });

    it('should remove a local resource', function() {
      let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
      page.addLocalResource(options);

      let result1 = page.removeLocalResource(options.name);
      let result2 = page.removeLocalResource(options.name);
      let result3 = page.getLocalResource(options.name);

      expect(result1).to.equal(true);
      expect(result2).to.equal(false);
      expect(result3).to.equal(null);
    });
  });

  describe('Page.clearLocalResources', function() {
    it('should clear all local resources', function() {
      let options1 = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
      let options2 = {name: 'myOtherFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
      page.addLocalResource(options1);
      page.addLocalResource(options2);

      let result1 = page.clearLocalResources();
      let result2 = page.getLocalResource(options1.name);
      let result3 = page.getLocalResource(options2.name);
      let result4 = page.clearLocalResources();

      expect(result1).to.equal(true);
      expect(result2).to.equal(null);
      expect(result3).to.equal(null);
      expect(result4).to.equal(false);
    });
  });

  describe('Page.openHtml without local resources', function() {
    let html = '' +
      '<!DOCTYPE html>' +
      '<html>' +
      '<head><title>Test</title></head>' +
      '<body>Page.openHtml</body>' +
      '</html>';

    let retBody = function() {
      return document.body.textContent;
    };

    it('should throw on non-strings', function() {
      expect(() => page.openHtml()).to.throw(TypeError);
    });

    it('should be rejected on non-directories, if specified', function() {
      return page.openHtml(html, 'this-is-not-directory').should.be.rejectedWith(Error);
    });

    it('should open HTML', function(done) {
      let openHtmlPromise = page.openHtml(html).should.eventually.equal('success');
      let pageEvalPromise = openHtmlPromise.then(() => page.evaluate(retBody));
      pageEvalPromise.should.eventually.equal('Page.openHtml').notify(done);
    });
  });

  describe('Page.openHtml with local resources', function() {
    let css = 'body { height: 400px; background-color: blue; }';
    let html = '' +
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
        '<title>Test</title>' +
        '<link rel="stylesheet" href="css/something.css">' +
        '<link rel="stylesheet" href="css/should_not_exist.css">' +
        '</head>' +
      '<body>Page.openHtml</body>' +
      '</html>';

    let retBody = function() {
      return {
        text: document.body.textContent,
        css: document.styleSheets[0].rules[0].cssText
      };
    };

    let retContent = {text: 'Page.openHtml', css: css};

    it('should open HTML and request resources', function(done) {
      page.onResourceError(function(err) {
        expect(err.errorCode).to.equal(203);
        expect(err.url.indexOf('css/should_not_exist.css')).to.not.equal(-1);
      });

      /* jshint ignore:start */
      page.onResourceRequested(function(request, empty) {
        let isOkay = request.url.indexOf('.css') !== -1 ||
                     request.url.indexOf('.html') !== -1;
        expect(isOkay).to.equal(true);
      });
      /* jshint ignore:end */

      page.addLocalResource({
        name    : 'something.css',
        filename: 'css/something.css',
        content : new Buffer(css)
      });

      let openHtmlPromise = page.openHtml(html).should.eventually.equal('success');
      let pageEvalPromise = openHtmlPromise.then(() => page.evaluate(retBody));
      pageEvalPromise.should.eventually.deep.equal(retContent).notify(done);
    });
  });

  describe('Page.openTemplate', function() {
    let sentOptions = {this: 'should', be: 'sent', to: 'render'};
    let templateObject = {
      render: (options) => {
        expect(options).to.deep.equal(sentOptions);
        return '' +
          '<!DOCTYPE html>' +
          '<html>' +
          '<head><title>Test</title></head>' +
          '<body>page.openTemplate</body>' +
          '</html>';
      }
    };

    let retBody = function() {
      return document.body.textContent;
    };

    it('should throw error on invalid template object', function() {
      expect(() => page.openTemplate({})).to.throw(TypeError);
    });

    it('should throw on .render function not returning string', function() {
      expect(() => page.openTemplate({render: () => true})).to.throw(TypeError);
    });

    it('should open templates in render directories', function(done) {
      let openPromise = page.openTemplate(templateObject, './test/resources', sentOptions);
      openPromise.should.eventually.equal('success').then(() => {
        return page.evaluate(retBody);
      }).should.eventually.equal('page.openTemplate').notify(done);
    });

    it('should open templates in temporary directories', function(done) {
      let openPromise = page.openTemplate(templateObject, sentOptions);
      openPromise.should.eventually.equal('success').then(() => {
        return page.evaluate(retBody);
      }).should.eventually.equal('page.openTemplate').notify(done);
    });
  });

  describe('Page.waitForSelector', function() {
    it('should throw error on invalid selector', function() {
      expect(() => page.waitForSelector(5)).to.throw(TypeError);
    });

    it('should wait roughly 170ms before returning', function(done) {
      this.timeout(3000);
      let date = Date.now();
      page.open(testPage).then(() => {
        page.waitForSelector('.test-class', 2500).then(() => {
          let timeout = Date.now() - date;
          expect(timeout).to.be.closeTo(100, 150);
          done();
        });
      });
    });
  });

  describe('Page.reload', function() {
    it('should reload page', function(done) {
      let isDone = expectDoneCalls(4, done);
      let navigationType = 'Other';

      page.onNavigationRequested(function(url, type, willNavigate, main) {
        expect(url).to.be.a('string');
        expect(type).to.equal(navigationType);
        expect(willNavigate).to.equal(true);
        expect(main).to.equal(true);
        isDone();
      });

      page.open('http://www.google.com').then(() => {
        navigationType = 'Reload';
        return page.reload();
      }).should.eventually.equal(undefined).notify(isDone);
    });
  });

  describe('page.onCallback', function() {
    let html = '' +
        '<html>' +
        '<head><title>Title</title></head>' +
        '<body>' +
          '<script>window.callPhantom({hello: "world"})</script>' +
        '</body></html>';

    it('should callback from client', function(done) {
      let isDone = expectDoneCalls(2, done);
      page.onCallback(function(object) {
        expect(object).to.deep.equal({hello: 'world'});
        expect(object).to.not.deep.equal({hello: 'no-world'});
        isDone();
      });

      page.openHtml(html).should.eventually.equal('success').notify(isDone);
    });
  });

  describe('Page.onConfirm', function() {
    let html = '' +
        '<html>' +
        '<head><title>Title</title></head>' +
        '<body>' +
        '<script>confirm("Press a button");</script>' +
        '</body></html>';

    it('should be called whenenever a confirm is on the page', function(done) {
      let isDone = expectDoneCalls(2, done);
      page.onConfirm(function(message) {
        expect(message).to.equal("Press a button");
        isDone();
      });

      page.openHtml(html).should.eventually.equal('success').notify(isDone);
    });
  });

  describe('Page.onNavigationRequested', function() {
    let html = '' +
        '<html>' +
        '<head><title>Title</title></head>' +
        '<body>' +
        '<script></script>' +
        '</body></html>';

    it('should send navigation requests', function(done) {
      let isDone = expectDoneCalls(2, done);

      page.onNavigationRequested(function(url, type, willNavigate, main) {
        expect(url).to.be.a('string');
        expect(type).to.equal('Other');
        expect(willNavigate).to.equal(true);
        expect(main).to.equal(true);
        isDone();
      });

      page.openHtml(html).should.eventually.equal('success').notify(isDone);
    });
  });

  describe('Page.onPageCreated', function() {
    it('should throw errors on invalid input', function() {
      expect(() => page.onPageCreated()).to.throw(TypeError);
    });

    it('should call onPageCreated with a new page', function(done) {
      let html = '' +
          '<html>' +
            '<head><title>Test</title></head>' +
            '<body>' +
              '<script>window.open("");</script>' +
            '</body>' +
          '</html>';

      let isDone = expectDoneCalls(2, done);

      page.onPageCreated(function(innerPage) {
        expect(innerPage).to.be.instanceof(Page);
        innerPage.evaluate(function() {
          return document.location.href;
        }).then((url) => {
          return url.indexOf('about:blank');
        }).should.eventually.not.equal(-1).notify(isDone);
      });

      page.openHtml(html).should.eventually.equal('success').notify(isDone);

    });
  });

  describe('Page.onInitialized', function() {
    it('should be called when creating new child pages', function(done) {
      let html = '' +
          '<html>' +
          '<head><title>Test</title></head>' +
          '<body>' +
          '<script>window.open("");</script>' +
          '</body>' +
          '</html>';

      let isDone = expectDoneCalls(2, done);
      page.onInitialized(function() {
        isDone();
      });

      page.openHtml(html).should.eventually.equal('success').notify(isDone);

    });

  });

  describe('Page.setFn', function() {
    it('should throw error on invalid parameters', function() {
      expect(() => page.setFn({}, function() {})).to.throw(TypeError);
      expect(() => page.setFn('onPrompt', {})).to.throw(TypeError);
    });

    /* jshint unused:false */
    // both arguments have to be defined, otherwise
    // an array is sent as the argument
    let onPromptFn = function(message, defaultVal) {
      return message + ' was changed';
    };
    /* jshint unused:true */

    let doPrompt = function() {
      return prompt('Message');
    };

    it('onPrompt should run', function(done) {
      let isDone = expectDoneCalls(2, done);

      /* jshint unused:false */
      // both arguments have to be defined, otherwise
      // an array is sent as the argument
      page.onPrompt(function(message, defaultVal) {
        expect(message).to.equal('Message');
        isDone();
      });
      /* jshint unused:true */

      page.open(testPage).then(() => page.evaluate(doPrompt))
        .should.eventually.equal('').notify(isDone);
    });

    it('should correctly handle handlers', function() {
      page.setFn('onPrompt', onPromptFn).then(() => {
        return page.open(testPage);
      }).then(() => {
        return page.evaluate(doPrompt);
      }).should.eventually.equal('Message was changed');
    });
  });

  describe('Page.close', function() {
    it('should close the page, any functions called after should throw', function(done) {
      let isDone = expectDoneCalls(2, done);
      page.onClosing(() => isDone());

      page.close().then(() => {
        expect(page.isClosed()).to.equal(true);
        expect(() => page.get('viewportSize')).to.throw(Error);
        isDone();
      });
    });
  });
});
