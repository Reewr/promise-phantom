/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.openHtml', function() {
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

  it('should throw on non-strings', function() {
    expect(() => page.openHtml()).to.throw(TypeError);
  });

  it('should be rejected on non-directories, if specified', function() {
    return page.openHtml('Something', 'this-is-not-directory')
      .should
      .be
      .rejectedWith(Error);
  });

  describe('without localResources', function() {
    let html = '' +
      '<!DOCTYPE html>' +
      '<html>' +
      '<head><title>Test</title></head>' +
      '<body>Page.openHtml</body>' +
      '</html>';

    let retBody = function() {
      return document.body.textContent;
    };

    it('should open HTML', function(done) {
      let openHtmlPromise = page.openHtml(html).should.eventually.equal('success');
      let pageEvalPromise = openHtmlPromise.then(() => page.evaluate(retBody));
      pageEvalPromise.should.eventually.equal('Page.openHtml').notify(done);
    });
  });

  describe('with localResources', function() {
    let css = 'body { height: 400px; background-color: blue; }';
    let html = '' +
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
        '<title>Test</title>' +
        '<link rel="stylesheet" href="css/something.css">' +
        '<link rel="stylesheet" href="css/should_not_exist.css">' +
        '</head>' +
      '<body>Page.openHtml</body>' +
      '</html>';

    let retBody = function() {
      return {
        text: document.body.textContent,
        css: document.styleSheets[0].rules[0].cssText
      };
    };

    let retContent = {text: 'Page.openHtml', css: css};

    it('should open HTML and request resources', function(done) {
      page.onResourceError(function(err) {
        expect(err.errorCode).to.equal(203);
        expect(err.url.indexOf('css/should_not_exist.css')).to.not.equal(-1);
      });

      /* jshint ignore:start */
      page.onResourceRequested(function(request, empty) {
        let isOkay = request.url.indexOf('.css') !== -1 ||
                     request.url.indexOf('.html') !== -1;
        expect(isOkay).to.equal(true);
      });
      /* jshint ignore:end */

      page.addLocalResource({
        name    : 'something.css',
        filename: 'css/something.css',
        content : new Buffer(css)
      });

      let openHtmlPromise = page.openHtml(html).should.eventually.equal('success');
      let pageEvalPromise = openHtmlPromise.then(() => page.evaluate(retBody));
      pageEvalPromise.should.eventually.deep.equal(retContent).notify(done);
    });
  });
});
