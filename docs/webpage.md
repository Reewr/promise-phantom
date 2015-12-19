<a name="Page"></a>
## Page
The Page object contains most of the functionality of PhantomJS and it iswhat you will be interacting with the most of the time when using this wrapper.This wrapper does not contain functions that has been marked by PhantomJS asdeprecated. If you really need the functionality of these functions, they canbe retrieved through page.page.deprecatedFunction(callback), but I wouldadvise you not to do that.The following functions have been declared deprecated by PhantomJS:- childFramesCount- childFramesName- currentFrameName- release (use close instead)- switchToChildFrameIn addition to all the functions mentioned by the PhantomJS API, this wrapperalso contains some utility functions that makes it easier to use productionwhere you would need to create PDF reports.The added functions are:- getCookie- renderPdf,- renderTemplate- renderHtmlAll functions that are part of PhantomJS' API include the documentationfrom their webpage. Comments outside of the PhantomJS docs will include a*Developer Note*-tag. In addition, all functions that can be found in theAPI also have links to the respective pages.The full documentation for the PhanomJS page can be found at [here](http://phantomjs.org/api/webpage/)

**Kind**: global class  

* [Page](#Page)
    * _instance_
        * [.isClosed()](#Page+isClosed)
        * [.throwIfClosed()](#Page+throwIfClosed)
        * [.setFn(name, fn)](#Page+setFn)
        * [.get(name)](#Page+get)
        * [.set(name, value)](#Page+set)
        * [.evaluate(fn)](#Page+evaluate) ⇒ <code>object</code> &#124; <code>string</code> &#124; <code>number</code> &#124; <code>date</code>
        * [.addCookie(options)](#Page+addCookie)
        * [.clearCookies()](#Page+clearCookies)
        * [.close()](#Page+close)
        * [.deleteCookie(name)](#Page+deleteCookie)
        * [.getCookie(name)](#Page+getCookie)
        * [.evaluateJavaScript(javaScriptStr)](#Page+evaluateJavaScript)
        * [.evaluateAsync(fn)](#Page+evaluateAsync)
        * [.getPage(windowName)](#Page+getPage)
        * [.go()](#Page+go)
        * [.goBack()](#Page+goBack)
        * [.goForward()](#Page+goForward)
        * [.includeJs()](#Page+includeJs)
        * [.injectJs(filename)](#Page+injectJs)
        * [.open(url, methodOrSettings, data)](#Page+open)
        * [.openUrl(url, httpConf, settings)](#Page+openUrl)
        * [.reload()](#Page+reload)
        * [.render(filename, format, quality)](#Page+render)
        * [.renderBase64(format)](#Page+renderBase64)
        * [.sendEvent()](#Page+sendEvent)
        * [.setContent(content, url)](#Page+setContent)
        * [.stop()](#Page+stop)
        * [.switchToFocusedFrame()](#Page+switchToFocusedFrame)
        * [.switchToFrame()](#Page+switchToFrame)
        * [.switchToMainFrame()](#Page+switchToMainFrame)
        * [.switchToParentFrame()](#Page+switchToParentFrame)
        * [.uploadFile(selector, filename)](#Page+uploadFile)
        * [.clearMemoryCache()](#Page+clearMemoryCache)
        * [.renderPdf()](#Page+renderPdf)
        * [.renderHtml(htmlString, templateRenderDir)](#Page+renderHtml)
        * [.renderTemplate(template, templateRenderDir, options)](#Page+renderTemplate)
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
        * [.readOnlyProperties](#Page.readOnlyProperties) : <code>Arrays(string)</code>
        * [.allowedSetProperties](#Page.allowedSetProperties) : <code>Array(string)</code>
        * [.allowedGetProperties](#Page.allowedGetProperties) : <code>Array(string)</code>
        * [.passProperties](#Page.passProperties) : <code>Array(string)</code>
        * [.base64Formats](#Page.base64Formats) : <code>Array(string)</code>
        * [.validRenders](#Page.validRenders) : <code>Array(string)</code>

<a name="Page+isClosed"></a>
### page.isClosed()
*Wrapper-specific*Tells you whether the page has ran `close` or not

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>Boolean</code>  
<a name="Page+throwIfClosed"></a>
### page.throwIfClosed()
*Wrapper-specific*Throws an error if the page has been called `close` on.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+setFn"></a>
### page.setFn(name, fn)
*node-simple-phantom specific*Sets a function. This function does not have the same scope. It workssimilar to how evaluate does. It can return values and can thereforebe used for handlers such as `onConfirm` or `onPrompt`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the event ('onConfirm', etc) |
| fn | <code>function</code> | handler of the event |

<a name="Page+get"></a>
### page.get(name)
*node-phantom-simple specific*As all operations are done over HTTP, the setting and gettingof properties uses callbacks to indicate that they're set or to returna value.The name is checked against allowed properties and will throw a type errorif the name doesn't exist.Example: To set/get the value paperSize.width you would do the following:

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the property |

**Example**  
```js
page.set('paperSize.width', '50px')  .then((result) => {// result is true or false depending on success});page.get('paperSize.width')  .then((value) => // value of paperSize.width);
```
<a name="Page+set"></a>
### page.set(name, value)
*node-phantom-simple specific*As all operations are done over HTTP, the setting and gettingof properties uses callbacks to indicate that they're set or to returna valueWill check the name against allowed properties. Throws error if theproperty doesn't exist or if it's a read only value.Example: To set/get the value paperSize.width you would do the following:

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the property |
| value | <code>anything</code> | value of the property |

**Example**  
```js
page.set('paperSize.width', '50px')  .then((result) => {// result is true or false depending on success});page.get('paperSize.width')  .then((value) => // value of paperSize.width);
```
<a name="Page+evaluate"></a>
### page.evaluate(fn) ⇒ <code>object</code> &#124; <code>string</code> &#124; <code>number</code> &#124; <code>date</code>
[evaluate](http://phantomjs.org/api/webpage/method/evaluate.html)Evaluates the given function in the context of the web page. The executionis sandboxed. Any extra arguments to this function will be sent to the sandboxedfunction in the same order. These arguments has to be serializeable!The function can also return value. However, this functionality is still abit unstable and can therefore cause undefined returns. The return valuehas to be serializable.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | function to be evaluated |

<a name="Page+addCookie"></a>
### page.addCookie(options)
[addCookie](http://phantomjs.org/api/webpage/method/add-cookie.html)Adds a cookie to the webpage. Settings can be seen below. Some are required

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>boolean</code> true if successful, false if not.  

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
### page.clearCookies()
[clearCookie](http://phantomjs.org/api/webpage/method/clear-cookies.html)Deletes all the cookies visible to the current URL.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>boolean</code>  
<a name="Page+close"></a>
### page.close()
[close](http://phantomjs.org/api/webpage/method/close.html)Closes the page and releases the memory heap associated with it. Donot use the page instance after calling this.Due to some technical limitations, the page object might not be completelygarbage collected. This is often encountered when the same object is usedover and over again. Calling this function may stop the increasingheap allocation*Developer note*: Calling this function will lock down all the otherfunctions, causing them to throw errors if they are used.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**:   
<a name="Page+deleteCookie"></a>
### page.deleteCookie(name)
[deletCookie](http://phantomjs.org/api/webpage/method/delete-cookie.html)Delete any Cookies visible to the current URL with a name that matchesthe argument.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>boolean</code> true if successful, false if not.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Cookie name |

<a name="Page+getCookie"></a>
### page.getCookie(name)
*Wrapper Specific*Retrives a cookie by a name. Returns undefined if none is found.Name is not case-sensitive

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>object</code> object of same type as can be found in `addCookie` documentation  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="Page+evaluateJavaScript"></a>
### page.evaluateJavaScript(javaScriptStr)
[evaluateJavaScript](http://phantomjs.org/api/webpage/method/evaluate-java-script.html)Evaluate a function as a string. Evaluates the given function string in the contextof the webpage. It is very familiar with `evaluate`.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| javaScriptStr | <code>string</code> | 

<a name="Page+evaluateAsync"></a>
### page.evaluateAsync(fn)
[evaulateAsync](http://phantomjs.org/api/webpage/method/evaluate-async.html)Evaulates a given function in the context of the webpage without blockingthe current execution (Phantom process - not Node). Unlike `evaluate`, thisfunction cannot take any arguments and will not return any values.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to be evaluated |

<a name="Page+getPage"></a>
### page.getPage(windowName)
[getPage](http://phantomjs.org/api/webpage/method/get-page.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| windowName | <code>string</code> | 

<a name="Page+go"></a>
### page.go()
[go](http://phantomjs.org/api/webpage/method/go.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+goBack"></a>
### page.goBack()
[goBack](http://phantomjs.org/api/webpage/method/go-back.html)*Developer Note*: It is assumed that this performs a go-back command,much like what exists in browsers and returns to the previous page in history.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+goForward"></a>
### page.goForward()
[goForward](http://phantomjs.org/api/webpage/method/go-forward.html)*Developer Note*: It is assumed that this performs a go-forward command,much like what exists in browsers and goes forward in the history.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+includeJs"></a>
### page.includeJs()
[includeJs](http://phantomjs.org/api/webpage/method/include-js.html)Includes external script from specified URL, usually remote location on thepage and executes the callback upon completion.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>string</code> url The url to retrieve the JS from  
<a name="Page+injectJs"></a>
### page.injectJs(filename)
[injectJs](http://phantomjs.org/api/webpage/method/inject-js.html)Injects external script code from specified file into the pagelike (`includeJs`, except the file does not need to be accessible from hostedpage).If File cannot be found in the current directory, the libraryPath (statein PhantomJS) is used for additional lookup.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>boolean</code> true if successful, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | filename to inject |

<a name="Page+open"></a>
### page.open(url, methodOrSettings, data)
[open](http://phantomjs.org/api/webpage/method/open.html)Opens the URL and loads it to the page. Once the page is loaded the promise functionis invoked. In addition, the page.onLoadFinished will also be called.Will give a status in the form of 'success' or 'fail' string

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>string</code> status of the load, either 'success' or 'fail'  

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
### page.openUrl(url, httpConf, settings)
[openUrl](http://phantomjs.org/api/webpage/method/open-url.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| httpConf | <code>httpConf</code> | 
| settings | <code>settings</code> | 

<a name="Page+reload"></a>
### page.reload()
[reload](http://phantomjs.org/api/webpage/method/reload.html)*Developer Note*: Performs a reload of the page.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+render"></a>
### page.render(filename, format, quality)
[render](http://phantomjs.org/api/webpage/method/render.html)Renders the webpage to an image buffer and saves it as the specifiedfilename. Currently the ouput format is automatically set based on the fileextension.*Developer Note*: Sadly, due to how PhantomJS handles PDF rendering, thePDF needs to be saved to a file. This wrapper does however include `renderPdf`which gives the PDF back as a binary string.*Another Developer Note*: PhantomJS says to support `GIF` images, however,the documentation on[Qt ImageWriter](http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats)does not include `GIF`.Use with caution.There is also an issue on [this](https://github.com/ariya/phantomjs/issues/13135)

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filename | <code>string</code> |  | Where to save the file. |
| format | <code>string</code> | <code>&quot;png&quot;</code> | If format is not specified, the file extension                             is extracted and used as the format. |
| quality | <code>number</code> | <code>100</code> | String or number value between 0 and 100 |

<a name="Page+renderBase64"></a>
### page.renderBase64(format)
[renderBase64](http://phantomjs.org/api/webpage/method/render-base64.html)Renders the webpage to an image buffer and returns the result as aBase64-encoded string representation of that image.*Developer Note*: PhantomJS says to support `GIF` images, however,the documentation on[Qt ImageWriter](http://doc.qt.io/qt-4.8/qimagewriter.html#supportedImageFormats)does not include `GIF`.Use with caution.There is also an issue on [this](https://github.com/ariya/phantomjs/issues/13135)

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>string</code>            base64-encoded string  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| format | <code>string</code> | <code>&quot;png&quot;</code> | Either 'png', 'gif' or 'jpeg' |

<a name="Page+sendEvent"></a>
### page.sendEvent()
[sendEvent](http://phantomjs.org/api/webpage/method/send-event.html)The events are not synthetic DOM events, each event is sent to the web pageas if it comes as part of user interaction.Mouse events`sendEvent(mouseEventType[, mouseX, mouseY, button='left'])`The first argument is the event type. Supported types are:'mouseup', 'mousedown', 'mousemove', 'doubleclick' and 'click'.The next two arguments are optional but represent the mouse positionfor the event.The button parameter (defaults to left) specifies the button to push.For 'mousemove', however, there is no button pressed (i.e. it is not dragging).Keyboard eventssendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])The first argument is the event type. The supported types are:keyup, keypress and keydown.The second parameter is a key (from page.event.key), or a string.You can also indicate a fifth argument, which is an integer indicatingthe modifier key.- 0: No modifier key is pressed- 0x02000000: A Shift key on the keyboard is pressed- 0x04000000: A Ctrl key on the keyboard is pressed- 0x08000000: An Alt key on the keyboard is pressed- 0x10000000: A Meta key on the keyboard is pressed- 0x20000000: A keypad button is pressedThird and fourth argument are not taken account for keyboard events.Just give null for them.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+setContent"></a>
### page.setContent(content, url)
[setContent](http://phantomjs.org/api/webpage/method/set-content.html)Allows to set both page.content and page.url properties. The webpagewill be reloaded with new content and the current location set as the givenurl, without any actual http request being made.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | The HTML content of the webpage |
| url | <code>string</code> | The URL of the webpage |

<a name="Page+stop"></a>
### page.stop()
[stop](http://phantomjs.org/api/webpage/method/stop.html)*Developer Note*: It is assumed that this stops the page loading

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToFocusedFrame"></a>
### page.switchToFocusedFrame()
[switchToFocusedFrame](http://phantomjs.org/api/webpage/method/switch-to-focused-frame.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToFrame"></a>
### page.switchToFrame()
[switchToFrame](http://phantomjs.org/api/webpage/method/switch-to-frame.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToMainFrame"></a>
### page.switchToMainFrame()
[switchToMainFrame](http://phantomjs.org/api/webpage/method/switch-to-main-frame.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+switchToParentFrame"></a>
### page.switchToParentFrame()
[switchToParentFrame](http://phantomjs.org/api/webpage/method/switch-to-parent-frame.html)*Developer Note*: No documentation

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+uploadFile"></a>
### page.uploadFile(selector, filename)
[uploadFile](http://phantomjs.org/api/webpage/method/upload-file.html)Updates the specified file (filename) to the form element associated withselector. This function is used to automate the upload of a file, which isusually handled with a file dialog in a traditional browser. Since thereis no dialog in this headless mode, such an upload mechanism is handledvia this special function instead

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type |
| --- | --- |
| selector | <code>string</code> | 
| filename | <code>string</code> | 

<a name="Page+clearMemoryCache"></a>
### page.clearMemoryCache()
*Developer Note*: There is little to no documentation on this function,but from what I can gather from an [issue](https://github.com/ariya/phantomjs/issues/10357)on their github, this function clears the HTTP-cache.[Commit](https://github.com/ariya/phantomjs/commit/5768b705a019da719fa356fdbf370f3ea72b4c93)

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+renderPdf"></a>
### page.renderPdf()
*Wrapper Specific*Renders a PDF and returns the content as a binary string. Due to PhantomJSthis function has to save a file to disk.This wrapper uses [node-tmp](https://github.com/raszi/node-tmp) to dothis. This saves a temporary file (in memory or file, depending on OS), whichis deleted after it is completed or throws an error.

**Kind**: instance method of <code>[Page](#Page)</code>  
<a name="Page+renderHtml"></a>
### page.renderHtml(htmlString, templateRenderDir)
*Wrapper Specific*Renders a HTML string to a PDF by saving the HTML as a temporary file,in the directory specified as `templateRenderDir` (this is nessassarydue to possible Javascript or CSS files that will be included) before ituses `renderPdf` to save the PDF as a temporary file, loading it and thenreturning the PDF stringIf you are sure that the HTML file does not request any JavaScript orCSS files, you can omit the templateRenderDir. The file will thenbe saved in a temporary directory and rendered like that.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>string</code>                   PDF  

| Param | Type | Description |
| --- | --- | --- |
| htmlString | <code>string</code> | the HTML string |
| templateRenderDir | <code>string</code> | directory to save the temp HTML file |

<a name="Page+renderTemplate"></a>
### page.renderTemplate(template, templateRenderDir, options)
*Wrapper Specific*Expects a template that has a .render function that takes the optionssent to it. A structure of such an example can be seenat [reewr-template](https://github.com/Reewr/reewr-template).This function will render the the template into a PDF and returns thecontent as a binary string

**Kind**: instance method of <code>[Page](#Page)</code>  
**Promise**: <code>string</code>                  PDF string  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>object</code> | template object with a .render function |
| templateRenderDir | <code>string</code> | Where to render the html file |
| options | <code>object</code> | options that should be sent to the .render function |

<a name="Page+onAlert"></a>
### page.onAlert(handler)
[onAlert](http://phantomjs.org/api/webpage/handler/on-alert.html)This callback is invoked when there is a JavaScript alert on the web page.The only argument passed to the callback is the string for the message.There is no return value expected from the callback handler.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message) {}` |

<a name="Page+onCallback"></a>
### page.onCallback(handler)
[onCallback](http://phantomjs.org/api/webpage/handler/on-callback.html)**Note**: THIS HANDLER IS EXPERIMENTALIntroduced: PhantomJS 1.6 This callback is invoked when there is aJavaScript window.callPhantom call made on the web page.The only argument passed to the callback is a data object.Note: window.callPhantom is still an experimental API.In the near future, it will be likely replaced with amessage-based solution which will still provide the same functionality.Although there are many possible use cases for this inversion of control,the primary one so far is to prevent the need for a PhantomJS scriptto be continually polling for some variable on the web page.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(object) {}` |

<a name="Page+onClosing"></a>
### page.onClosing(handler)
[onClosing](http://phantomjs.org/api/webpage/handler/on-closing.html)This callback is invoked when the WebPage object is being closed,either via page.close in the PhantomJS outer space or via window.closein the page's client-side.It is not invoked when child/descendant pages are being closed unless youalso hook them up individually. It takes one argument, closingPage,which is a reference to the page that is closing.Once the onClosing handler has finished executing (returned),the WebPage object closingPage will become invalid.*Developer note*: The page you get through this handler will already be invalid,as the onClosing handler in PhantomJS has already returned. This is, again, due tothe async nature of node-phantom-simple.If you need to do something special with teh closingPage, this shouldbe done through .setFn

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(closingPage) {}` |

<a name="Page+onConfirm"></a>
### page.onConfirm(handler)
[onConfirm](http://phantomjs.org/api/webpage/handler/on-confirm.html)This callback is invoked when there is a JavaScript confirm on the web page.The only argument passed to the callback is the string for the message.The return value of the callback handler can be either true or false,which are equivalent to pressing the "OK" or "Cancel" buttonspresented in a JavaScript confirm, respectively.*Developer Note*: This function cannot return values due to the async drivernature of node-phantom-simple. If you need to return a value, please use`page.setFn('onConfirm', function() {});`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message) {}` |

<a name="Page+onConsoleMessage"></a>
### page.onConsoleMessage(handler)
[onConsoleMessage](http://phantomjs.org/api/webpage/handler/on-console-message.html)This callback is invoked when there is a JavaScript console message onthe web page. The callback may accept up to three arguments:  - the string for the message,  - the line number,  - and the source identifier.By default, console messages from the web page are not displayed.Using this callback is a typical way to redirect it.Note: line number and source identifier are not used yet,at least in phantomJS <= 1.8.1. You receive undefined values.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(message, lineNumber, sourceId) {}` |

<a name="Page+onFilePicker"></a>
### page.onFilePicker(handler)
[onFilePicker](http://phantomjs.org/api/webpage/handler/on-file-picker.html)*Developer Note*: No documentation, but it expects a return value, thereforeyou will need to use .setFn if you are to return any values

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | Handler `function(oldFile) {}` |

<a name="Page+onInitialized"></a>
### page.onInitialized(handler)
[onInitialized](http://phantomjs.org/api/webpage/handler/on-initialized.html)This callback is invoked after the web page is created but before a URL is loaded. The callbackmay be used to change global objects*Developer Note*: Due to the async nature of node-phantom-simple, this call willmost likely not be set in time, before the page is already initialized. Thereforeit is suggested to not use this function and instead assume that the pageis already initialize when recieved through a promise.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function() {}` |

<a name="Page+onLoadFinished"></a>
### page.onLoadFinished(handler)
[onLoadFinished](http://phantomjs.org/api/webpage/handler/on-load-finished.html)This callback is invoked when the page finishes the loading. It may accept a single argumentindicating the page's status: 'success' if no network error occured, otherwise 'fail'.Also see `page.open` for an alternate hook for the `onLoadFinished` callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(status) {}` |

<a name="Page+onLoadStarted"></a>
### page.onLoadStarted(handler)
[onLoadStarted](http://phantomjs.org/api/webpage/handler/on-load-started.html)This callback is invoked when the page sarts the loading. There is no argumentpassed to the callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function() {}` |

<a name="Page+onNavigationRequested"></a>
### page.onNavigationRequested(handler)
[onNavigationRequested](http://phantomjs.org/api/webpage/handler/on-navigation-requested.html)By implementing this callback, you will be notified when a navigationevent happens and know if it will be blocked (by `page.navigationLocked`)**Arguments to the callback**- `url`: The target URL of this navigation event- `type`: Possible values include:  - 'Undefined'  - 'LinkClicked'  - 'FormSubmitted'  - 'BackOrForward'  - 'Reload'  - 'FormResubmitted'  - 'Other'- `willNavigate`: true if navigation will happen, false if it is locked- `main`: true if this event comes from the main frame, false if it comes from an iframe of some other sub-frame

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(url, type, willNavigate, main) {}` |

<a name="Page+onPageCreated"></a>
### page.onPageCreated(handler)
[onPageCreated](http://phantomjs.org/api/webpage/handler/on-page-created.html)This callback is invoked when a new child window(but not deeper descendant windows) is created by the page, e.g. using `window.open`.In the PhantomJS outer space, this `WebPage` object will not yet havecalled its own `page.open` method yet and thus doesnot yet know its requested URL (`page.url`).Therefore, the most common purpose for utilizing a `page.onPageCreated` callbackis to decorate the page (e.g. hook up callbacks, etc.).

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(newPage) {}` |

<a name="Page+onPrompt"></a>
### page.onPrompt(handler)
[onPrompt](http://phantomjs.org/api/webpage/handler/on-prompt.html)This callback is invoked when there is a JavaScript `prompt` on the webpage.The arguments passed to the callback are the string of the message and thedefault value for the prompt answer. The return value of the callback handlershould be a string*Developer Note*: This function cannot return values due to the async drivernature of node-phantom-simple. If you need to return a value, please use`page.setFn('onPrompt', function() {});`

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(msg, defaultVal) {}` |

<a name="Page+onResourceError"></a>
### page.onResourceError(handler)
[onResourceError](http://phantomjs.org/api/webpage/handler/on-resource-error.html)This callback is invoked when a web page was unable to load resource.The only argument to the callback is the `resourceError` metadata object.The `resourceError` metadata object contains these properties: - `ìd`: the number of the request - `url`: the resource url - `errorCode`: the [errorCode](http://doc.qt.io/qt-4.8/qnetworkreply.html#NetworkError-enum) - `errorString`: The error description

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(resourceError) {}` |

<a name="Page+onResourceReceived"></a>
### page.onResourceReceived(handler)
[onResourceReceived](http://phantomjs.org/api/webpage/handler/on-resource-received.html)This callback is invoked when a resource requested by the page is received.The only argument to the callback is the response metadata object.If the resource is large and sent by the server in multiple chunks,onResourceReceived will be invoked for every chunk received by PhantomJS.The response metadata object contains these properties:- `id` : the number of the requested resource- `url` : the URL of the requested resource- `time` : Date object containing the date of the response- `headers` : list of http headers- `bodySize` : size of the received content decompressed (entire content or chunk content)- `contentType` : the content type if specified- `redirectURL` : if there is a redirection, the redirected URL- `stage` : "start", "end" (FIXME: other value for intermediate chunk?)- `status` : http status code. ex: 200- `statusText` : http status text. ex: OK

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(response) {}` |

<a name="Page+onResourceRequested"></a>
### page.onResourceRequested(handler)
[onResourceRequested](http://phantomjs.org/api/webpage/handler/on-resource-requested.html)This callback is invoked when the page requests a resource.he first argument to the callback is the requestData metadata object.The second argument is the networkRequest object itself.The requestData metadata object contains these properties:- id : the number of the requested resource- method : http method- url : the URL of the requested resource- time : Date object containing the date of the request- headers : list of http headers*NOTE*: Currently, the networkRequest object does not contain any functions.This is due to an implementation issue in node-phantom-simple. An issuehas been created regarding [this](https://github.com/baudehlo/node-phantom-simple/issues/98)Due to the asynchronous nature of node-phantom-simple, impelementing these functionsare simply too difficult. The networkRequest object is therefore an empty object

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(requestData, networkRequest) {}` |

<a name="Page+onResourceTimeout"></a>
### page.onResourceTimeout(handler)
[onResourceTimeout](http://phantomjs.org/api/webpage/handler/on-resource-timeout.html)This callback is invoked when a resource requested by the page timeoutaccording to settings.resourceTimeout.The only argument to the callback is the request metadata object.The request metadata object contains these properties:- id: the number of the requested resource- method: http method- url: the URL of the requested resource- time: Date object containing the date of the request- headers: list of http headers- errorCode: the error code of the error- errorString: text message of the error

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(request) {}` |

<a name="Page+onUrlChanged"></a>
### page.onUrlChanged(handler)
[onUrlChanged](http://phantomjs.org/api/webpage/handler/on-url-changed.html)This callback is invoked when the URL changes, e.g. as it navigatesaway from the current URL.The only argument to the callback is the new targetUrl string.To retrieve the old URL, use the onLoadStarted callback.

**Kind**: instance method of <code>[Page](#Page)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | `function(targetUrl) {}` |

<a name="Page.readOnlyProperties"></a>
### Page.readOnlyProperties : <code>Arrays(string)</code>
A list of settings that should not be sent through `set` as they areread-only variables

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.allowedSetProperties"></a>
### Page.allowedSetProperties : <code>Array(string)</code>
A list of all the variables that can be used in .set function.

**Kind**: static property of <code>[Page](#Page)</code>  
**Todo**

- [ ] Add typecheck and check before sending the options to PhantomJS to optimize

<a name="Page.allowedGetProperties"></a>
### Page.allowedGetProperties : <code>Array(string)</code>
A list of all the variables that can be retrieved through .getThese also include any readOnly variables

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.passProperties"></a>
### Page.passProperties : <code>Array(string)</code>
A list of settings that are undocumented in type and should thereforenot be type-checked when that is implemented in the future

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.base64Formats"></a>
### Page.base64Formats : <code>Array(string)</code>
A list of allowed formats for the base64 format

**Kind**: static property of <code>[Page](#Page)</code>  
<a name="Page.validRenders"></a>
### Page.validRenders : <code>Array(string)</code>
A list of allowed formats for the render function

**Kind**: static property of <code>[Page](#Page)</code>  
