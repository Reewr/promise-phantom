/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('Page.clearCookies', function() {
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

  it('should clear all cookies added and return true', function(done) {
    page.open(testPage)
        .should.eventually.equal('success')
      .then(() => page.addCookie(cookieOptions))
        .should.eventually.equal(true)
      .then(() => page.getCookie(cookieOptions.name))
      .then(cookie => cookie.name)
        .should.eventually.equal(cookieOptions.name)
      .then(() => page.clearCookies())
        .should.eventually.equal(true).notify(done);
  });
});
