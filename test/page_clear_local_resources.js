/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.clearLocalResources', function() {
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

  it('should clear all local resources', function() {
    let options1 = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
    let options2 = {name: 'myOtherFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
    page.addLocalResource(options1);
    page.addLocalResource(options2);

    let result1 = page.clearLocalResources();
    let result2 = page.getLocalResource(options1.name);
    let result3 = page.getLocalResource(options2.name);
    let result4 = page.clearLocalResources();

    expect(result1).to.equal(true);
    expect(result2).to.equal(null);
    expect(result3).to.equal(null);
    expect(result4).to.equal(false);
  });
});
