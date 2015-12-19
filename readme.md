# promise-phantom

This library is a promise-wrapper around the [node-simple-phantom](https://github.com/baudehlo/node-phantom-simple) library.

## Prerequisites
In order to use this library you need to have two things:

1. Node 4.0+ or a transpiler like Babel, to support ES6
2. PhantomJS either installed or somewhere located on your system.

If you can do the following:
```
$ phantomjs
```

And get into an interpreter, you're good to go when it comes to PhantomJS. For Windows users, try the same in CMD or Powershell. If this does not work, you can either get the source and build for Linux or get the zip-file and extract for Windows and Mac. The downloads for PhantomJS can be found [here](http://phantomjs.org/download.html)

## Usage

The wrapper contains all the functions that PhantomJS and node-simple-phantom exports. In addition to this, it also contains some useful functions such as rendering a page to a PDF-binary string.

Nearly all functions in this library returns promises. The only functions that does not return promises are functions that either check the status of a page or phantom object (whether they have been closed/exited or not) and the handler functions (such as onConsoleMessage). 

The objects that you will be interacting with when using this library is for the most part the [Phantom](docs/phantom-wrapper.md)-object and the [Page](docs/page-wrapper.md)-object.

All functions are as documented as they are on the PhantomJS documentation and you should therefore not need to jump between this library and the PhantomJS docs in order to use it correctly. For convenience, all functions that are part of PhantomJS and are documented contains a link to it's respective documentation page, if needed.

Example usage of the library can be seen below:

```javascript
"use strict";
let driver = require('phantom-promise');

// Promise syntax
driver.create(options)
  .then((phantom) => {
    return phantom.createPage();
  }).then((page) => {
    page.open('http://www.google.com')
        .then((status) => {
          return page.set('viewportSize', {width: 640, height: 480})
        }).then(() => {
          return page.renderPdf();
        }).then((binaryStr) => {
          return doSomethingWithPdf(binaryStr);
        });
  }).catch(console.error.bind(console));

// With the CO-library, this gets significantly cleaner
let renderGoogle = function* () {
  let phantom = yield driver.create(options);
  let page    = yield phatnom.createPage();

  yield page.open('http://www.google.com');
  yield page.set('viewportSize', {width: 640, height: 480});

  let contents = yield page.renderPDF('my/temporary/directory');

  return contents;
};

co(renderGoogle).then((contents) => {
  return doSomethingWithFileContents(contents);
}).catch(console.error.bind(console));

```

## Handlers

A special note about all the handlers. Any handler can be set through `on[NameHere]`, where [NameHere] is replaced by that specific handler. All of these functions are set in NodeJS, and called whenever node-simple-phantom receives any events from PhantomJS. As this is an async process, you cannot return values. Any functions that needs a return value, such as `onConfirm` or `onPrompt` must instead be set though the `.setFn` function.

When using the `.setFn` function, keep in mind that this function is stringified and then evaluated in PhantomJS. This means that the scope of function will be that of the PhantomJS process and not the NodeJS process.

## Installation

Installation is pretty simple if you have PhantomJS installed:

`npm install promise-phantom`

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

What this wrapper does is the following:

1. Creates a PhantomJS webserver that listens on a random port.
2. Figures out which port it is by looking at the process id of PhantomJS.
3. Uses HTTP.Requests from to send information back and forth between node and PhantomJS.

node-phantom-simple will continuously poll the PhantomJS server for new events that has happened. This means two things; Handler functions cannot return values or call PhantomJS functions and all events are somewhat delayed.

This process includes a lot of async action and is therefore perfect for promises. There already exists multitudes of different promise-wrappers for PhantomJS libraries, but most of these are either lacking in documentation or using a phantom-wrapper library that complicates the process of interacting with PhantomJS.

As mentioned earlier, this module includes all documentation that is relevant for NodeJS code as well as for PhantomJS code. You should not need to look in two different APIs in order to understand how to use it.

## Documentation

For full documentation of the objects, please see the following links:

- [Phantom](docs/phantom-wrapper.md)
- [Page](docs/page-wrapper.md)
- [Phantom-Promise](docs/phantom-promise.md)

## Issues

If you find any issues, please create a new issue for this library. When creating an issue, it is very much appreciated if you include relevant examples as well as logs so it is easier for me to debug. 

I will, when I have found the problem figure out whether this issue is regarding this library, node-phantom-simple or PhantomJS and update you / them accordingly.
