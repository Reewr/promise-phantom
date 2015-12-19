<a name="Phantom"></a>
## Phantom
The Phantom Class contains all the functionaility that would otherwisebe in the global `phantom`-object in PhantomJS.All functions that are part of PhantomJS' API include the documentationfrom their webpage. Comments outside of the PhantomJS docs will include a*Developer Note*-tag. In addition, all functions that can be found in theAPI also have links to the respective pages.The full PhantomJS documentation for the Phantom object can be found [here](http://phantomjs.org/api/phantom/)

**Kind**: global class  

* [Phantom](#Phantom)
    * _instance_
        * [.hasExited()](#Phantom+hasExited) ⇒ <code>Boolean</code>
        * [.createPage()](#Phantom+createPage)
        * [.setProxy(ip, port, proxyType, username, password)](#Phantom+setProxy)
        * [.injectJs(filename)](#Phantom+injectJs) ⇒ <code>boolean</code>
        * [.addCookie(cookie)](#Phantom+addCookie)
        * [.getCookie(cookieName)](#Phantom+getCookie)
        * [.clearCookies()](#Phantom+clearCookies)
        * [.deleteCookie(cookieName)](#Phantom+deleteCookie)
        * [.set(property)](#Phantom+set)
        * [.get(property)](#Phantom+get)
        * [.exit()](#Phantom+exit)
        * [.on()](#Phantom+on)
    * _static_
        * [.allowedSetProperties](#Phantom.allowedSetProperties) : <code>Array</code>
        * [.allowedGetProperties](#Phantom.allowedGetProperties) : <code>Array</code>

<a name="Phantom+hasExited"></a>
### phantom.hasExited() ⇒ <code>Boolean</code>
*Wrapper specific*Returns true if .exit() has been run.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+createPage"></a>
### phantom.createPage()
Creates a PageThis is equivalent to doing `webpage.create()` in PhantomJSSee [webpage docs](./webpage.md) for how to use the Page object

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>Page</code>  
<a name="Phantom+setProxy"></a>
### phantom.setProxy(ip, port, proxyType, username, password)
*Developer Note*: Sets a proxy by different settings.This function is undocumented and is not in the API-documentation of PhantomJS.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>undefined</code>  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | ip to the proxy |
| port | <code>string</code> | Port of the proxy |
| proxyType | <code>string</code> | http, sock5 or non |
| username | <code>string</code> | username of the proxy |
| password | <code>string</code> | password of the proxy |

<a name="Phantom+injectJs"></a>
### phantom.injectJs(filename) ⇒ <code>boolean</code>
[injectJs](http://phantomjs.org/api/phantom/method/inject-js.html)Injects external script code from the specified file intothe Phantom outer space. If the file cannot be found inthe current directory, libraryPath is used for additional look up.This function returns true if injection is successful,otherwise it returns false.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>boolean</code> - Whether successful or not  
**Promise**: <code>boolean</code> true if successful, false if not  

| Param | Type |
| --- | --- |
| filename | <code>string</code> | 

<a name="Phantom+addCookie"></a>
### phantom.addCookie(cookie)
[addCookie](http://phantomjs.org/api/phantom/method/add-cookie.html)Add a Cookie to the CookieJar.Returns true if successfully added, othewise falseCookie object is as follows:```js{  domain  : string,  value   : string,  name    : string  httponly: boolean,  path    : string,  secure  : boolean}```

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code> Whether successful or not  

| Param | Type |
| --- | --- |
| cookie | <code>object</code> | 

<a name="Phantom+getCookie"></a>
### phantom.getCookie(cookieName)
*Wrapper specific*Retrieves a cookie by name. Does this by retreiving the cookie arrayand finding the cookie that has the cookieName.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>undefined\|cookie</code>  

| Param | Type | Description |
| --- | --- | --- |
| cookieName | <code>string</code> | name of the cookie (cannot contain spaces) |

<a name="Phantom+clearCookies"></a>
### phantom.clearCookies()
[clearCookie](http://phantomjs.org/api/phantom/method/clear-cookies.html)Delete all Cookies in the CookieJar

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code>  
<a name="Phantom+deleteCookie"></a>
### phantom.deleteCookie(cookieName)
[deleteCookie](http://phantomjs.org/api/phantom/method/delete-cookie.html)Delete any Cookies in the CookieJar with a 'name' propertymatching cookieName.Returns true if successful, otherwise false

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code> Whether successful or not  

| Param | Type |
| --- | --- |
| cookieName | <code>string</code> | 

<a name="Phantom+set"></a>
### phantom.set(property)
*node-phantom-simple specific*Sets a property to a set value. The following can be changed:- cookies- cookiesEnabled- libraryPath

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code>  

| Param | Type |
| --- | --- |
| property | <code>string</code> | 

<a name="Phantom+get"></a>
### phantom.get(property)
*node-phantom-simple specific*Returns a property, the following can be retrieved:- cookies- cookiesEnabled- libraryPath- scriptName *deprecated*- args *deprecated*- version

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>value</code>  

| Param | Type |
| --- | --- |
| property | <code>string</code> | 

<a name="Phantom+exit"></a>
### phantom.exit()
[exit](http://phantomjs.org/api/phantom/method/exit.html)Exits the phantom process, will lock down all other functions

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**:   
<a name="Phantom+on"></a>
### phantom.on()
*node-phantom-simple specific*As the browser instance is a 'spawn' object, thiscan be used to set certain event handlers on, such as'error'. All arguments are sent to the node-phantom-simples `on` handler

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom.allowedSetProperties"></a>
### Phantom.allowedSetProperties : <code>Array</code>
A list of allowed properties that are availble through .set

**Kind**: static property of <code>[Phantom](#Phantom)</code>  
<a name="Phantom.allowedGetProperties"></a>
### Phantom.allowedGetProperties : <code>Array</code>
A list of allowed properties that is available through .getThe ones not retrieved from .allowedSetProperties are read-only valuesproperties

**Kind**: static property of <code>[Phantom](#Phantom)</code>  
