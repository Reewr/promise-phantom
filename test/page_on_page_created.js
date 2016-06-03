/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');
const Page = require('../lib/webpage');

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

describe('Page.onPageCreated', function() {
  let phantom;
  let page;

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

    page.openHtml(html)
      .should.eventually.equal('success')
      .notify(isDone);
  });
});
