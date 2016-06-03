/* globals describe, it */
'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const utils = require('../lib/utils');

chai.should();
chai.use(chaiAsPromised);

describe('Utils.wait', function() {
  it('should wait for a number of miliseconds', function() {
    return utils.wait(200).should.eventually.equal(undefined);
  });
});
