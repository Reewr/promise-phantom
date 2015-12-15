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

describe('Utils.isBetween', function() {
  it ('should return false on non-numbers', function() {
    expect(utils.isBetween(0, 100, 'Hello')).to.equal(false);
  });

  it('should return false on NAN or nonFinite', function() {
    expect(utils.isBetween(0, 100, NaN)).to.equal(false);
  });

  it('should be able to parse string numbers', function() {
    expect(utils.isBetween(0, 100, '50')).to.equal(true);
  });

  it('should be able to use numbers', function() {
    expect(utils.isBetween(0, 100, 110)).to.equal(false);
    expect(utils.isBetween(0, 120, 110)).to.equal(true);
  });
});

describe('Utils.wait', function() {
  it('should wait for a number of miliseconds', function() {
    return utils.wait(200).should.eventually.equal(undefined);
  });
});
