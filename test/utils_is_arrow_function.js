/* globals describe, it */
'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Utils.isArrowFunction', function() {
  it('should return true on arrow functions', function() {
    let saved = () => {};
    expect(utils.isArrowFunction(() => {})).to.equal(true);
    expect(utils.isArrowFunction(x => x)).to.equal(true);
    expect(utils.isArrowFunction(saved)).to.equal(true);
  });

  it('should return false on non-arrow functions', function() {
    let saved = function myFunction() {};
    expect(utils.isArrowFunction(function() {})).to.equal(false);
    expect(utils.isArrowFunction(function named() {})).to.equal(false);
    expect(utils.isArrowFunction(saved)).to.equal(false);
  });
});
