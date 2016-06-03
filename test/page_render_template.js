/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Page.renderTemplate', function() {
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

  it('should throw on non-objects without .render function', function() {
    expect(() => page.renderTemplate({})).to.throw(TypeError);
  });

  it('should throw on .render functions that does not return strings', function() {
    expect(() => page.renderTemplate({render: () => true})).to.throw(TypeError);
  });

  it('should render templates to a buffer', function(done) {
    let sentOptions = {this: 'should', be: 'sent', to: 'render'};
    let templateObject = {
      render: (options) => {
        expect(options).to.deep.equal(sentOptions);
        return '' +
          '<!DOCTYPE html>' +
          '<html>' +
          '<head><title>Test</title></head>' +
          '<body>Body</body>' +
          '</html>';
      }
    };

    page.renderTemplate(templateObject, sentOptions)
      .should.eventually.be.instanceOf(Buffer)
      .notify(done);
  });
});
