/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.addLocalResource, Page.getLocalResource', function() {
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
    expect(() => page.addLocalResource()).to.throw(TypeError);
    expect(() => page.addLocalResource({name: ''})).to.throw(TypeError);
    expect(() => page.addLocalResource({name: {}})).to.throw(TypeError);
    expect(() => page.addLocalResource({name: 'something', filename: ''})).to.throw(TypeError);
    expect(() => page.addLocalResource({name: 'name', filename: 'file', content: {}})).to.throw(TypeError);
  });

  it('should throw error on invalid input to getLocalResource', function() {
    expect(() => page.getLocalResource()).to.throw(TypeError);
    expect(() => page.getLocalResource(5)).to.throw(TypeError);
  });

  it('should add local resource and be retrievable through getLocalResource', function() {
    let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
    page.addLocalResource(options);

    let result = page.getLocalResource(options.name);
    expect(result).to.deep.equal(options);
  });

  it('should fail to retrieve names that are not equal', function() {
    let options = {name: 'myFile', filename: 'mypath.js', content: new Buffer('myjsfile')};
    page.addLocalResource(options);
    let result1 = page.getLocalResource(options.name);
    let result2 = page.getLocalResource('myfile');

    expect(result1).to.deep.equal(options);
    expect(result2).to.equal(null);
  });
});
