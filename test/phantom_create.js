/* globals describe, it */
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const Phantom = require('../lib/phantom');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('phantom.create', function() {
  it('should throw errors on invalid PhantomJS path', function() {
    return driver.create({path: './'}).should.be.rejected;
  });

  it('should create an instance of Phantom', function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    return driver.create().then((ph) => {
      return ph;
    }).should.eventually.be.instanceOf(Phantom).should.notify(done);
  });
});


