/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
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

describe('Page.onNavigationRequested', function() {
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

    page.openHtml(html)
      .should.eventually.equal('success')
      .notify(isDone);
  });
});
