/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.openTemplate', function() {
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

  let sentOptions = {this: 'should', be: 'sent', to: 'render'};
  let templateObject = {
    render: (options) => {
      expect(options).to.deep.equal(sentOptions);
      return '' +
        '<!DOCTYPE html>' +
        '<html>' +
        '<head><title>Test</title></head>' +
        '<body>page.openTemplate</body>' +
        '</html>';
    }
  };

  let retBody = function() {
    return document.body.textContent;
  };

  it('should throw error on invalid template object', function() {
    expect(() => page.openTemplate({})).to.throw(TypeError);
  });

  it('should throw on .render function not returning string', function() {
    expect(() => page.openTemplate({render: () => true})).to.throw(TypeError);
  });

  it('should open templates in render directories', function(done) {
    page.openTemplate(templateObject, './test/resources', sentOptions)
        .should.eventually.equal('success')
      .then(() => page.evaluate(retBody))
        .should.eventually.equal('page.openTemplate')
      .notify(done);
  });

  it('should open templates in temporary directories', function(done) {
    page.openTemplate(templateObject, sentOptions)
        .should.eventually.equal('success')
      .then(() => page.evaluate(retBody))
        .should.eventually.equal('page.openTemplate')
      .notify(done);
  });
});
