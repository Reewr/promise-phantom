# phantom-promise

This library is a promise-wrapper around the [node-simple-phantom](LINK_NEEDED) library.

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

While the wrapper is not complete yet, some of the most useful functionaility is already there. For documentation, please check out the documentation under /docs. The documentation includes most of PhantomJS documentation too. In addition it also contains links to the equal function in PhantomJS. Usage is very similar, except for the callbacks etc, where this uses promises.

In addition to most of the features of phantomjs-node, this library also includes a function to render a PDF and get the data-string, instead of having to retrieve it through a file. It should be noted that behind-the-scenes, the library has to save the file, before loading it. Large files may therefore take significant longer to render.

Example usage is pretty much as phantomjs-node, except for the use of promises instead of callbacks. Every function returns a promise. The only exception to this rule is functions starting with 'on' such as 'onConsoleMessage' as those are handlers that you can attach.

```javascript
"use strict";
let phantom = require('phantom-promise');

// Promise syntax
phantom.create(options)
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
  let ph   = yield phantom.create(options);
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

## Installation


## How does it work?

Now, PhantomJS cannot run in a node environment, as mentioned by their [FAQ, Why is PhantomJS not written as a Node.js module?](http://phantomjs.org/faq.html):

> A: The short answer: "No one can serve two masters."
>
> A longer explanation is as follows.
> As of now, it is technically very challenging to do so.
>
> Every Node.js module is essentially "a slave" to the core of Node.js, i.e. "the master". In its current state, PhantomJS (and its included WebKit) needs to have the full control (in a synchronous matter) over everything: event loop, network stack, and JavaScript execution.
> 
> If the intention is just about using PhantomJS right from a script running within Node.js, such a "loose binding" can be achieved by launching a PhantomJS process and interact with it.

This module itself does nothing to interact with PhantomJS, but that is where [node-phantom-simple](https://github.com/baudehlo/node-phantom-simple) comes in. 

What this does is the following:

1. Creates a PhantomJS webserver that listens on a random port.
2. Figures out which port it is by looking at the process id of PhantomJS.
3. Uses HTTP.Requests to send information back and forth between node and PhantomJS.

This process includes a lot of async action and is therefore perfect for promises. There already exists some promise wrappers for node-phantom-simple, but they are rather lacking when it comes to documentation. 

This module includes all documentation that is relevant for NodeJS code as well as for PhantomJS code. You should not need to look in two different APIs in order to understand how to use it.
