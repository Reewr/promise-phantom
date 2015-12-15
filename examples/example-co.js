// Simple example of how to use this library using Co, es6 syntax
const co = require('co');
const phantomjs = require('phantomjs-promise');

let generatorFn = function* () {
  let phantom = yield phantomjs.create();
  let page    = yield phantom.createPage();

  yield page.set('viewportSize', {width: 1024, height: 512});
  yield page.open('http://www.google.com');
  yield page.render('google.pdf');
  yield phantom.exit();
};

co(generatorFn);
