"use strict";
const utils = require('../lib/utils');
const test  = require('bandage');

const isErrorEqual = function* (t, message, fn, err) {
  let numTest = err && err.message === '' ? 2 : 3;

  yield t.test(message, function* (st) {
    st.plan(numTest);
    st.throws(fn, 'It should throw');

    let caughtErr = yield fn().then(() => {}).catch(err => err);

    st.equals(caughtErr.name, err.name, 'Error names should be equal');

    if (numTest === 2) {
      return;
    }

    st.equals(caughtErr.message, err.message, 'Error messages should be equal');
  });
};

// This simulates a module or a class, and is used
// to see that Utils.genPromiseFn properly applies the scope to
// the function it is calling
class TestClass {
  constructor() {}
  checkFn() {}
  callbackFn(argument, callback) {
    if (typeof argument !== 'number') {
      return callback(new TypeError('Argument must be number'), null);
    }

    if (!this || typeof this.checkFn !== 'function') {
      return callback(new Error('This. does not exist'), null);
    }

    return callback(null, argument);
  }
}

test('Utils.genPromiseFn', function* T(t) {
  let testClass = new TestClass();

  yield t.test('Utils.genPromiseFn should throw on invalid input', function ST(st) {
    isErrorEqual('Should throw on non-object instances', st, () => {
      return utils.genPromiseFn(null, 'function');
    }, new TypeError());

    isErrorEqual('Should throw on non-string keys', st, () => {
      return utils.genPromiseFn(testClass, 5);
    }, new TypeError());

    isErrorEqual('Should throw on keys that does not give functions', st, () => {
      return utils.genPromiseFn(testClass, 'non-existing-function');
    }, new TypeError());

    isErrorEqual('Should reject errors', st, () => {
      return utils.genPromiseFn(testClass, 'callbackFn', 'Not a number');
    }, new TypeError('Argument must be a number'));
  });

  yield t.test('Utils.genPromiseFn should resolve values', function* ST(st) {
    try {
      let res = yield utils.genPromiseFn(testClass, 'callbackFn', 5);
      st.equals(res, 5, 'Values should be resolved');
    } catch (err) {
      throw err;
    }
  });
});
