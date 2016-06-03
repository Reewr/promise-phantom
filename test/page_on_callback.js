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

describe('Page.onCallback', function() {
  let phantom;
  let page;
  let html = '' +
      '<html>' +
      '<head><title>Title</title></head>' +
      '<body>' +
        '<script>window.callPhantom({hello: "world"})</script>' +
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


  it('should callback from client', function(done) {
    let isDone = expectDoneCalls(2, done);
    page.onCallback(function(object) {
      expect(object).to.deep.equal({hello: 'world'});
      expect(object).to.not.deep.equal({hello: 'no-world'});
      isDone();
    });

    page.openHtml(html)
      .should.eventually.equal('success')
      .notify(isDone);
  });
});
