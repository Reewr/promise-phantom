// Simple example of how to use this library using Co
const co = require('co');
const phantomjs = require('promise-phantom');

let generatorFn = function* () {
  // First, by creating a phantom instance,
  // you are starting up phantomJS in a different process.
  // the 'phantom'-object will be what you will be using
  let phantom = yield phantomjs.create();

  // Creating a page is as simple as this,
  // and can be done several times for all the pages you need.
  // Make sure to run page.close() or phantom.exit()
  // when you are done.
  let page    = yield phantom.createPage();

  yield page.set('viewportSize', {width: 1024, height: 512}); // Set the viewport size
  yield page.open('http://www.google.com'); // then open google 
  yield page.render('google.pdf'); // then render google to a pdf
  yield phantom.exit(); // and lastly, exiting the phantom process, clearing memory in phantomjs
};

// Run the generatorFunction - returns a promise
co(generatorFn);
