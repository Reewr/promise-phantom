/* globals describe, it, before, after */
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

describe('Page.includeJs', function() {
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
    expect(() => page.includeJs({})).to.throw(TypeError);
    expect(() => page.includeJs(5)).to.throw(TypeError);
    expect(() => page.includeJs(null)).to.throw(TypeError);
  });

  let scriptUrl = 'https://raw.githubusercontent.com/Reewr/promise-phantom/master/test/resources/test-resource.js';
  let message = 'Script loaded';

  it('should retrieve JS from a website', function(done) {
    this.timeout(5000);
    let isDone = expectDoneCalls(2, done);

    page.onConsoleMessage(function(msg) {
      expect(msg).to.equal(message);
      isDone();
    });
    page.includeJs(scriptUrl).should.eventually.equal('success').notify(isDone);
  });
});
