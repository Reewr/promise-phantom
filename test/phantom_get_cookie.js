/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('phantom.getCookie', function() {
  let phantom;
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


  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      // Add cookies that are needed for this test
      phantom.addCookie(cookie1).then(() => {
        return phantom.addCookie(cookie2);
      }).then(() => done());
    });
  });

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

  it('should return undefined on non-existing cookies', function() {
    return phantom.getCookie('not-exist').should.eventually.equal(undefined);
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
