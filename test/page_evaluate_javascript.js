/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.evaluateJavaScript', function() {
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

  it('should throw on non-strings', function() {
    expect(() => page.evaluateJavaScript({})).to.throw(TypeError);
    expect(() => page.evaluateJavaScript(5)).to.throw(TypeError);
    expect(() => page.evaluateJavaScript(null)).to.throw(TypeError);
  });

  let fn = function() {
    return 5 + 5;
  }.toString();

  it('should execute string functions and return correct result', function() {
    return page.evaluateJavaScript(fn.toString()).should.eventually.equal(10);
  });

  it('should execute string functions and return correct result', function() {
    return page.evaluateJavaScript(fn.toString()).should.eventually.not.equal(11);
  });
});
