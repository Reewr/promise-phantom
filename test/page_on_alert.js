/* globals alert, describe, it, before, after */
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

describe('Page.onAlert', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';

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

  let msg = 'I am alert';

  let fn = function() {
    alert('I am alert');
    return true;
  };

  it('should be called whenever alerts are raised', function(done) {
    let isDone = expectDoneCalls(2, done);

    page.onAlert(function(message) {
      expect(message).to.equal(msg);
      isDone();
    });

    page.open(testPage)
      .then(() => page.evaluate(fn))
      .should.eventually.equal(true)
      .notify(isDone);
  });
});
