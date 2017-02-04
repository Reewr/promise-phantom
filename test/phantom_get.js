/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('phantom.get', function() {
  let phantom;

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      done();
    });
  });

  it('should throw error on invalid keys', function() {
    expect(() => phantom.get('does-not-exist')).to.throw(TypeError);
  });

  it('should be able to get values, such as previously set value', function() {
    let libraryPath = './test';

    return phantom.set('libraryPath', libraryPath)
      .should.eventually.equal(true)
      .then(() => {
        return phantom.get('libraryPath');
      }).should.eventually.equal(libraryPath);
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
