/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const utils   = require('../lib/utils');
const Phantom = require('../lib/phantom');
const Page    = require('../lib/webpage');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;
let phantom;

describe('Phantom', function() {

  describe('driver.create', function() {
    it('should throw errors on invalid PhantomJS path', function() {
      let p = driver.create({path: './'});
      return p.should.be.rejectedWith(Error);
    });

    it('should create an instance of Phantom', function(done) {
      // starting up phantom may take some time on the first run
      this.timeout(5000);
      return driver.create().then((ph) => {
        phantom = ph;
        return ph;
      }).should.eventually.be.instanceOf(Phantom).should.notify(done);
    });
  });

  let libraryPath = './test';
  let cookie1 = {
    domain  : '.phantomjs.com',
    value   : 'phantom-cookie-value',
    name    : 'phantom-cookie',
    httponly: false,
    path    : '/',
    secure  : false
  };

  let cookie2 = {
    domain  : '.google.com',
    value   : 'google-cookie-value',
    name    : 'google-cookie',
    httponly: false,
    path    : '/',
    secure  : false
  };

  describe('phantom.setProxy', function() {

    it('should throw on invalid ip', function() {
      expect(() => phantom.setProxy(5, 80, 'http', 'un', 'pw')).to.throw(TypeError);
    });

    it('should throw on invalid port', function() {
      expect(() => phantom.setProxy('192', true, 'http', 'un', 'pw')).to.throw(TypeError);
    });

    it('should throw on invalid type', function() {
      expect(() => phantom.setProxy('192', 80, 5, 'un', 'pw')).to.throw(TypeError);
    });

    it('should throw on invalid username', function() {
      expect(() => phantom.setProxy('192', 80, 'http', 5, 'pw')).to.throw(TypeError);
    });

    it('should throw on invalid password', function() {
      expect(() => phantom.setProxy('192', 80, 'http', 'un', 5)).to.throw(TypeError);
    });

    it('should apply settings', function() {
      return phantom.setProxy('127.0.0.1', 8080, 'http', 'username', 'password')
        .should
        .eventually
        .equal(undefined);
    });
  });

  describe('phantom.set', function() {
    it('should throw error on invalid keys', function() {
      expect(() => phantom.set('does-not-exist')).to.throw(TypeError);
    });

    it('should throw error on read-only keys', function() {
      expect(() => phantom.set('version')).to.throw(TypeError);
    });

    it('should be able to set values', function() {
      return phantom.set('libraryPath', libraryPath).should.eventually.equal(true);
    });
  });

  describe('phantom.get', function() {
    it('should throw error on invalid keys', function() {
      expect(() => phantom.get('does-not-exist')).to.throw(TypeError);
    });

    it('should be able to get values, such as previously set value', function() {
      return phantom.get('libraryPath').should.eventually.equal(libraryPath);
    });
  });

  describe('phantom.addCookie', function() {
    it('should add a cookie and return true', function() {
      return phantom.addCookie(cookie1).should.eventually.equal(true);
    });

    it('should add another cookie and return true', function() {
      return phantom.addCookie(cookie2).should.eventually.equal(true);
    });
  });

  describe('phantom.getCookie', function() {
    it('should throw on non-strings', function() {
      expect(() => phantom.getCookie(5).to.throw(TypeError));
    });

    it('should throw on spaces', function() {
      expect(() => phantom.getCookie('my cookie')).to.throw(TypeError);
    });

    it('should be able to retrieve added cookies', function() {
      return phantom.getCookie(cookie1.name).should.eventually.deep.equal(cookie1).then(() => {
        return phantom.getCookie(cookie2.name).should.eventually.deep.equal(cookie2);
      });
    });
  });

  describe('phantom.deleteCookie', function() {
    it('should be able to delete added cookie and return true', function() {
      return phantom.deleteCookie(cookie1.name).should.eventually.equal(true).then(() => {
        return phantom.getCookie(cookie1.name).should.eventually.be.undefined;
      });
    });
  });

  describe('phantom.clearCookie', function() {
    it ('should clear all cookies that has been added and return true', function() {
      return phantom.clearCookies().should.eventually.be.undefined.then(() => {
        return phantom.getCookie(cookie2.name).should.eventually.be.undefined;
      });
    });
  });

  describe('phantom.injectJs', function() {
    let filePath = './test/injectJs.js';

    before(function saveTestFn(done) {
      let testFn = function testFn() {console.log('I was called');};
      utils.saveFile(filePath, testFn.toString()).then(() => {
        done();
      }).catch((err) => done(err));
    });

    it('should throw on non-strings', function() {
      expect(() => phantom.injectJs({not: 'string'})).to.throw(TypeError);
    });

    it('should inject a JavaScript file and return true', function() {
      return phantom.injectJs(filePath).should.eventually.equal(true);
    });

    after(function deleteTestFn(done) {
      utils.deleteFile(filePath)
        .then(() => done())
        .catch((err) => done(err));
    });
  });

  describe('phantom.createPage', function() {
    it('should create a webpage object', function() {
      return phantom.createPage().should.eventually.be.instanceOf(Page);
    });
  });

  describe('phantom.exit', function() {
    it('should close and return undefined', function() {
      return phantom.exit().should.eventually.equal(undefined);
    });

    it('should cause all other functions to throw errors', function() {
      expect(() => phantom.get('libraryPath')).to.throw(Error);
    });
  });

  after(function stopPhantom(done) {
    return phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
