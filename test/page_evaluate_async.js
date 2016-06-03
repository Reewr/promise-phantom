/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.evaluateAsync', function() {
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

  it('should throw on non-functions', function() {
    expect(() => page.evaluateAsync(5)).to.throw(TypeError);
  });

  it('should execute the function, but return undefined', function(done) {
    this.timeout(5000);
    let sendMessage = 'this is a message';

    page.onConsoleMessage(function(message) {
      expect(message).to.equal(sendMessage);
      done();
    });

    page.open('http://www.google.com').then(() => {
      page.evaluateAsync(function(args) {
        console.log('this is a message', args);
      }, 1000, ['test']).should.eventually.equal(undefined).notify(done);
    });
  });
});
