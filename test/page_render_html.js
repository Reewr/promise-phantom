/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.renderHtml', function() {
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

  let html =  '' +
    '<!DOCTYPE html>' +
    '<html>' +
    '<head><title>Test</title></head>' +
    '<body>Body</body>' +
    '</html>';

  it('should throw on non-strings', function() {
    expect(() => page.renderHtml(true)).to.throw(TypeError);
  });

  it('should be rejected on non existing directories', function() {
    return page.renderHtml('someString', 'this-is-not-directory').should.be.rejectedWith(Error);
  });

  it('should be rejected on non-directories', function() {
    return page.renderHtml('someString', './index.js').should.be.rejectedWith(Error);
  });

  it('should render a pdf', function(done) {
    page.renderHtml(html).should.eventually.be.instanceOf(Buffer).notify(done);
  });
});
