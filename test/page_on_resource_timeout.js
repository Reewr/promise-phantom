/* globals describe, it, before, after */
'use strict';
const chai   = require('chai');
const driver = require('../index');
const chaiAsPromised = require('chai-as-promised');
const http = require('http');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;


/**
 * Creates a simple server that only handles one specific request.
 * Any URL that does not contain 'css' in it will be served the
 * index page, which contains a CSS file that will never be
 * answered. This is so that onResourceTimeout can be tested.
 *
 * The return object has a function called `close`, which,
 * when called, returns a promise which will be resolved
 * when the server is closed
 *
 * @returns {Promise(object)}
 */
const createServer = function() {
  let index = '' +
    '<html>' +
      '<head>' +
        '<title>Test</title>' +
        '<link rel="stylesheet" href="/something.css">' +
      '</head>' +
      '<body>Test</body>' +
    '</html>';

  let server = http.createServer((req, res) => {
    if (req.url.indexOf('css') === -1) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
    }
  });

  let close = function() {
    return new Promise(function(resolve, reject) {
      server.close((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  };

  return new Promise(function(resolve) {
    server.listen(8080, function() {
      resolve({close: close});
    });
  });
};

describe('Page.onResourceTimeout', function() {
  let phantom;
  let page;
  let server;

  before(function startPhantom(done) {
    driver.create().then(ph => {
      phantom = ph;
      return createServer();
    }).then(s => {
      server = s;
      return phantom.createPage();
    }).then(p => {
      page = p;
      done();
    }).catch(done);
  });

  after(function stopPhantom(done) {
    page.close()
      .then(() => phantom.exit())
      .then(() => server.close())
      .then(() => done())
      .catch(done);
  });

  it('should throw errors on non-functions', function() {
    expect(() => page.onResourceTimeout(5)).to.throw(TypeError);
  });

  it('should call when resources timeout', function(done) {
    page.onResourceTimeout(function(err) {
      expect(err.errorCode).to.equal(408);
      expect(err.url).to.equal('http://localhost:8080/something.css');
      done();
    });

    // set timeout really low so it triggers on
    // the CSS file that it should get answer for
    // but never will
    page.set('settings.resourceTimeout', 500)
        .should.eventually.equal(true)
      .then(() => page.open('http://localhost:8080'))
        .should.eventually.equal('success');
  });
});
