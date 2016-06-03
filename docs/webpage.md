<a name="Page"></a>

## Page
The Page object contains most of the functionality of PhantomJS and it is
what you will be interacting with the most of the time when using this wrapper.

This wrapper does not contain functions that has been marked by PhantomJS as
deprecated. If you really need the functionality of these functions, they can
be retrieved through page.page.deprecatedFunction(callback), but I would
advise you not to do that.

The following functions have been declared deprecated by PhantomJS:
- childFramesCount
- childFramesName
- currentFrameName
- release (use close instead)
- switchToChildFrame

In addition to all the functions mentioned by the PhantomJS API, this wrapper
also contains some utility functions that makes it easier to use production
where you would need to create PDF reports.

The added functions are:
- getCookie
- renderPdf
- renderTemplate
- renderHtml
- openTemplate
- openHtml
- addLocalResource
- removeLocalResource
- getLocalResource
- clearLocalResources

All functions that are part of PhantomJS' API include the documentation
from their webpage. Comments outside of the PhantomJS docs will include a
*Developer Note*-tag. In addition, all functions that can be found in the
API also have links to the respective pages.

The full documentation for the PhanomJS page can be found at [here](http://phantomjs.org/api/webpage/)

**Kind**: global class  

* [Page](#Page)
    * _instance_
        * [.isClosed()](#Page+isClosed) ⇒ <code>Promise(Boolean)</code>
        * [.setFn(name, fn)](#Page+setFn) ⇒ <code>Promise()</code>
        * [.get(name)](#Page+get) ⇒ <code>Promise(value)</code>
        * [.set(name, value)](#Page+set) ⇒ <code>Promise()</code>
        * [.evaluate(fn)](#Page+evaluate) ⇒ <code>Promise(StringifiableValue)</code>
        * [.waitForSelector(selector, timeout)](#Page+waitForSelector) ⇒ <code>Promise()</code>
        * [.addCookie(options)](#Page+addCookie) ⇒ <code>Promise(Boolean)</code>
        * [.clearCookies()](#Page+clearCookies) ⇒ <code>Promise(boolean)</code>
        * [.close()](#Page+close) ⇒ <code>Promise()</code>
        * [.deleteCookie(name)](#Page+deleteCookie) ⇒ <code>Promise(Boolean)</code>
        * [.getCookie(name)](#Page+getCookie) ⇒ <code>Promise(object)</code>
        * [.evaluateJavaScript(javaScriptStr)](#Page+evaluateJavaScript) ⇒ <code>Promise()</code>
        * [.evaluateAsync(fn, num, args)](#Page+evaluateAsync) ⇒ <code>Promise()</code>
        * [.getPage(windowName)](#Page+getPage) ⇒ <code>Promise(Page)</code> &#124; <code>Promise(null)</code>
        * [.go(historyRelativeIndex)](#Page+go) ⇒ <code>Promise(boolean)</code>
        * [.goBack()](#Page+goBack) ⇒ <code>Promise(boolean)</code>
        * [.goForward()](#Page+goForward) ⇒ <code>Promise(boolean)</code>
        * [.includeJs(url)](#Page+includeJs) ⇒ <code>Promise()</code>
        * [.injectJs(filename)](#Page+injectJs) ⇒ <code>Promise()</code>
        * [.open(url, methodOrSettings, data)](#Page+open) ⇒ <code>Promise(string)</code>
        * [.openUrl(url, httpConf, settings)](#Page+openUrl) ⇒ <code>Promise()</code>
        * [.reload()](#Page+reload) ⇒ <code>Promise()</code>
        * [.render(filename, format, quality)](#Page+render) ⇒ <code>Promise()</code>
        * [.renderBase64(format)](#Page+renderBase64) ⇒ <code>Promise(string)</code>
        * [.sendEvent()](#Page+sendEvent) ⇒ <code>Promise()</code>
        * [.setContent(content, url)](#Page+setContent) ⇒ <code>Promise()</code>
        * [.stop()](#Page+stop) ⇒ <code>Promise()</code>
        * [.switchToFocusedFrame()](#Page+switchToFocusedFrame) ⇒ <code>Promise()</code>
        * [.switchToFrame(framePosition)](#Page+switchToFrame) ⇒ <code>Promise(boolean)</code>
        * [.switchToMainFrame()](#Page+switchToMainFrame) ⇒ <code>Promise()</code>
        * [.switchToParentFrame()](#Page+switchToParentFrame) ⇒ <code>Promise(boolean)</code>
        * [.uploadFile(selector, filename)](#Page+uploadFile) ⇒ <code>Promise()</code>
        * [.clearMemoryCache()](#Page+clearMemoryCache) ⇒ <code>Promise()</code>
        * [.waitForLoad()](#Page+waitForLoad) ⇒ <code>Promise()</code>
        * [.addLocalResource()](#Page+addLocalResource)
        * [.removeLocalResource(name)](#Page+removeLocalResource) ⇒ <code>boolean</code>
        * [.clearLocalResources()](#Page+clearLocalResources) ⇒ <code>boolean</code>
        * [.getLocalResource()](#Page+getLocalResource) ⇒ <code>object</code> &#124; <code>null</code>
        * [.renderPdf()](#Page+renderPdf) ⇒ <code>Promise(Buffer)</code>
        * [.openHtml(htmlString, templateRenderDir)](#Page+openHtml) ⇒ <code>Promise(string)</code>
        * [.renderHtml(htmlString, templateRenderDir)](#Page+renderHtml) ⇒ <code>Promise(Buffer)</code>
        * [.renderTemplate(template, templateRenderDir, options)](#Page+renderTemplate) ⇒ <code>Promise(Buffer)</code>
        * [.openTemplate(template, templateRenderDir, options)](#Page+openTemplate) ⇒ <code>Promise(string)</code>
        * [.onAlert(handler)](#Page+onAlert)
        * [.onCallback(handler)](#Page+onCallback)
        * [.onClosing(handler)](#Page+onClosing)
        * [.onConfirm(handler)](#Page+onConfirm)
        * [.onConsoleMessage(handler)](#Page+onConsoleMessage)
        * [.onFilePicker(handler)](#Page+onFilePicker)
        * [.onInitialized(handler)](#Page+onInitialized)
        * [.onLoadFinished(handler)](#Page+onLoadFinished)
        * [.onLoadStarted(handler)](#Page+onLoadStarted)
        * [.onNavigationRequested(handler)](#Page+onNavigationRequested)
        * [.onPageCreated(handler)](#Page+onPageCreated)
        * [.onPrompt(handler)](#Page+onPrompt)
        * [.onResourceError(handler)](#Page+onResourceError)
        * [.onResourceReceived(handler)](#Page+onResourceReceived)
        * [.onResourceRequested(handler)](#Page+onResourceRequested)
        * [.onResourceTimeout(handler)](#Page+onResourceTimeout)
        * [.onUrlChanged(handler)](#Page+onUrlChanged)
    * _static_
        * [.readOnlyProperties](#Page.readOnlyProperties) : <code>Array.&lt;string&gt;</code>
        * [.allowedSetProperties](#Page.allowedSetProperties) : <code>Array.&lt;string&gt;</code>
        * [.allowedGetProperties](#Page.allowedGetProperties) : <code>Array.&lt;string&gt;</code>
        * [.passProperties](#Page.passProperties) : <code>Array.&lt;string&gt;</code>
        * [.base64Formats](#Page.base64Formats) : <code>Array.&lt;string&gt;</code>
        * [.validRenders](#Page.validRenders) : <code>Array.&lt;string&gt;</code>

<a name="Page+isClosed"></a>

### page.isClosed() ⇒ <code>Promise(Boolean)</code>
*Wrapper-specific*

Tells you whether the page has ran `close` or not

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+setFn"></a>

### page.setFn(name, fn) ⇒ <code>Promise()</code>
*node-simple-phantom specific*

Sets a function. This function does not have the same scope. It works
similar to how evaluate does. It can return values and can therefore
be used for handlers such as `onConfirm` or `onPrompt`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the event ('onConfirm', etc) |
| fn | <code>function</code> | handler of the event |

<a name="Page+get"></a>

### page.get(name) ⇒ <code>Promise(value)</code>
*node-phantom-simple specific*

As all operations are done over HTTP, the setting and getting
of properties uses callbacks to indicate that they're set or to return
a value.
The name is checked against allowed properties and will throw a type error
if the name doesn't exist.

*Developer Note*: `paperSize.header.contents` and `paperSize.footer.contents` take
functions that are evaluated in PhantomJS, meaning they will not have
the context of where you are creating them. In addition, the HTML
returned by these functions are rendered in a HTML document outside
of the main document (the page itself) and will therefore not have access to
resources such as CSS and JS. In order to style HTML, you will have to
add the CSS inline, such as `<div style="font-size: 10px;"></div>`.

Another thing to keep in mind is that images are loaded async, so in
order to have an image in the footer/header, these are to be loaded
prior to rendering the footer/header. This can be done by adding the 
image to the main document and then setting the display to none.

Example: To set/get the value paperSize.width you would do the following:

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the property |

**Example**  
```js
page.set('paperSize.width', '50px')
  .then((result) => {// result is true or false depending on success});
page.get('paperSize.width')
  .then((value) => // value of paperSize.width);
```
<a name="Page+set"></a>

### page.set(name, value) ⇒ <code>Promise()</code>
*node-phantom-simple specific*

As all operations are done over HTTP, the setting and getting
of properties uses callbacks to indicate that they're set or to return
a value
Will check the name against allowed properties. Throws error if the
property doesn't exist or if it's a read only value.

*Developer Note*: `paperSize.header.contents` and `paperSize.footer.contents` take
functions that are evaluated in PhantomJS, meaning they will not have
the context of where you are creating them. In addition, the HTML
returned by these functions are rendered in a HTML document outside
of the main document (the page itself) and will therefore not have access to
resources such as CSS and JS. In order to style HTML, you will have to
add the CSS inline, such as `<div style="font-size: 10px;"></div>`.

Another thing to keep in mind is that images are loaded async, so in
order to have an image in the footer/header, these are to be loaded
prior to rendering the footer/header. This can be done by adding the 
image to the main document and then setting the display to none.

Example: To set/get the value paperSize.width you would do the following:

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the property |
| value | <code>anything</code> | value of the property |

**Example**  
```js
page.set('paperSize.width', '50px')
  .then((result) => {// result is true or false depending on success});
page.get('paperSize.width')
  .then((value) => // value of paperSize.width);
```
<a name="Page+evaluate"></a>

### page.evaluate(fn) ⇒ <code>Promise(StringifiableValue)</code>
[evaluate](http://phantomjs.org/api/webpage/method/evaluate.html)

Evaluates the given function in the context of the web page. The execution
is sandboxed. Any extra arguments to this function will be sent to the sandboxed
function in the same order. These arguments has to be serializeable!

The function can also return value. However, this functionality is still a
bit unstable and can therefore cause undefined returns. The return value
has to be JSON.stringifiable.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | function to be evaluated |

**Example**  
```js
page.evaluate(function(name, id) {
  document.body.setAttribute('name', name);
  document.body.setAttribute('id', id);
  return document.getElementById('my-div').textContent;
}, 'name-of-body', 'id-of-body').then((textContent) => {
  // do something with text content
});
```
<a name="Page+waitForSelector"></a>

### page.waitForSelector(selector, timeout) ⇒ <code>Promise()</code>
*node-phantom-simple specific*

Uses page.evaluate in order select an element on the page to
see if it exists. This operation is performed every 150 ms until it
reaches the timeout limit. If the limit is exceeded, an error is thrown.
If an element is found prior to this, the function returns, indicating
that the element has been rendered.
The selector is a selector accepted by document.querySelectorAll.
This can be useful when an element has to be active, but is appended by Javascript
and doesn't exist at pageload.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | selector such as '.myclass' or '#myid' |
| timeout | <code>number</code> | How long to wait at maxmium before throwing error, 10 seconds is default |

**Example**  
```js
page.open(somePage)
  .then(() => page.waitForSelector('.select'))
  .then(() => {
    // ready to do something as the whole page is now rendered
  });
```
<a name="Page+addCookie"></a>

### page.addCookie(options) ⇒ <code>Promise(Boolean)</code>
[addCookie](http://phantomjs.org/api/webpage/method/add-cookie.html)

Adds a cookie to the webpage. Settings can be seen below. Some are required

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Boolean)</code> - true if successful, false if not  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| options.name | <code>string</code> |  | A valid cookie name |
| options.value | <code>string</code> |  | A cookie value |
| options.path | <code>string</code> |  | The path of the cookie |
| options.domain | <code>string</code> | <code>&quot;string&quot;</code> | The domain of the cookie |
| options.httponly | <code>boolean</code> | <code>false</code> | Whether to use HTTP only. |
| options.secure | <code>boolean</code> | <code>false</code> | Whether it should be secure or not |
| options.expires | <code>Number</code> |  | Number of miliseonds given                                                     with Date.now / Date.getTime                                                      it should be valid |

<a name="Page+clearCookies"></a>

### page.clearCookies() ⇒ <code>Promise(boolean)</code>
[clearCookie](http://phantomjs.org/api/webpage/method/clear-cookies.html)

Deletes all the cookies visible to the current URL.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+close"></a>

### page.close() ⇒ <code>Promise()</code>
[close](http://phantomjs.org/api/webpage/method/close.html)

Closes the page and releases the memory heap associated with it. Do
not use the page instance after calling this.

Due to some technical limitations, the page object might not be completely
garbage collected. This is often encountered when the same object is used
over and over again. Calling this function may stop the increasing
heap allocation

*Developer note*: Calling this function will lock down all the other
functions, causing them to throw errors if they are used.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+deleteCookie"></a>

### page.deleteCookie(name) ⇒ <code>Promise(Boolean)</code>
[deletCookie](http://phantomjs.org/api/webpage/method/delete-cookie.html)

Delete any Cookies visible to the current URL with a name that matches
the argument.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Boolean)</code> - true if successful, false if not.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Cookie name |

<a name="Page+getCookie"></a>

### page.getCookie(name) ⇒ <code>Promise(object)</code>
*Wrapper Specific*

Retrives a cookie by a name. Returns undefined if none is found.
Name is not case-sensitive

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(object)</code> - object of same type as can be found in `addCookie` documentation  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="Page+evaluateJavaScript"></a>

### page.evaluateJavaScript(javaScriptStr) ⇒ <code>Promise()</code>
[evaluateJavaScript](http://phantomjs.org/api/webpage/method/evaluate-java-script.html)

Evaluate a function as a string. Evaluates the given function string in the context
of the webpage. It is very familiar with `evaluate`.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| javaScriptStr | <code>string</code> | 

<a name="Page+evaluateAsync"></a>

### page.evaluateAsync(fn, num, args) ⇒ <code>Promise()</code>
[evaulateAsync](http://phantomjs.org/api/webpage/method/evaluate-async.html)

Evaulates a given function in the context of the webpage without blocking
the current execution (Phantom process - not Node). Unlike `evaluate`, this
function cannot take any arguments and will not return any values.

*Developer Note*: It seems like the signature of the function is wrong according
to [this](http://stackoverflow.com/questions/22474525/how-we-can-use-evaluateasync-in-phantomjs) stackoverflow
question. I cannot find any sources to back it up, so I will have to check this later.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Todo**

- [ ] Make sure to throughly test this function


| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to be evaluated |
| num | <code>number</code> | number of miliseconds to wait until the function should run |
| args | <code>args</code> | arguments to send |

<a name="Page+getPage"></a>

### page.getPage(windowName) ⇒ <code>Promise(Page)</code> &#124; <code>Promise(null)</code>
[getPage](http://phantomjs.org/api/webpage/method/get-page.html)

Does not work properly due to an issue with node-phantom-simple
[issue](https://github.com/baudehlo/node-phantom-simple/issues/131)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Returns a Child Page that matches the given "window.name".
This utility method is faster than accessing the
"windowName" property of every "page.pages"
and try to match.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Page)</code> &#124; <code>Promise(null)</code> - Returns the page that matches 'window.name'
                                       or null if none is found  

| Param | Type |
| --- | --- |
| windowName | <code>string</code> | 

<a name="Page+go"></a>

### page.go(historyRelativeIndex) ⇒ <code>Promise(boolean)</code>
[go](http://phantomjs.org/api/webpage/method/go.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Go to the page identified by its relative location to the current page.
For example '-1' for the previous page or 1 for the next page.

Modelled after JavaScript "window.go(num)" method:
{@see https://developer.mozilla.org/en-US/docs/DOM/window.history#Syntax}.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(boolean)</code> - true if it goes forward/backward in Navigation History, false otherwise  

| Param | Type |
| --- | --- |
| historyRelativeIndex | <code>number</code> | 

<a name="Page+goBack"></a>

### page.goBack() ⇒ <code>Promise(boolean)</code>
[goBack](http://phantomjs.org/api/webpage/method/go-back.html)


*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Goes back in the Navigation History

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(boolean)</code> - true if it does go back in Navigation History, false otherwise  
<a name="Page+goForward"></a>

### page.goForward() ⇒ <code>Promise(boolean)</code>
[goForward](http://phantomjs.org/api/webpage/method/go-forward.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Goes forward in the Navigation History

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(boolean)</code> - true if goes forward in Navigation History, false otherwise  
<a name="Page+includeJs"></a>

### page.includeJs(url) ⇒ <code>Promise()</code>
[includeJs](http://phantomjs.org/api/webpage/method/include-js.html)

Includes external script from specified URL, usually remote location on the
page and executes the callback upon completion.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The url to retrieve the JS from |

<a name="Page+injectJs"></a>

### page.injectJs(filename) ⇒ <code>Promise()</code>
[injectJs](http://phantomjs.org/api/webpage/method/inject-js.html)

Injects external script code from specified file into the page
like (`includeJs`, except the file does not need to be accessible from hosted
page).

If File cannot be found in the current directory, the libraryPath (state
in PhantomJS) is used for additional lookup.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise()</code> - true if successful, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | filename to inject |

<a name="Page+open"></a>

### page.open(url, methodOrSettings, data) ⇒ <code>Promise(string)</code>
[open](http://phantomjs.org/api/webpage/method/open.html)

Opens the URL and loads it to the page. Once the page is loaded the promise function
is invoked. In addition, the page.onLoadFinished will also be called.
Will give a status in the form of 'success' or 'fail' string

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(string)</code> - status of the load, either 'success' or 'fail'  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL to do the request towards. Can be local file |
| methodOrSettings | <code>string</code> &#124; <code>object</code> | The method as a string or a settings object |
| settings.operation | <code>string</code> | The type of method - POST / GEt |
| settings.encoding | <code>encoding</code> | The encoding to use |
| settings.headers | <code>object</code> | An object with headers |
| settings.data | <code>string</code> | Stringified data (JSON etc) |
| data | <code>string</code> | Only used when methodOrSettings is a string |

<a name="Page+openUrl"></a>

### page.openUrl(url, httpConf, settings) ⇒ <code>Promise()</code>
[openUrl](http://phantomjs.org/api/webpage/method/open-url.html)

*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| httpConf | <code>httpConf</code> | 
| settings | <code>settings</code> | 

<a name="Page+reload"></a>

### page.reload() ⇒ <code>Promise()</code>
[reload](http://phantomjs.org/api/webpage/method/reload.html)

*Developer Note*: Performs a reload of the page.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+render"></a>

### page.render(filename, format, quality) ⇒ <code>Promise()</code>
[render](http://phantomjs.org/api/webpage/method/render.html)

Renders the webpage to an image buffer and saves it as the specified
filename. Currently the ouput format is automatically set based on the file
extension.

*Developer Note*: Sadly, due to how PhantomJS handles PDF rendering, the
PDF needs to be saved to a file. This wrapper does however include `renderPdf`
which gives the PDF back as a buffer

*Another Developer Note*: PhantomJS says to support `GIF` images, however,
the documentation on
[Qt ImageWriter](http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats)
does not include `GIF`.
Use with caution.
There is also an issue on [this](https://github.com/ariya/phantomjs/issues/13135)

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filename | <code>string</code> |  | Where to save the file. |
| format | <code>string</code> | <code>&quot;png&quot;</code> | If format is not specified, the file extension                             is extracted and used as the format. |
| quality | <code>number</code> | <code>100</code> | String or number value between 0 and 100 |

<a name="Page+renderBase64"></a>

### page.renderBase64(format) ⇒ <code>Promise(string)</code>
[renderBase64](http://phantomjs.org/api/webpage/method/render-base64.html)

Renders the webpage to an image buffer and returns the result as a
Base64-encoded string representation of that image.

*Developer Note*: PhantomJS says to support `GIF` images, however,
the documentation on
[Qt ImageWriter](http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats)
does not include `GIF`.
Use with caution.
There is also an issue on [this](https://github.com/ariya/phantomjs/issues/13135)

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(string)</code> - base64-encoded string  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| format | <code>string</code> | <code>&quot;png&quot;</code> | Either 'png', 'gif' or 'jpeg' |

<a name="Page+sendEvent"></a>

### page.sendEvent() ⇒ <code>Promise()</code>
[sendEvent](http://phantomjs.org/api/webpage/method/send-event.html)

The events are not synthetic DOM events, each event is sent to the web page
as if it comes as part of user interaction.

Mouse events

`sendEvent(mouseEventType[, mouseX, mouseY, button='left'])`

The first argument is the event type. Supported types are:
'mouseup', 'mousedown', 'mousemove', 'doubleclick' and 'click'.
The next two arguments are optional but represent the mouse position
for the event.

The button parameter (defaults to left) specifies the button to push.
For 'mousemove', however, there is no button pressed (i.e. it is not dragging).

Keyboard events
sendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])
The first argument is the event type. The supported types are:
keyup, keypress and keydown.
The second parameter is a key (from page.event.key), or a string.
You can also indicate a fifth argument, which is an integer indicating
the modifier key.

- 0: No modifier key is pressed
- 0x02000000: A Shift key on the keyboard is pressed
- 0x04000000: A Ctrl key on the keyboard is pressed
- 0x08000000: An Alt key on the keyboard is pressed
- 0x10000000: A Meta key on the keyboard is pressed
- 0x20000000: A keypad button is pressed
Third and fourth argument are not taken account for keyboard events.
Just give null for them.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+setContent"></a>

### page.setContent(content, url) ⇒ <code>Promise()</code>
[setContent](http://phantomjs.org/api/webpage/method/set-content.html)

Allows to set both page.content and page.url properties. The webpage
will be reloaded with new content and the current location set as the given
url, without any actual http request being made.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | The HTML content of the webpage |
| url | <code>string</code> | The URL of the webpage |

<a name="Page+stop"></a>

### page.stop() ⇒ <code>Promise()</code>
[stop](http://phantomjs.org/api/webpage/method/stop.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Stops loading page (if the page is loading)

NOTE: This method does nothing when page is not actually loading.
It's effect can be applied in that very short window of time between
"onLoadStarted" and "onLoadFinished".

*Another Developer Note*: This function may not work properly, as the short
time in between these two events may be missed due to events being polled
by node-phantom-simple

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToFocusedFrame"></a>

### page.switchToFocusedFrame() ⇒ <code>Promise()</code>
[switchToFocusedFrame](http://phantomjs.org/api/webpage/method/switch-to-focused-frame.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Switches to the currently focused frame, as per QWebPage. This is the frame whose
window element was last focus()ed, and is currently the target of key events.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToFrame"></a>

### page.switchToFrame(framePosition) ⇒ <code>Promise(boolean)</code>
[switchToFrame](http://phantomjs.org/api/webpage/method/switch-to-frame.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Switches focus from the Current Frame to a Child Frame, identified by it positional order.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(boolean)</code> - true if the frame was found, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| framePosition | <code>number</code> | Position of the Frame isnide the Child Frames Array (i.e "window.frames[i]") |

<a name="Page+switchToMainFrame"></a>

### page.switchToMainFrame() ⇒ <code>Promise()</code>
[switchToMainFrame](http://phantomjs.org/api/webpage/method/switch-to-main-frame.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Switches focus to the Main Frame within this Page.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToParentFrame"></a>

### page.switchToParentFrame() ⇒ <code>Promise(boolean)</code>
[switchToParentFrame](http://phantomjs.org/api/webpage/method/switch-to-parent-frame.html)

*Developer Note*: Above link contains no information.
This is taken from [PhantomJS source code comments](https://github.com/ariya/phantomjs/blob/master/src/webpage.h)

Switches focus to the Parent Frame of the Current Frame (if it exists).

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(boolean)</code> - true if the Current Frame is not a Main Frame,
                            false otherwise (i.e. there is no parent frame to switch to)  
<a name="Page+uploadFile"></a>

### page.uploadFile(selector, filename) ⇒ <code>Promise()</code>
[uploadFile](http://phantomjs.org/api/webpage/method/upload-file.html)

Updates the specified file (filename) to the form element associated with
selector. This function is used to automate the upload of a file, which is
usually handled with a file dialog in a traditional browser. Since there
is no dialog in this headless mode, such an upload mechanism is handled
via this special function instead

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| selector | <code>string</code> | 
| filename | <code>string</code> | 

<a name="Page+clearMemoryCache"></a>

### page.clearMemoryCache() ⇒ <code>Promise()</code>
*Developer Note*: There is little to no documentation on this function,
but from what I can gather from an [issue](https://github.com/ariya/phantomjs/issues/10357)
on their github, this function clears the HTTP-cache.
[Commit](https://github.com/ariya/phantomjs/commit/5768b705a019da719fa356fdbf370f3ea72b4c93)

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+waitForLoad"></a>

### page.waitForLoad() ⇒ <code>Promise()</code>
*Wrapper Specific*

Waits for the page to be loaded before
fulfilling the promise.

Will reject the promise if the time for the page
to load takes more than specified by `timeout`, which
defaults to 20 seconds (20 000 milliseocnds)

**Kind**: instance method of <code>[Page](#Page)</code>  
**Params**: <code>number</code> [timeout=20000] time to wait before rejecting  
**Example**  
```js
let page = yield phantom.createPage();
let status = yield page.open('http://www.google.com');

yield page.waitForLoad();
yield page.render('./google.pdf');
```
<a name="Page+addLocalResource"></a>

### page.addLocalResource()
*Wrapper Specific*

Adds a local resource for use in pages that are rendered
using temporary files. As they pages themselves are
located within the temp directories of the operating
system (/tmp etc), including images, fonts and other
resources can be tricky.

If you need a local resource to be available, be it font,
image, css or javascript, you can add these using this 
function. All files located within the local resource
storage of this page will be available when the page
is loaded.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Params**: <code>object</code> options  
**Params**: <code>string</code> options.name Unique name, used for retrieval/removal  
**Params**: <code>buffer</code> options.content A buffer of the file content  
**Params**: <code>string</code> options.filename Full filename and directory of
                                  the file as it should be stored
                                  in the temporary directory in
                                  order to be retrievable by the page  
**Example**  
```js
let page = yield phantom.createPage();
let css  = 'body {background-color: #ccc;}';
let html = '' +
  '<html>' +
    '<head>' +
      '<title>Title</title>' +
      '<link rel="stylesheet" href="css/my-css-file.css">' +
    '</head>' +
  '</html>';

let cssBuffer = new Buffer(css);

page.addLocalResource({
  name    : 'mycssfile',
  filename: 'css/my-css-file.css',
  content : cssBuffer
});

let status = yield page.openHtml(html);
```
<a name="Page+removeLocalResource"></a>

### page.removeLocalResource(name) ⇒ <code>boolean</code>
*Wrapper Specific*

Removes a localresource by name. Returns true if removed,

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>boolean</code> - true if removed, false if not found  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the name of the resource to remove |

<a name="Page+clearLocalResources"></a>

### page.clearLocalResources() ⇒ <code>boolean</code>
*Wrapper Specific*

Removes all resouces within the resource-list

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>boolean</code> - returns true if some were removed, otherwise false  
<a name="Page+getLocalResource"></a>

### page.getLocalResource() ⇒ <code>object</code> &#124; <code>null</code>
*Wrapper Specific*

Retrieves a resource from the resource-list by name, if it exists.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>object</code> &#124; <code>null</code> - null if no resource was found,
                       otherwise the resource  
**Params**: <code>string</code> name the name of the resource  
<a name="Page+renderPdf"></a>

### page.renderPdf() ⇒ <code>Promise(Buffer)</code>
*Wrapper Specific*

Renders a PDF and returns the content as a buffer. Due to PhantomJS
this function has to save a file to disk.
This wrapper uses [node-tmp](https://github.com/raszi/node-tmp) to do
this. This saves a temporary file (in memory or file, depending on OS), which
is deleted after it is completed or throws an error.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Buffer)</code> - buffer  
<a name="Page+openHtml"></a>

### page.openHtml(htmlString, templateRenderDir) ⇒ <code>Promise(string)</code>
*Wrapper Specific*

Uses a HTML string to open a webpage. If templateRenderDir
is undefined, a temporary file is created to store the HTML.
Use templateRenderDir if the HTML code includes scripts that has to be
retrieved from file, as PhantomJS will look relative to the save location
for these files if they are local ones.

*Note* Do not use .openHtml and then .renderHtml, as renderHtml opens the
template again. If you need to render after using .openHtml,
use .renderPdf, .render or .renderBase64

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(string)</code> - either success or fail  

| Param | Type | Description |
| --- | --- | --- |
| htmlString | <code>string</code> | String to render |
| templateRenderDir | <code>string</code> | Where to save the HTML file (optional) |

**Example**  
```js
let htmlString = '<html><head></head><body>This is a body</body></html>';
page.openHtml(htmlString)
  .then(() => page.evaluate(function() {return document.body.textContent;}))
  .then((textContent) => // textContent === 'This is a body')
```
<a name="Page+renderHtml"></a>

### page.renderHtml(htmlString, templateRenderDir) ⇒ <code>Promise(Buffer)</code>
*Wrapper Specific*

Renders a HTML string to a PDF by saving the HTML as a temporary file,
in the directory specified as `templateRenderDir` (this is nessassary
due to possible Javascript or CSS files that will be included) before it
uses `renderPdf` to save the PDF as a temporary file, loading it and then
returning the Buffer

If you are sure that the HTML file does not request any JavaScript or
CSS files, you can omit the templateRenderDir. The file will then
be saved in a temporary directory and rendered like that.

Will throw error if the page fails to open. Sadly, due to lack of error
message from phantomJS, the exact reason why this happened is not known.

*Note* Do not use .openHtml and then .renderHtml, as renderHtml opens the
template again. If you need to render after using .openHtml,
use .renderPdf, .render or .renderBase64

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Buffer)</code> - PDF  

| Param | Type | Description |
| --- | --- | --- |
| htmlString | <code>string</code> | the HTML string |
| templateRenderDir | <code>string</code> | directory to save the temp HTML file |

**Example**  
```js
let htmlString = '<html><head></head><body>This is a body</body></html>';
page.renderHtml(htmlString)
  .then((pdf) => // pdf now contains the rendered version of the htmlstring)
```
<a name="Page+renderTemplate"></a>

### page.renderTemplate(template, templateRenderDir, options) ⇒ <code>Promise(Buffer)</code>
*Wrapper Specific*

Expects a template that has a .render function that takes the options
sent to it. A structure of such an example can be seen
at [reewr-template](https://github.com/Reewr/reewr-template).

This function will render the the template into a PDF and returns the
content as a Buffer

If templateRenderDir is omitted, the HTML file will be saved in a temporary
directory (memory or file depending on OS). If the HTML file / template
has any includes such as CSS or JS files that are local files, you should
specify a templateRenderDir so that it can correctly load these. Remember
to specify the location of these CSS and JS files relative to the templateRenderDir

Will throw error if the page fails to open. Sadly, due to lack of error
message from phantomJS, the exact reason why this happened is not known.

*Note* Do not use .openTemplate and then .renderTemplate, as renderTemplate opens the
template again. If you need to render after using .openTemplate,
use .renderPdf, .render or .renderBase64

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(Buffer)</code> - PDF  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>object</code> | template object with a .render function |
| templateRenderDir | <code>string</code> | Where to render the html file |
| options | <code>object</code> | options that should be sent to the .render function |

<a name="Page+openTemplate"></a>

### page.openTemplate(template, templateRenderDir, options) ⇒ <code>Promise(string)</code>
*Wrapper Specific*

Expects a template that has a .render function that takes the options
sent to it. A structure of such an example can be seen
at [reewr-template](https://github.com/Reewr/reewr-template).

This function will render the template, save the file and open it.
After this has completed, the page should be ready and can be run evaluations
on.

If templateRenderDir is omitted, the HTML file will be saved in a temporary
directory (memory or file depending on OS). If the HTML file / template
has any includes such as CSS or JS files that are local files, you should
specify a templateRenderDir so that it can correctly load these. Remember
to specify the location of these CSS and JS files relative to the templateRenderDir

*Note* Do not use .openTemplate and then .renderTemplate, as renderTemplate opens the
template again. If you need to render after using .openTemplate,
use .renderPdf, .render or .renderBase64

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise(string)</code> - status that is either fail or success  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>object</code> | template object with a .render function |
| templateRenderDir | <code>string</code> | Where to render the html file |
| options | <code>object</code> | options that should be sent to the .render function |

**Example**  
```js
let template = {
  render: function(options) {
    return jade.render(options); // jade used as an example
  }
};
page.openTemplate(template, {pretty: true})
  .then(() => // do something with the open page)
  .then(() => page.renderPdf())
  .then((pdf) => // rendered pdf)
```
<a name="Page+onAlert"></a>

### page.onAlert(handler)
[onAlert](http://phantomjs.org/api/webpage/handler/on-alert.html)

This callback is invoked when there is a JavaScript alert on the web page.
The only argument passed to the callback is the string for the message.
There is no return value expected from the callback handler.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message) {}` |

<a name="Page+onCallback"></a>

### page.onCallback(handler)
[onCallback](http://phantomjs.org/api/webpage/handler/on-callback.html)

**Note**: THIS HANDLER IS EXPERIMENTAL
Introduced: PhantomJS 1.6 This callback is invoked when there is a
JavaScript window.callPhantom call made on the web page.
The only argument passed to the callback is a data object.

Note: window.callPhantom is still an experimental API.
In the near future, it will be likely replaced with a
message-based solution which will still provide the same functionality.

Although there are many possible use cases for this inversion of control,
the primary one so far is to prevent the need for a PhantomJS script
to be continually polling for some variable on the web page.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(object) {}` |

<a name="Page+onClosing"></a>

### page.onClosing(handler)
[onClosing](http://phantomjs.org/api/webpage/handler/on-closing.html)

This callback is invoked when the WebPage object is being closed,
either via page.close in the PhantomJS outer space or via window.close
in the page's client-side.

It is not invoked when child/descendant pages are being closed unless you
also hook them up individually. It takes one argument, closingPage,
which is a reference to the page that is closing.
Once the onClosing handler has finished executing (returned),
the WebPage object closingPage will become invalid.

*Developer note*: The page you get through this handler will already be invalid,
as the onClosing handler in PhantomJS has already returned. This is, again, due to
the async nature of node-phantom-simple.

If you need to do something special with teh closingPage, this should
be done through .setFn

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(closingPage) {}` |

<a name="Page+onConfirm"></a>

### page.onConfirm(handler)
[onConfirm](http://phantomjs.org/api/webpage/handler/on-confirm.html)

This callback is invoked when there is a JavaScript confirm on the web page.
The only argument passed to the callback is the string for the message.

The return value of the callback handler can be either true or false,
which are equivalent to pressing the "OK" or "Cancel" buttons
presented in a JavaScript confirm, respectively.

*Developer Note*: This function cannot return values due to the async driver
nature of node-phantom-simple. If you need to return a value, please use
`page.setFn('onConfirm', function() {});`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message) {}` |

<a name="Page+onConsoleMessage"></a>

### page.onConsoleMessage(handler)
[onConsoleMessage](http://phantomjs.org/api/webpage/handler/on-console-message.html)

This callback is invoked when there is a JavaScript console message on
the web page. The callback may accept up to three arguments:

- the string for the message,
- the line number,
- and the source identifier.

By default, console messages from the web page are not displayed.
Using this callback is a typical way to redirect it.

Note: line number and source identifier are not used yet,
at least in phantomJS <= 1.8.1. You receive undefined values.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message, lineNumber, sourceId) {}` |

<a name="Page+onFilePicker"></a>

### page.onFilePicker(handler)
[onFilePicker](http://phantomjs.org/api/webpage/handler/on-file-picker.html)

*Developer Note*: No documentation, but it expects a return value, therefore
you will need to use .setFn if you are to return any values

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | Handler `function(oldFile) {}` |

<a name="Page+onInitialized"></a>

### page.onInitialized(handler)
[onInitialized](http://phantomjs.org/api/webpage/handler/on-initialized.html)

This callback is invoked after the web page is created but before a URL is loaded. The callback
may be used to change global objects

*Developer Note*: Due to the async nature of node-phantom-simple, this call will
most likely not be set in time, before the page is already initialized. Therefore
it is suggested to not use this function and instead assume that the page
is already initialize when recieved through a promise.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function() {}` |

<a name="Page+onLoadFinished"></a>

### page.onLoadFinished(handler)
[onLoadFinished](http://phantomjs.org/api/webpage/handler/on-load-finished.html)

This callback is invoked when the page finishes the loading. It may accept a single argument
indicating the page's status: 'success' if no network error occured, otherwise 'fail'.

Also see `page.open` for an alternate hook for the `onLoadFinished` callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(status) {}` |

<a name="Page+onLoadStarted"></a>

### page.onLoadStarted(handler)
[onLoadStarted](http://phantomjs.org/api/webpage/handler/on-load-started.html)

This callback is invoked when the page sarts the loading. There is no argument
passed to the callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function() {}` |

<a name="Page+onNavigationRequested"></a>

### page.onNavigationRequested(handler)
[onNavigationRequested](http://phantomjs.org/api/webpage/handler/on-navigation-requested.html)

By implementing this callback, you will be notified when a navigation
event happens and know if it will be blocked (by `page.navigationLocked`)

**Arguments to the callback**
- `url`: The target URL of this navigation event
- `type`: Possible values include:
  - 'Undefined'
  - 'LinkClicked'
  - 'FormSubmitted'
  - 'BackOrForward'
  - 'Reload'
  - 'FormResubmitted'
  - 'Other'
- `willNavigate`: true if navigation will happen, false if it is locked
- `main`: true if this event comes from the main frame, false if it comes from an iframe of some other sub-frame

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(url, type, willNavigate, main) {}` |

<a name="Page+onPageCreated"></a>

### page.onPageCreated(handler)
[onPageCreated](http://phantomjs.org/api/webpage/handler/on-page-created.html)

This callback is invoked when a new child window
(but not deeper descendant windows) is created by the page,
 e.g. using `window.open`.

In the PhantomJS outer space, this `WebPage` object will not yet have
called its own `page.open` method yet and thus does
not yet know its requested URL (`page.url`).

Therefore, the most common purpose for utilizing a `page.onPageCreated` callback
is to decorate the page (e.g. hook up callbacks, etc.).

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(newPage) {}` |

<a name="Page+onPrompt"></a>

### page.onPrompt(handler)
[onPrompt](http://phantomjs.org/api/webpage/handler/on-prompt.html)

This callback is invoked when there is a JavaScript `prompt` on the webpage.
The arguments passed to the callback are the string of the message and the
default value for the prompt answer. The return value of the callback handler
should be a string

*Developer Note*: This function cannot return values due to the async driver
nature of node-phantom-simple. If you need to return a value, please use
`page.setFn('onPrompt', function() {});`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(msg, defaultVal) {}` |

<a name="Page+onResourceError"></a>

### page.onResourceError(handler)
[onResourceError](http://phantomjs.org/api/webpage/handler/on-resource-error.html)

This callback is invoked when a web page was unable to load resource.
The only argument to the callback is the `resourceError` metadata object.

The `resourceError` metadata object contains these properties:
 - `ìd`: the number of the request
 - `url`: the resource url
 - `errorCode`: the [errorCode](http://doc.qt.io/qt-4.8/qnetworkreply.html#NetworkError-enum)
 - `errorString`: The error description

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(resourceError) {}` |

<a name="Page+onResourceReceived"></a>

### page.onResourceReceived(handler)
[onResourceReceived](http://phantomjs.org/api/webpage/handler/on-resource-received.html)

This callback is invoked when a resource requested by the page is received.
The only argument to the callback is the response metadata object.

If the resource is large and sent by the server in multiple chunks,
onResourceReceived will be invoked for every chunk received by PhantomJS.

The response metadata object contains these properties:
- `id` : the number of the requested resource
- `url` : the URL of the requested resource
- `time` : Date object containing the date of the response
- `headers` : list of http headers
- `bodySize` : size of the received content decompressed (entire content or chunk content)
- `contentType` : the content type if specified
- `redirectURL` : if there is a redirection, the redirected URL
- `stage` : "start", "end" (FIXME: other value for intermediate chunk?)
- `status` : http status code. ex: 200
- `statusText` : http status text. ex: OK

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(response) {}` |

<a name="Page+onResourceRequested"></a>

### page.onResourceRequested(handler)
[onResourceRequested](http://phantomjs.org/api/webpage/handler/on-resource-requested.html)

This callback is invoked when the page requests a resource.
he first argument to the callback is the requestData metadata object.
The second argument is the networkRequest object itself.

The requestData metadata object contains these properties:
- id : the number of the requested resource
- method : http method
- url : the URL of the requested resource
- time : Date object containing the date of the request
- headers : list of http headers

*Developer Note*: Currently, the networkRequest object does not contain any functions.
This is due to an implementation issue in node-phantom-simple. An issue
has been created regarding [this](https://github.com/baudehlo/node-phantom-simple/issues/98)

Due to the asynchronous nature of node-phantom-simple, impelementing these functions
are simply too difficult. The networkRequest object is therefore an empty object

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(requestData, networkRequest) {}` |

<a name="Page+onResourceTimeout"></a>

### page.onResourceTimeout(handler)
[onResourceTimeout](http://phantomjs.org/api/webpage/handler/on-resource-timeout.html)

This callback is invoked when a resource requested by the page timeout
according to settings.resourceTimeout.
The only argument to the callback is the request metadata object.

The request metadata object contains these properties:
- id: the number of the requested resource
- method: http method
- url: the URL of the requested resource
- time: Date object containing the date of the request
- headers: list of http headers
- errorCode: the error code of the error
- errorString: text message of the error

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(request) {}` |

<a name="Page+onUrlChanged"></a>

### page.onUrlChanged(handler)
[onUrlChanged](http://phantomjs.org/api/webpage/handler/on-url-changed.html)

This callback is invoked when the URL changes, e.g. as it navigates
away from the current URL.
The only argument to the callback is the new targetUrl string.

To retrieve the old URL, use the onLoadStarted callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(targetUrl) {}` |

<a name="Page.readOnlyProperties"></a>

### Page.readOnlyProperties : <code>Array.&lt;string&gt;</code>
A list of settings that should not be sent through `set` as they are
read-only variables

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.allowedSetProperties"></a>

### Page.allowedSetProperties : <code>Array.&lt;string&gt;</code>
A list of all the variables that can be used in .set function.

**Kind**: static property of <code>[Page](#Page)</code>  
**Todo**

- [ ] Add typecheck and check before sending the options to PhantomJS to optimize

<a name="Page.allowedGetProperties"></a>

### Page.allowedGetProperties : <code>Array.&lt;string&gt;</code>
A list of all the variables that can be retrieved through .get
These also include any readOnly variables

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.passProperties"></a>

### Page.passProperties : <code>Array.&lt;string&gt;</code>
A list of settings that are undocumented in type and should therefore
not be type-checked when that is implemented in the future

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.base64Formats"></a>

### Page.base64Formats : <code>Array.&lt;string&gt;</code>
A list of allowed formats for the base64 format

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.validRenders"></a>

### Page.validRenders : <code>Array.&lt;string&gt;</code>
A list of allowed formats for the render function

**Kind**: static property of <code>[Page](#Page)</code>  
