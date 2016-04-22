'use strict';
// Simple example using the local resource capabilities
// of a page
const co = require('co');
// instead of ../../index.js, you would use 'promise-phantom'
const phantomjs = require('../../index.js');
const fs = require('fs');

// Create a small wrapper around fs.readFile
// to make it work with promises, and therefore
// with co
let readFile = function(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, function(err, content) {
      if (err) {
        return reject(err);
      }

      return resolve(content);
    });
  });
};

let exampleLocalResources = function* () {
  // First, by creating a phantom instance,
  // you are starting up phantomJS in a different process.
  // the 'phantom'-object will be what you will be using
  let phantom = yield phantomjs.create();

  // Creating a page is as simple as this,
  // and can be done several times for all the pages you need.
  // Make sure to run page.close() or phantom.exit()
  // when you are done.
  let page = yield phantom.createPage();

  // By looking at example-local-resources.html,
  // we can see that it needs two files:
  // - styles/example-style.css
  // - scripts/example-script.js
  //
  // Since we want to render the html file in a temporary directory
  // we need to make sure that PhantomJS has access to these files.
  // this can be done through "local resources".
  //
  // Lets start by adding the css file, as we have an actual file
  // for that. The example-script.js we will need to create ourselves.
  let cssFile = yield readFile('./example-local-resources.css');

  // As we have no file to get our example-script from, we'll just
  // create some here. Lets just add: "I was rendered" to the HTML.
  let htmlToAdd = '"<br><p>Yay, I was rendered!</p>"';
  let js = 'document.body.innerHTML = document.body.innerHTML + ' + htmlToAdd;

  // In order for promise-phantom to accept the content, it'll have
  // to be a buffer. Luckily, creating a buffer from a string is as
  // easy as:
  let jsFile = new Buffer(js);

  // Now, lets add them. Remember we needed to add:
  // 'styles/example-style.css',
  // 'scripts/example-script.js'
  page.addLocalResource({
    name: 'myCssFile',
    filename: 'styles/example-style.css',
    content: cssFile
  });

  page.addLocalResource({
    name: 'myJsFile',
    filename: 'scripts/example-script.js',
    content: jsFile
  });

  // Now that we have our local resources we will need to
  // load our HTML. promise-phantom does have a .open function,
  // but this is reserved for webpages or local files
  // that does not need to be saved in a temporary storage
  let html = yield readFile('./example-local-resources.html');
  html = html.toString();

  // Before we render our PDF, we'll just set a few settings that will
  // make it look a bit better
  yield page.set('viewportSize', {width: 1920, height: 1080}); // Set the viewport size

  // Just to make sure our resources are loaded correctly,
  // lets keep watching them
  // Notice how they got very random names at the start
  page.onResourceReceived(function(response) {
    console.log('%s - %s', response.stage, response.url);
  });

  // There are two ways of rendering our html now.
  // 1. By using .openHtml, follow by .render we can
  //    specify a filename that it will automatically
  //    be written to.
  // 2. By using .renderHtml, it will perform .openHtml
  //    followed by .render, but instead of saving it
  //    to a file, it will return a Buffer. This
  //    is especially useful if you want to send
  //    the pdf via a webserver and/or email via node

  // Uncomment the two lines below to use the first method
  // let status = yield page.openHtml(html);
  // yield page.render('./myPdf.pdf');

  // Uncomment the one line below to use the second method
  // let pdfBuffer = yield page.renderPdf(html);

  // Now that we're done, lets start closing things and
  // releasing resources
  yield page.close();
  yield phantom.exit(); // and lastly, exiting the phantom process, clearing memory in phantomjs
};

// Run the example function - returns a promise
co(exampleLocalResources).then(() => {
  console.log('Finished exampleLocalResources');
  process.exit(0);
}).catch(err => {
  console.log('%s', err && err.stack ? err.stack : err);
  process.exit(1);
});
