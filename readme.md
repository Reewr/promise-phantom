# phantom-promise

Note: Large changes are coming to this library. It will contain extensive documentation, both from testing and from the documentation at PhantomJS' own website. It will also not use phantomjs-node, but instead use node-phantom-simple, due to being simplier in implementation.

This library is a promise-wrapper around the [phantomjs-node](https://github.com/sgentle/phantomjs-node) library made by [Sam Gentle](https://github.com/sgentle).

## Prerequisits

In order to use this library you need to have two things:

1. Node 4.0+ or a transpiler like Babel, to support ES6
2. PhantomJS installed on your system.

If you can do the following:
```
$ phantom
```

And get into an interpreter, you're good to go when it comes to PhantomJS. For Windows users, try the same in CMD or Powershell.

## Usage

While the wrapper is not complete yet, some of the most useful functionaility is already there. For documentation, please check out both [mine](docs/phantom.md) and [phantomjs-node](https://github.com/sgentle/phantomjs-node/wiki) as well as the [PhantomJS API](http://phantomjs.org/api/).

In addition to most of the features of phantomjs-node, this library also includes a function to render a PDF and get the data-string, instead of having to retrieve it through a file. It should be noted that behind-the-scenes, the library has to save the file, before loading it. Large files may therefore take significant longer to render.

Example usage is pretty much as phantomjs-node, except for the use of promises instead of callbacks. Every function returns a promise. The only exception to this rule is functions starting with 'on' such as 'onConsoleMessage' as those
are handlers that you can attach.

```javascript
"use strict";
let Phantom = require('phantom-promise');

// phantomjs-node syntax
Phantom.create(function(ph) {
  ph.createPage(function(page) {
    page.open('http://www.google.com', function(status) {
      page.set('viewportSize', {width: 640, height: 480}, function() {
        page.renderPDF('my/temporary/directory', function(pdf) {
          return doSomethingWithContents(pdf);
        });
      });
    });
  }, options);
}, options);

// Promise syntax
Phantom.create(options)
  .then((ph) => {
    return ph.createPage(options);
  }).then((page) => {
    page.open('http://www.google.com', options)
        .then((status) => {
          return page.set('viewportSize', {width: 640, height: 480})
        }).then(() => {
          return page.renderPDF('my/temporary/directory');
        }).then((fileContents) => {
          return doSomethingWithFileContents(fileContents);
        });
  }).catch(console.error.bind(console));

// With the CO-library, this gets significantly cleaner
let renderGoogle = function* () {
  let ph   = yield Phantom.create(options);
  let page = yield ph.createPage(options);

  yield page.open('http://www.google.com', options);
  yield page.set('viewportSize', {width: 640, height: 480});

  let contents = yield page.renderPDF('my/temporary/directory');

  return contents;
};

co(renderGoogle).then((contents) => {
  return doSomethingWithFileContents(contents);
}).catch(console.error.bind(console));

```

## Usage in Windows

**Note**: Due to a massive installation that has to do with ````node-gyp```, you should probably add the following options when creating a new instance of Phantom

```javascript
let phantom = require('phantom-promise');

phantom.create({
  dnodeOpts: {
    weak: false
  }
});
```

Read more at [phantomjs-node](https://github.com/sgentle/phantomjs-node#use-it-in-windows)
