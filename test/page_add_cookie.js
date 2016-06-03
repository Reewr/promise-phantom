/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.addCookie', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';
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

      phantom.createPage().then(p => {
        page = p;
        done();
      }).catch(done);
    }).catch(done);
  });

  after(function stopPhantom(done) {
    page.close()
      .then(() => phantom.exit())
      .then(() => done())
      .catch(done);
  });

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
    page.open(testPage).should.eventually.equal('success')
      .then(() => page.addCookie(cookieOptions)).should.eventually.equal(true)
      .then(() => page.getCookie(cookieOptions.name))
      .then((cookie) => cookie.name === cookieOptions.name)
        .should.eventually.equal(true).notify(done);
  });
});
