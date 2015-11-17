"use strict";
let bandage     = require('bandage');
let phantom     = require('../lib/phantom-promise');
let phWrapper   = require('../lib/phantom-wrapper');
let pageWrapper = require('../lib/webpage-wrapper');

let isWindows = /^win/.test(process.platform);
let options   = {dnodeOpts: {weak: !isWindows}};

bandage('Should create a phantom Object', function* T(t) {
  let ph = yield phantom.create(options);
  t.ok(ph instanceof phWrapper, 'Ph should be instance of phWrapper');
  ph.exit();
});

bandage('Should create a webpage object', function* T(t) {
  let ph   = yield phantom.create(options);
  let page = yield ph.createPage();

  t.ok(page instanceof pageWrapper, 'Page should be instance of pageWrapper');
  ph.exit();
});

bandage('Should set value', function* T(t) {
  let ph   = yield phantom.create(options);
  let page = yield ph.createPage();

  yield page.set('viewportSize', {width: 1024, height: 768});
  let width = yield page.get('viewportSize.width');

  t.strictEqual(width, 1024, 'viewportSize.width should be equal to 1024');
  ph.exit();
});

bandage('Evaulate should be able to edit DOMs and retrive values', function* T(t) {
  let ph    = yield phantom.create(options);
  let page  = yield ph.createPage();
  let title = 'My title is awesome';

  yield page.open('./test/test.html');
  yield page.evaluate(function(title) {
    document.querySelector('title').innerText = title;
  }, [title]);

  let retrievedTitle = yield page.evaluate(function() {
    return document.querySelector('title').innerText;
  });

  t.strictEqual(retrievedTitle, title, 'Titles should be equal');
  ph.exit();
});

bandage('Page should be able to render pdf to file', function * T(t) {
  let ph    = yield phantom.create(options);
  let page  = yield ph.createPage();

  yield page.open('./test/test.html');
  yield page.render('./test/mypdf.pdf', {format: 'pdf'});

  let myFile = yield page._loadFile('./test/mypdf.pdf');

  t.ok(myFile, 'My pdf should exist');
  ph.exit();
});

bandage('Page should be able to render pdf to string', function* T(t) {
  let ph    = yield phantom.create(options);
  let page  = yield ph.createPage();

  yield page.open('./test/test.html');
  yield page.render('./test/mypdf.pdf', {format: 'pdf'});
  let myFile     = yield page._loadFile('./test/mypdf.pdf');
  let mySameFile = yield page.renderPDF('./test');

  t.strictEqual(myFile, mySameFile, 'PDFs should be equal');
  ph.exit();
});

bandage('Page catch console messages', function* T(t) {
  t.plan(1);
  let ph      = yield phantom.create(options);
  let page    = yield ph.createPage();
  let message = 'This is a message';

  yield page.open('./test/test.html');
  page.onConsoleMessage(function(consMessage) {
    t.strictEqual(consMessage, message, 'Message should be equal');
  });
  yield page.evaluate(function(msg) {
    console.log(msg);
  }, message);

  ph.exit();
});

bandage('Page should renderBase64 images', function* T(t) {
  let ph    = yield phantom.create(options);
  let page  = yield ph.createPage();

  yield page.open('./test/test.html');
  let res = yield page.renderBase64('png');

  t.ok(res, 'Result should be defined');

  ph.exit();
});

