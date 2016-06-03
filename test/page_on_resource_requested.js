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

describe('Page.onResourceRequested', function() {
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

  it('should throw errors on non-functions', function() {
    expect(() => page.onResourceRequested(5)).to.throw(TypeError);
  });

  it('should call when requesting data', function(done) {
    let isDone = expectDoneCalls(2, done);

    /* jshint ignore:start */
    // network data has to be defined, otherwise requestData is an array
    page.onResourceRequested(function(requestData, networkData) {
      expect(requestData.url.indexOf('html')).to.not.equal(-1);
      isDone();
    });
    /* jshint ignore:end */

    page.open(testPage)
      .should.eventually.equal('success')
      .then(() => isDone());
  });
});
