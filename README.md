[![Build Status](https://travis-ci.org/Reewr/promise-phantom.svg?branch=master)](https://travis-ci.org/Reewr/promise-phantom)
[![Coverage Status](https://coveralls.io/repos/github/Reewr/promise-phantom/badge.svg?branch=master)](https://coveralls.io/github/Reewr/promise-phantom?branch=master)
[![Dependency Status](https://david-dm.org/reewr/promise-phantom.svg)](https://david-dm.org/reewr/promise-phantom.svg)

# promise-phantom

This library is a more extensive promise-wrapper around the [node-simple-phantom](https://github.com/baudehlo/node-phantom-simple) library.

It includes all the documentation gathered from PhantomJSs official documentation, as well as some notes from personal experience and issue-hunting.

## Prerequisites
In order to use this library you need to have two things:

1. Node 4.0+ or a transpiler like Babel, to support ES6
2. PhantomJS either installed or somewhere located on your system.

If you can do the following:

```
$ phantomjs
```

And get into an interpreter, you're good to go when it comes to PhantomJS. For Windows users, try the same in CMD or Powershell. If this does not work, you can either get the source and build for Linux or get the zip-file and extract for Windows and Mac. The downloads for PhantomJS can be found [here](http://phantomjs.org/download.html)

You can also specify a path when using the `.create` function, if you have PhantomJS located on your system, but it is not in your environment path.

You can also use [phantomjs-prebuilt](https://www.npmjs.com/package/phantomjs-prebuilt) which will simplify retrieving PhantomJS. In this case, you will be able to do the following:

```javascript
'use strict';
let phantomPrebuilt = require('phantomjs-prebuilt');
let driver = require('promise-phantom');

driver.create({path: phantomPrebuilt.path})
  .then((phantom) => {
    // do something
  });
```

*Note*: phantomjs-prebuilt requires internet access outside of NPM requests in order to retrieve phantomjs binary.

## Installation

The package is on NPM, so it can easily be installed with:

```
npm install promise-phantom
```

Package can be found [here](https://www.npmjs.com/package/promise-phantom)

## Usage

The wrapper contains all the functions that PhantomJS and node-simple-phantom exports. In addition to this, it also contains some useful functions such as rendering a page to a PDF using buffers.

Nearly all functions in this library returns promises. The only functions that does not return promises are functions that either check the status of a page or phantom object (whether they have been closed/exited or not) and the handler functions (such as onConsoleMessage).

The objects that you will be interacting with when using this library is for the most part the [Phantom](https://github.com/Reewr/promise-phantom/blob/master/docs/phantom.md)-object and the [Page](https://github.com/Reewr/promise-phantom/blob/master/docs/webpage.md)-object.

All functions are as documented as they are on the PhantomJS documentation and you should therefore not need to jump between this library and the PhantomJS docs in order to use it correctly. For convenience, all functions that are part of PhantomJS and are documented contains a link to it's respective documentation page, if needed. In addition, all functions that are not a part of PhantomJS is specified with which wrapper they originated from.

Example usage of the library can be seen below:

```javascript
"use strict";
let driver = require('promise-phantom');
let options = {path: 'path/to/phantomjs/if/not/in/global/path'};
// Promise syntax
driver.create(options)
  .then((phantom) => phantom.createPage())
  .then((page) => {
    return page.open('http://www.google.com')
      .then((status) => page.set('viewportSize', {width: 640, height: 480}))
      .then(() => page.renderPdf())
      .then((buffer) => doSomethingWithPdf(buffer));
  }).catch(console.error.bind(console));
```

With [co](https://github.com/tj/co), this becomes significantly cleaner:

```javascript
'use strict';
let co      = require('co');
let driver  = require('promise-phantom');
let options = {path: 'path/to/phantomjs/if/not/in/global/path'};

let renderGoogle = function* () {
  // Start phantom and create page
  let phantom = yield driver.create(options);
  let page    = yield phantom.createPage();

  yield page.open('http://www.google.com');
  yield page.set('viewportSize', {width: 640, height: 480});

  // page.renderPdf is exclusive to this wrapper and returns a buffer.
  // For saving to file, use page.render(filename);
  let buffer = yield page.renderPdf();

  return buffer;
};

co(renderGoogle).then((buffer) => {
  return doSomethingWithFileBuffer(buffer);
}).catch(console.error.bind(console));

```

## Handlers

A special note about all the handlers. Any handler can be set through `on[NameHere]`, where `[NameHere]` is replaced by that specific handler. All of these functions are set in NodeJS, and called whenever node-simple-phantom receives any events from PhantomJS. As this is an async process, you cannot return values. Any functions that needs a return value, such as `onConfirm` or `onPrompt` must instead be set though the `.setFn` function.

When using the `.setFn` function, keep in mind that this function is stringified and then evaluated in PhantomJS. This means that the scope of function will be that of the PhantomJS process and not the NodeJS process.

## How does it work?

Now, PhantomJS cannot run within a node environment, as mentioned by their [FAQ, Why is PhantomJS not written as a Node.js module?](http://phantomjs.org/faq.html):

> A: The short answer: "No one can serve two masters."
>
> A longer explanation is as follows.
> As of now, it is technically very challenging to do so.
>
> Every Node.js module is essentially "a slave" to the core of Node.js, i.e. "the master". In its current state, PhantomJS (and its included WebKit) needs to have the full control (in a synchronous matter) over everything: event loop, network stack, and JavaScript execution.
>
> If the intention is just about using PhantomJS right from a script running within Node.js, such a "loose binding" can be achieved by launching a PhantomJS process and interact with it.

This module itself does nothing to interact with PhantomJS, but that is where [node-phantom-simple](https://github.com/baudehlo/node-phantom-simple) comes in.

What node-phantom-simple does is the following:

1. Creates a PhantomJS webserver that listens on a random port.
2. Figures out which port it is by looking at the process id of PhantomJS.
3. Uses HTTP.Requests from NodeJS to send information back and forth between NodeJS and PhantomJS.

node-phantom-simple will continuously poll (every 500ms) the PhantomJS server for new events that has happened. This means two things;

1. Handler functions cannot return values or call PhantomJS functions
2. All events are somewhat delayed.

This process includes a lot of async action and is therefore perfect for promises. There already exists multitudes of different promise-wrappers for PhantomJS libraries, but most of these are either lacking in documentation or using a phantom-wrapper library that complicates the process of interacting with PhantomJS.

As mentioned earlier, this module includes all documentation that is relevant for NodeJS code as well as for PhantomJS code. You should not need to look in two different APIs in order to understand how to use it.

## Documentation

For full documentation of the objects, please see the following links:

- [Phantom](https://github.com/Reewr/promise-phantom/blob/master/docs/phantom.md)
- [Page](https://github.com/Reewr/promise-phantom/blob/master/docs/webpage.md)
- [Promise-Phantom](https://github.com/Reewr/promise-phantom/blob/master/docs/index.md)

## ES6 and PhantomJS

Most of us prefer ES6 to ES5, which is one of the reasons this library exists. Sadly, PhantomJS does not support ES6 yet and probably won't for some time. At the time of writing, [PhantomJS 2.0 supports 4% of ES6 functionality](https://kangax.github.io/compat-table/es6/#phantom). Due to this, some compromises has to be made.

Functions that are sent to PhantomJS cannot use ES6 syntax. The only exception to this is if you are using a transpiler to compile your code before running it. The functions that cannot have ES6 syntax in the inputted function are the following:

- `page.evaluate`
- `page.evaluateAsync`
- `page.set` (if the value to be stored is a function)
- `page.setFn`

All of these methods can receive functions. These functions are stringified before being sent to PhantomJS. When the functions are then evaluated and contains ES6 syntax, PhantomJS will just throw an error as it does not understand the syntax.

All of the above functions will now (as of v3.1.2) try to warn on some ES6 syntax (only arrow functions for now) instead of trying to fix it. In next major version (v4), these will become errors. This is, to me, the only reasonable way to fix it for this library, as taking in large dependencies to transpile these functions to ES5 compatible functions seems like a waste.

If the warning messages are triggering on incorrect syntax, please let me know.

## Issues

If you find any issues, please create a new issue for this library. When creating an issue, it is very much appreciated if you include relevant examples as well as logs so it is easier for me to debug.

I will, when I have found the problem, figure out whether this issue is regarding this library, node-phantom-simple or PhantomJS and update you / them accordingly.

## Version history

Below is a table showing what has been changed. Only includes major and minor versions, and can also contain patch versions if they are important enough. For a detailed description of what has happened, please see [changelog.md](https://github.com/Reewr/promise-phantom/blob/master/changelog.md)

Version | Date       | Description
------- | ---------- | --------------------------------------------------------
  3.1   | 18.04.2016 | `Page.addLocalResource`, `Page.removeLocalResource`, `Page.getLocalResource`, `Page.clearLocalResources` and `Page.waitForLoad` added.
  3.0   | 27.12.2015 | `Page.renderHtml`, `Page.renderTemplate` and `Page.renderPdf` returns buffers instead of strings
  2.1   | 26.12.2015 | `Page.openHtml` and `Page.openTemplate` added. <br> `Page.openHtml`, `Page.openTemplate`, `Page.renderHtml`, `Page.renderTemplate` all have optional *render directories* parameter.
  2.0   | 19.12.2015 | Updated from using [phantomjs-node](https://github.com/sgentle/phantomjs-node) to [node-phantom-simple](https://github.com/baudehlo/node-phantom-simple)

## Contributers

I would like to thank those who have contributed to this project. Your help is always appreciated.

- [Jonathan Chrisp](https://github.com/jonathanchrisp) for fixing [#8](https://github.com/Reewr/promise-phantom/issues/8)

