/* globals describe, it */
'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

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
