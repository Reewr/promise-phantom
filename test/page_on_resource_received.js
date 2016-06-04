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

describe('Page.onResourceReceieved', function() {
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
    expect(() => page.onResourceReceived(5)).to.throw(TypeError);
  });

  it('should call when receiving data', function(done) {
    let isDone = expectDoneCalls(4, done);

    /* jshint ignore:start */
    // network data has to be defined, otherwise requestData is an array
    page.onResourceRequested(function(requestData, networkData) {
      expect(requestData.url.indexOf('html')).to.not.equal(-1);
      isDone();
    });
    /* jshint ignore:end */

    // This handler is called twice for every resource,
    // once when it starts and once when it ends
    page.onResourceReceived(function(response) {
      expect(response.stage).to.be.oneOf(['start', 'end']);
      expect(response.url.indexOf('html')).to.not.equal(-1);
      isDone();
    });

    page.open(testPage)
      .should.eventually.equal('success')
      .then(() => isDone());
  });
});
