/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('phantom.setProxy', function() {
  let phantom;

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      done();
    });
  });

  it('should throw on invalid ip', function() {
    expect(() => phantom.setProxy(5, 80, 'http', 'un', 'pw')).to.throw(TypeError);
  });

  it('should throw on invalid port', function() {
    expect(() => phantom.setProxy('192', true, 'http', 'un', 'pw')).to.throw(TypeError);
  });

  it('should throw on invalid type', function() {
    expect(() => phantom.setProxy('192', 80, 5, 'un', 'pw')).to.throw(TypeError);
  });

  it('should throw on invalid username', function() {
    expect(() => phantom.setProxy('192', 80, 'http', 5, 'pw')).to.throw(TypeError);
  });

  it('should throw on invalid password', function() {
    expect(() => phantom.setProxy('192', 80, 'http', 'un', 5)).to.throw(TypeError);
  });

  it('should apply settings', function() {
    return phantom.setProxy('127.0.0.1', 8080, 'http', 'username', 'password')
      .should
      .eventually
      .equal(undefined);
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
