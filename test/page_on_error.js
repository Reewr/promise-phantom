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
    expect(() => page.onError(5)).to.throw(TypeError);
  });

  it('should be called with console error from client', function(done) {
    let traceKeys = ['file', 'line', 'function'];

    page.onError(function(message, trace) {
      expect(message).to.equal('Error: Testing!');
      trace.forEach((object) => {
        expect(Object.keys(object)).to.deep.equal(traceKeys);
      });
      done();
    });

    page.evaluate(function() {
      throw new Error('Testing!');
    });
  });
});
