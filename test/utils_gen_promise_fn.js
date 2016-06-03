/* globals describe, it */
'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Utils.genPromiseFn', function() {
  let testObject = {
    value: 5,
    callbackFn(argument, callback) {
      if (typeof argument !== 'number') {
        return callback(new TypeError('Argument must be a number'), null);
      }

      if (!this || typeof this.value !== 'number') {
        return callback(new TypeError('"this"-pointer is incorrect'), null);
      }

      return callback(null, argument);
    }
  };

  it('should throw errors on non-object instances', function() {
    expect(() => utils.genPromiseFn(null, '')).to.throw(TypeError);
  });

  it('should throw on keys that does not give functions', function() {
    expect(() => utils.genPromiseFn(testObject, 'value')).to.throw(TypeError);
  });

  it('should reject errors', function() {
    let promise = utils.genPromiseFn(testObject, 'callbackFn', 'not-a-number');
    return promise.should.be.rejectedWith(TypeError, 'Argument must be a number');
  });

  it('should resolve values', function() {
    let promise = utils.genPromiseFn(testObject, 'callbackFn', 5);
    return promise.should.eventually.equal(5);
  });
});
