/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.get', function() {
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
    expect(() => page.get('this-does-not-exist')).to.throw(TypeError);
  });

  it('should retrieve values', function(done) {
    let viewportSize = {height: 500, width: 600};
    page.set('viewportSize', viewportSize)
        .should.eventually.equal(true)
      .then(() => page.get('viewportSize'))
        .should.eventually.deep.equal(viewportSize)
      .notify(done);
  });
});
