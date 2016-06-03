/* globals describe, it, beforeEach, afterEach */
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

describe('Page.open', function() {
  let testPage = './test/resources/test.html';
  let phantom;
  let page;

  beforeEach(function startPhantom(done) {
    driver.create().then((ph) => {
      phantom = ph;

      phantom.createPage().then(p => {
        page = p;
        done();
      }).catch(done);
    }).catch(done);
  });

  afterEach(function stopPhantom(done) {
    page.close()
      .then(() => phantom.exit())
      .then(() => done())
      .catch(done);
  });

  it('should throw on invalid options', function() {
    expect(() => page.open(5)).to.throw(TypeError);
    expect(() => page.open({})).to.throw(TypeError);
  });

  it('should open page, call onLoadStarted, then onLoadFinished', function(done) {
    let isDone = expectDoneCalls(3, done);

    page.onLoadStarted(() => {
      isDone();
    });
    page.onLoadFinished((status) => {
      expect(status).to.be.equal('success');
      isDone();
    });
    page.open(testPage, {operation: 'GET'}).then((status) => {
      expect(status).to.be.equal('success');
      isDone();
    }).catch(isDone);
  });

  it('should open both files and webpages', function(done) {
    this.timeout(5000);
    page.open(testPage)
        .should.eventually.equal('success')
      .then(() => page.open('http://www.google.com'))
        .should.eventually.equal('success')
      .then(() => page.clearCookies())
        .should.notify(done);
  });
});

