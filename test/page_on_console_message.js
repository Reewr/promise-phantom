/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.onConsoleMessage', function() {
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

  it('should throw error on non-functions', function() {
    expect(() => page.onConsoleMessage(5)).to.throw(TypeError);
  });

  it('should give be called with console messages from client', function(done) {
    page.onConsoleMessage(function(message) {
      expect(message).to.equal('Script loaded');
      done();
    });
    page.open(resourcePage);
  });
});
