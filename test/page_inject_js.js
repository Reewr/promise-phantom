/* globals testFunction, describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.injectJs', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';
  let injectFile = './test/resources/js.js';
  let testFn = function testFunction() {
    console.log('I was called');
    return 5;
  };

  before(function startPhantom(done) {
    driver.create().then((ph) => {
      phantom = ph;

      phantom.createPage().then(p => {
        page = p;
        return utils.saveFile(injectFile, testFn.toString());
      })
      .then(() => done())
      .catch(done);
    }).catch(done);
  });

  after(function stopPhantom(done) {
    page.close()
      .then(() => phantom.exit())
      .then(() => utils.wait(500))
      .then(() => utils.deleteFile(injectFile))
      .then(() => done())
      .catch(done);
  });

  it('should throw on non-strings', function() {
    expect(() => page.injectJs(5)).to.throw(TypeError);
  });

  it('should inject and run Javascript', function(done) {
    page.onConsoleMessage(function(message) {
      expect(message).to.equal('I was called');
    });
    let fn = function() {
      return testFunction();
    };

    page.open(testPage)
      .then(() => page.injectJs(injectFile))
        .should.eventually.equal(true)
      .then(() => page.evaluate(fn))
        .should.eventually.equal(5)
      .notify(done);
  });
});
