/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.renderBase64', function() {
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

  it('should throw errors on invalid formats', function() {
    expect(() => page.renderBase64('not-accepted')).to.throw(TypeError);
  });

  it('should render images to a base64 string', function() {
    return page.open(testPage).should.eventually.equal('success').then(() => {
      return Promise.all([
        page.renderBase64().should.eventually.not.equal(''),
        page.renderBase64('jpeg').should.eventually.not.equal(''),
        page.renderBase64('gif').should.eventually.not.equal('')
      ]);
    });
  });
});
