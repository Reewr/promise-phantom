/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.onResourceError', function() {
  let phantom;
  let page;
  let resourcePage = './test/resources/test-resource.html';

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
    expect(() => page.onResourceError(5)).to.throw(TypeError);
  });

  it('should call when it causes an error', function(done) {
    page.onResourceError(function(err) {
      expect(err).to.not.be.equal(undefined);
      expect(err.url.indexOf('does-not-exist.js')).to.not.equal(-1);
      done();
    });

    page.open(resourcePage)
      .should.eventually.equal('success');
  });
});
