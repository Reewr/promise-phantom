/* globals describe, it, before */
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

describe('Page.close', function() {
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

  it('should close the page, any functions called after should throw', function(done) {
    let isDone = expectDoneCalls(2, done);
    page.onClosing(() => isDone());

    page.close().then(() => {
      expect(page.isClosed()).to.equal(true);
      expect(() => page.get('viewportSize')).to.throw(Error);
      isDone();
    });
  });
});
