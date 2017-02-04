/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('phantom.addCookie', function() {
  let phantom;

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      done();
    });
  });

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

  it('should add a cookie and return true', function() {
    return phantom.addCookie(cookie1).should.eventually.equal(true);
  });

  it('should add another cookie and return true', function() {
    return phantom.addCookie(cookie2).should.eventually.equal(true);
  });

  it('should throw error on non-objects', function() {
    expect(() => phantom.addCookie()).to.throw();
  });

  it('should throw error on invalid names', function() {
    expect(() => phantom.addCookie({name: 5})).to.throw();
    expect(() => phantom.addCookie({name: 'invalid name'})).to.throw();
  });

  it('should throw error on non-objects', function() {
    expect(() => phantom.addCookie({name: 'valid', value: {}})).to.throw();
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
