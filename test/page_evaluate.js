/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.evaluate', function() {
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

  it('should throw error on non-functions as first argument', function() {
    expect(() => page.evaluate(5, function() {})).to.throw(TypeError);
  });

  it('should evaluate a function and call it', function(done) {
    let sendMessage = 'Hello World!';
    let fn = function(msg) {
      console.log(msg);
      return 5;
    };

    page.onConsoleMessage(function(message) {
      expect(message).to.equal(sendMessage);
      done();
    });

    page.open(testPage)
      .should.eventually.equal('success')
      .then(() => page.evaluate(fn, sendMessage))
      .should.eventually.equal(5);
  });

  it('should pass arguments to evaluated fn and return values', function() {
    let object = {hello: 'world'};
    let eq = function(o) {return o;};
    return page.evaluate(eq, object).should.eventually.deep.equal(object);
  });
});
