/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('phantom.deleteCookie', function() {
  let phantom;
  let cookie1 = {
    domain  : '.phantomjs.com',
    value   : 'phantom-cookie-value',
    name    : 'phantom-cookie',
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
      phantom.addCookie(cookie1).then(() => done());
    });
  });

  it('should be able to delete added cookie and return true', function() {
    return phantom.deleteCookie(cookie1.name).should.eventually.equal(true).then(() => {
      return phantom.getCookie(cookie1.name).should.eventually.be.undefined;
    });
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
