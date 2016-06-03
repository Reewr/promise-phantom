/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

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

describe('Page.onInitialized', function() {
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

  it('should be called when creating new child pages', function(done) {
    let html = '' +
        '<html>' +
        '<head><title>Test</title></head>' +
        '<body>' +
        '<script>window.open("");</script>' +
        '</body>' +
        '</html>';

    let isDone = expectDoneCalls(2, done);

    page.onInitialized(function() {
      isDone();
    });

    page.openHtml(html)
      .should.eventually.equal('success')
      .notify(isDone);
  });

});
