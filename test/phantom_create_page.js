/* globals describe, it, before, after*/
'use strict';
const chai    = require('chai');
const driver  = require('../index');
const Page    = require('../lib/webpage');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

let phantom;

describe('phantom.createPage', function() {

  before(function(done) {
    // starting up phantom may take some time on the first run
    this.timeout(5000);
    driver.create().then((ph) => {
      phantom = ph;
      done();
    });
  });

  it('should create a webpage object', function() {
    return phantom.createPage().should.eventually.be.instanceOf(Page);
  });

  after(function stopPhantom(done) {
    phantom.exit().then(() => done()).catch((err) => done(err));
  });
});
