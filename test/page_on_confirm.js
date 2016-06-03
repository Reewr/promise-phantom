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

describe('Page.onConfirm', function() {
  let phantom;
  let page;
  let html = '' +
      '<html>' +
      '<head><title>Title</title></head>' +
      '<body>' +
      '<script>confirm("Press a button");</script>' +
      '</body></html>';

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

  it('should be called whenenever a confirm is on the page', function(done) {
    let isDone = expectDoneCalls(2, done);
    page.onConfirm(function(message) {
      expect(message).to.equal("Press a button");
      isDone();
    });

    page.openHtml(html)
      .should.eventually.equal('success')
      .notify(isDone);
  });
});
