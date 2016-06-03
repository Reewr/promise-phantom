/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.getCookie', function() {
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

  it('should throw on no name or not a string', function() {
    expect(() => page.getCookie()).to.throw(TypeError);
  });

  it('should get cookie by name if exists', function(done) {
    page.open(testPage)
        .should.eventually.equal('success')
      .then(() => page.addCookie(cookieOptions))
        .should.eventually.equal(true)
      .then(() => page.getCookie(cookieOptions.name))
      .then((cookie) => cookie ? cookie.name : '')
        .should.eventually.equal(cookieOptions.name).notify(done);
  });

  it('should return undefined on cookies that does not exist', function() {
    return page.getCookie('does-not-exist').should.eventually.equal(undefined);
  });
});
