/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.waitForSelector', function() {
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

  it('should throw error on invalid selector', function() {
    expect(() => page.waitForSelector(5)).to.throw(TypeError);
  });

  it('should wait roughly 170ms before returning', function(done) {
    this.timeout(3000);
    let date = Date.now();
    page.open(testPage).then(() => {
      page.waitForSelector('.test-class', 2500).then(() => {
        let timeout = Date.now() - date;
        expect(timeout).to.be.closeTo(100, 150);
        done();
      });
    });
  });
});
