"use strict";
const test     = require('bandage');
const driver   = require('../lib/phantom-promise');
const phantomW = require('../lib/phantom-wrapper');
const utils    = require('../lib/utils');

test('Invalid phantomJS path should throw error', function* T(t) {
  try {
    yield driver.create({path: './'});
  } catch (err) {
    t.ok(err, 'Should throw on invalid paths');
    t.equals(err.code, 'ENOENT', 'Should throw ENOENT Error');
  }
});

test('Should create a phantom Object', function* T(t) {
  let phantom = yield driver.create();

  t.ok(phantom instanceof phantomW, 'Ph should be instance of phantomWrapper');

  yield phantom.exit();
});

test('Should set/get phantom value', function* T(t) {
  let phantom = yield driver.create();
  let libraryPath = './test/';

  yield phantom.set('libraryPath', libraryPath);
  let retrievedLibraryPath = yield phantom.get('libraryPath');

  t.equals(libraryPath, retrievedLibraryPath, 'Library paths should be equal');

  yield phantom.exit();
});

test('Should add/delete/clear phantom cookies', function* T(t) {
  let phantom = yield driver.create();
  let cookie1 = {
    domain  : '.phantomjs.com',
    value   : 'phantom-cookie-value',
    name    : 'phantom-cookie',
    httponly: false,
    path    : '/',
    secure  : false
  };

  let result  = yield phantom.addCookie(cookie1);
  let cookies = yield phantom.get('cookies', 'phantom-cookie');
  t.ok(result, 'Added cookie successfully');
  t.equals(cookie1, cookies[0], 'Cookies should be equal');

  result = yield phantom.deleteCookie('phantom-cookie');
  t.ok(result, 'Deleted cookie successfully');

  cookies = yield phantom.get('cookies', 'phantom-cookie');
  t.notOk(cookies[0], 'Cookie should not exist');

  result  = yield phantom.addCookie(cookie1);
  cookies = yield phantom.get('cookies', 'phantom-cookie');
  t.ok(result, 'Added cookie successfully');
  t.equals(cookie1, cookies[0], 'Cookies should be equal');

  yield phantom.clearCookies();

  cookies = yield phantom.get('cookies', 'phantom-cookie');
  t.notOk(cookies[0], 'Cookie should be cleared');

  yield phantom.exit();
});

test('Phantom InjectJS should return true', function* T(t) {
  let phantom = yield driver.create();
  let testFn = function testFn() {
    console.log('I was called');
  };

  yield utils.saveFile('test/js.js', testFn.toString());

  let result = yield phantom.injectJs('test/js.js');

  t.ok(result, 'Phantom InjectJS should be true');

  yield utils.deleteFile('test/js.js');
  yield phantom.exit();
});
