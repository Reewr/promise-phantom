/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.removeLocalResource', function() {
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

  it('should throw error on invalid input', function() {
    expect(() => page.removeLocalResource()).to.throw(TypeError);
    expect(() => page.removeLocalResource(5)).to.throw(TypeError);
  });

  it('should remove a local resource', function() {
    let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
    page.addLocalResource(options);

    let result1 = page.removeLocalResource(options.name);
    let result2 = page.removeLocalResource(options.name);
    let result3 = page.getLocalResource(options.name);

    expect(result1).to.equal(true);
    expect(result2).to.equal(false);
    expect(result3).to.equal(null);
  });
});
