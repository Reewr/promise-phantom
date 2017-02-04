/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.render', function() {
  let phantom;
  let page;
  let testPage = './test/resources/test.html';
  let file1 = './test/resources/rendered_png.png';
  let file2 = './test/resources/rendered_jpg.jpeg';
  let file3 = './test/resources/rendered_pdf.pdf';


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
      .then(() => utils.deleteFile(file1))
      .then(() => utils.deleteFile(file2))
      .then(() => utils.deleteFile(file3))
      .then(() => done())
      .catch(done);
  });

  it('should throw on non-string filenames', function() {
    expect(() => page.render(5)).to.throw(TypeError);
  });

  it('should throw on non-accepted format', function() {
    expect(() => page.render('filename.myown')).to.throw(TypeError);
  });

  it('should throw on invalid quality', function() {
    expect(() => page.render('myfile.pdf', 'pdf', 'not')).to.throw(TypeError);
  });

  it('should render images to file', function(done) {
    this.timeout(5000);
    page.open(testPage).should.eventually.equal('success').then(() => {
      return Promise.all([
        page.render(file1).should.eventually.equal(true),
        page.render(file2).should.eventually.equal(true),
        page.render(file3).should.eventually.equal(true)
      ]).should.notify(done);
    });
  });
});
