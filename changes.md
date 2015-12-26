# Changes

## Version 3.0

**Changed**: Page.renderPdf()
**Changed**: Page.renderHtml(htmlString, renderDirectory)
**Changed**: Page.renderTemplate(template, renderDirectory, option)

Due to an issue that sometimes caused the Pdf to be rendered blank, the above mentioned functions has been changed from returning a `string` to a `buffer`.

When using `buffer.toString()` some of the data seems get lost and the rendered PDF was therefore blank.

Due to a breaking change, the version has gone from 2.1 to 3.0.

## Version 2.1

**Added:** Page.openHtml(htmlString, renderDirectory)<br>
**Added:** Page.openTemplate(template, renderDirectory, options)<br>
**Changed:** Page.renderTemplate(template, renderDirectory, options)<br>
**Changed:** Page.renderHtml(htmlString, renderDirectory)<br>
**Changed:** Phantom.addCookie(cookie)

`Page.openHtml(htmlString, renderDirectory)` works much like `Page.open(location)` but instead of requiring an address, it uses a HTML string. This is done by either saving it to a file with a pseudo-unique name in the renderDirectory specified, or in the operating systems temporary folder, if renderDirectory is omitted. It is then loaded using `Page.open` before the file is deleted.

`Page.openTemplate(template, renderDirectory, options)` works exactly as above, but with a template object that has a `.render` function that returns a HTML string.

`Page.renderTemplate(template, renderDirectory, options)` has been changed to use `Page.openTemplate` and therefore works without specifying a renderDirectory.

`Page.renderHtml(htmlString, renderDirectory)` has been changed to use `Page.openHtml`. Same changes as above.

It should be noted that if you have any includes (i.e. script src="some-javascript-file.js") that are local files, you should still use a renderDirectory as PhantomJS will try to find these files relative to the render directory.

`Phantom.addCookie(cookie)` now has type checking, which will throw TypeError on invalid cookies. It is expected to be an object, with a name as well as a value

As with minor versions, none of the changes should be breaking changes and everything should be working as they did in 2.0

## Version 2.0

**Added:** Page <br>
**Added:** Phantom <br>
**Changed:** Too much to specify

Major rewrite of the entire library and now uses node-phantom-simple instead. All functions that PhantomJS include are documented with their documentation. All functions are documented, except for a few which lacks documentation from the creators of PhantomJS.

In addition, this version was also pushed to NPM.

## Version 1.0

Uses phantomjs-node as the wrapper around PhantomJS.
