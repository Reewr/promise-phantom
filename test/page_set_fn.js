/* globals prompt, describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;
const expectDoneCalls = function(num, done) {
  return function(err) {
    if (err) {
      return done(err);
    }
    num--;

    if (num <= 0) {
      return done();
    }
  };
};

describe('Page.setFn', function() {
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

  it('should throw error on invalid parameters', function() {
    expect(() => page.setFn({}, function() {})).to.throw(TypeError);
    expect(() => page.setFn('onPrompt', {})).to.throw(TypeError);
  });

  /* jshint unused:false */
  // both arguments have to be defined, otherwise
  // an array is sent as the argument
  let onPromptFn = function(message, defaultVal) {
    return message + ' was changed';
  };
  /* jshint unused:true */

  let doPrompt = function() {
    return prompt('Message');
  };

  it('onPrompt should run', function(done) {
    let isDone = expectDoneCalls(2, done);

    /* jshint unused:false */
    // both arguments have to be defined, otherwise
    // an array is sent as the argument
    page.onPrompt(function(message, defaultVal) {
      expect(message).to.equal('Message');
      isDone();
    });
    /* jshint unused:true */

    page.open(testPage).then(() => page.evaluate(doPrompt))
      .should.eventually.equal('').notify(isDone);
  });

  it('should correctly handle handlers', function(done) {
    page.setFn('onPrompt', onPromptFn)
      .then(() => page.open(testPage))
      .then(() => page.evaluate(doPrompt))
        .should.eventually.equal('Message was changed')
      .notify(done);
  });
});
