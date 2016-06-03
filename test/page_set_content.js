/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.setContent', function() {
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
    expect(() => page.setContent()).to.throw(TypeError);
    expect(() => page.setContent('content')).to.throw(TypeError);
    expect(() => page.setContent('content', 5)).to.throw(TypeError);
  });

  it('should set the content', function(done) {
    let content = {url: 'http://www.mywebpage.com/', content: 'Content'};

    let fn = function() {
      return {url: window.location.href, content: document.body.innerHTML};
    };

    let html = '<html><head><title>title</title></head>' +
        '<body>' + content.content + '</body>';

    page.setContent(html, content.url)
      .then(() => page.evaluate(fn))
        .should.eventually.deep.equal(content)
      .notify(done);
  });
});
