// This is commented out due to an error in node-phantom-js
// as detailed in https://github.com/Reewr/promise-phantom/issues/5
//
///* globals describe, it, before, after */
//
//
// 'use strict';
// const chai   = require('chai');
// const driver = require('../index');
// const chaiAsPromised = require('chai-as-promised');
// const Page   = require('../lib/webpage');

// chai.should();
// chai.use(chaiAsPromised);

// const expect = chai.expect;
// const expectDoneCalls = function(num, done) {
//   return function(err) {
//     if (err) {
//       return done(err);
//     }
//     num--;

//     if (num <= 0) {
//       return done();
//     }
//   };
// };


// describe('Page.getPage', function() {
//   let phantom;
//   let page;

//   before(function startPhantom(done) {
//     driver.create().then((ph) => {
//       phantom = ph;

//       phantom.createPage().then(p => {
//         page = p;
//         done();
//       }).catch(done);
//     }).catch(done);
//   });

//   after(function stopPhantom(done) {
//     page.close()
//       .then(() => phantom.exit())
//       .then(() => done())
//       .catch(done);
//   });


//   it('should throw error on non-strings', function() {
//     expect(() => page.getPage({not: 'a string'})).to.throw(TypeError);
//   });

//   it('should return null on windows that does not exist', function() {
//     return page.getPage('someName').should.eventually.equal(null);
//   });

//   it('should return a page object', function(done) {
//     this.timeout(5000);
//     let html = '' +
//         '<html>' +
//         '<head><title>Test</title></head>' +
//         '<body>' +
//         '<script>window.open("");</script>' +
//         '</body>' +
//         '</html>';

//     let isDone      = expectDoneCalls(2, done);
//     let windowName  = 'myName';
//     let paperSize   = {width: '5cm'};
//     page.onPageCreated(function(innerPage) {
//       innerPage.evaluate(function(name) {
//         window.name = name;
//       }, windowName).then(() => {
//         return innerPage.set('paperSize', paperSize);
//       }).then(() => {
//         return page.getPage(windowName);
//       }).then((iPage) => {
//         console.log(iPage, page);
//         expect(iPage).to.be.instanceof(Page);
//         return iPage.get('paperSize');
//       }).then((pSize) => {
//         expect(pSize.width).to.equal(paperSize.width);
//         isDone();
//       });
//     });

//     page.openHtml(html).should.eventually.equal('success').notify(isDone);
//   });
// });
