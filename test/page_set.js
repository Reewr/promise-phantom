/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.set', function() {
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

  it('should throw on keys that doesn\'t exist', function() {
    expect(() => page.set('this-does-not-exist')).to.throw(TypeError);
  });

  it('should throw on keys that are read only', function() {
    expect(() => page.set('framePlainText')).to.throw(TypeError);
  });

  it('should set valid values', function(done) {
    let height = 400;
    page.set('viewportSize.height', height)
        .should.eventually.equal(true)
      .then(() => page.get('viewportSize.height'))
        .should.eventually.equal(height)
      .notify(done);
  });
});
