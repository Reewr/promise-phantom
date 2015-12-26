/* globals describe, it, before, after, beforeEach, afterEach*/
'use strict';
const chai   = require('chai');
const driver = require('../index');
const utils  = require('../lib/utils');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

describe('Page', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';
  let resourcePage = './test/resources/test-resource.html';
  let cookieOptions = {
    name    : 'phantom-cookie',
    value   : 'phantom-value',
    path    : '/',
    domain  : '.google.com',
    httponly: false,
    secure  : false
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

  describe('Page.open, Page.onLoadStarted, Page.onLoadFinished', function() {
    it('should open page, call onLoadStarted, then onLoadFinished', function(done) {
      let calls  = 0;
      let isDone = function(message) {
        calls++;
        assert(true, message);
        if (calls >= 3) {
          return done();
        }
      };

      page.onLoadStarted(() => isDone('onLoadStarted was called'));
      page.onLoadFinished(() => isDone('onLoadFinished was called'));
      page.open(testPage).then((status) => {
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
      return page.addCookie(cookieOptions).should.eventually.equal(true).then(() => {
        return page.get('cookies').should.eventually.deep.equal([cookieOptions]).notify(done);
      });
    });
  });

  describe('Page.getCookie', function() {
    it('should throw on no name or not a string', function() {
      expect(() => page.deleteCookie()).to.throw(TypeError);
    });

    it('should get cookie by name if exists', function(done) {
      return page.addCookie(cookieOptions).should.eventually.equal(true).then(() => {
        return page.getCookie(cookieOptions.name).should.eventually.deep.equal(cookieOptions).notify(done);
      });
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
      return page.addCookie(cookieOptions).should.eventually.equal(true).then(() => {
        return page.deleteCookie(cookieOptions.name).should.eventually.equal(true).then(() => {
          return page.getCookie(cookieOptions.name).should.eventually.equal(undefined).notify(done);
        });
      });
    });
  });

  describe('Page.clearCookies', function(done) {
    it('should clear all cookies added and return true', function() {
      return page.addCookie(cookieOptions).should.eventually.equal(true).then(() => {
        return page.clearCookies().should.eventually.equal(true).then(() => {
          return page.getCookie(cookieOptions.name).should.eventually.equal(undefined).notify(done);
        });
      });
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
        console.log(message);
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
            return testFunction();
          }).should.eventually.equal(5).notify(done);
        });
      });
    });
  });

  describe('Page.onResourceRequested', function() {
    it('should throw errors on non-functions', function() {
      expect(() => page.onResourceRequested(5)).to.throw(TypeError);
    });

    it('should call when requesting data', function(done) {
      // network data has to be defined, otherwise requestData is an array
      page.onResourceRequested(function(requestData, networkData) {
        expect(requestData.url.indexOf('html')).to.not.equal(-1);
        done();
      });

      return page.open(testPage).should.eventually.equal('success');
    });
  });

  describe('Page.onResourceReceived', function() {
    it('should throw errors on non-functions', function() {
      expect(() => page.onResourceReceived(5)).to.throw(TypeError);
    });

    let amountOfCalls = 0; // should be 2
    it('should call when getting data', function(done) {
      page.onResourceReceived(function(response) {
        expect(response.url.indexOf('html')).to.not.equal(-1);
        amountOfCalls++;
        if (amountOfCalls >= 2) {
          return done();
        }
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

  describe('Page.renderTemplate', function() {
    it('should throw on non-objects without .render function', function() {
      expect(() => page.renderTemplate({})).to.throw(TypeError);
    });

    it('should throw on .render functions that does not return strings', function() {
      expect(() => page.renderTemplate({render: () => true})).to.throw(TypeError);
    });

    it('should render templates to string', function() {
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
        .not
        .equal('');
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

    it('should render a pdf', function() {
      return page.renderHtml(html).should.eventually.not.equal('');
    });
  });

  describe('Page.openHtml', function() {
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

    it('should open templates', function(done) {
      let openPromise = page.openTemplate(templateObject, './test/resources', sentOptions);
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

  describe('Page.close', function() {
    it('should close the page, any functions called after should throw', function() {
      return page.close().should.eventually.equal(undefined).then(() => {
        expect(() => page.get('viewportSize')).to.throw(Error);
      });
    });
  });
});
