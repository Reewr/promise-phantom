/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('phantom.injectJs', function() {
  let phantom;
  let filePath = './test/injectJs.js';

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;

      // Save the test function to inject
      let testFn = function testFn() {console.log('I was called');};
      utils.saveFile(filePath, testFn.toString()).then(() => {
        done();
      }).catch((err) => done(err));
    });
  });


  it('should throw on non-strings', function() {
    expect(() => phantom.injectJs({not: 'string'})).to.throw(TypeError);
  });

  it('should inject a JavaScript file and return true', function() {
    return phantom.injectJs(filePath).should.eventually.equal(true);
  });

  after(function stopPhantom(done) {
    // stop phantom and delete the test function file
    phantom.exit()
      .then(() => utils.deleteFile(filePath))
      .then(() => done())
      .catch((err) => done(err));
  });
});
