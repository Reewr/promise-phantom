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

describe('Page.reload', function() {
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

  it('should reload page', function(done) {
    let isDone = expectDoneCalls(2, done);
    let navigationType = 'Other';

    page.onNavigationRequested(function(url, type, willNavigate, main) {
      expect(url).to.be.a('string');
      expect(type).to.equal(navigationType);
      expect(willNavigate).to.equal(true);
      expect(main).to.equal(true);

      if (type === 'Reload') {
        isDone();
      }
    });

    page.open('http://www.google.com').then((status) => {
      expect(status).to.equal('success');
      navigationType = 'Reload';
      return page.reload();
    }).should.eventually.equal(undefined).notify(isDone);
  });
});
