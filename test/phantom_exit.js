/* globals describe, it, before */
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;
let phantom;

describe('phantom.exit', function() {

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      done();
    });
  });

  it('should close and return undefined', function(done) {
    phantom.exit().should.eventually.equal(undefined).notify(done);
  });

  it('should just return if already exited', function(done) {
    phantom.exit().should.eventually.equal(undefined).notify(done);
  });

  it('should cause all other functions to throw errors', function() {
    expect(phantom.hasExited()).to.equal(true);
    expect(() => phantom.throwIfExited()).to.throw(Error);
  });
});
