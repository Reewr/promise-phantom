// Simple example of how to use this library, es6 syntax
const phantomjs = require('phantomjs-promise');

phantomjs.create().then((phantom) => {
  phantom.createPage().then((page) => {
    page.set('viewportSize', {width: 1024, height: 512})
      .then(() => page.open('http://www.google.com'))
      .then(() => page.render('google.pdf'))
      .then(() => phantom.exit())
      .catch((err) => console.error(err));
  });
}).catch((err) => {
  console.error(err);
});