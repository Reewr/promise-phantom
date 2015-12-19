// Simple example of how to use this library
const driver = require('promise-phantom');

// First, by creating a phantom instance,
// you are starting up phantomJS in a different process.
// the 'phantom'-object will be what you will be using
driver.create().then((phantom) => {

  // Creating a page is as simple as this,
  // and can be done several times for all the pages you need.
  // Make sure to run page.close() or phantom.exit()
  // when you are done.
  phantom.createPage().then((page) => {
    // Set the viewport to a specific size
    page.set('viewportSize', {width: 1024, height: 512})
      .then(() => page.open('http://www.google.com')) // Open google
      .then(() => page.render('google.pdf')) // render google to a pdf
      .then(() => phantom.exit()) // and lastly exit
      .catch((err) => console.error(err));
  });
}).catch((err) => {
  console.error(err);
});