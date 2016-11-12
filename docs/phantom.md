<a name="Phantom"></a>

## Phantom
The Phantom Class contains all the functionality that would otherwise
be in the global `phantom`-object in PhantomJS.

All functions that are part of PhantomJS' API include the documentation
from their webpage. Comments outside of the PhantomJS docs will include a
*Developer Note*-tag. In addition, all functions that can be found in the
API also have links to the respective pages. All functions are listed in alphabetical order

The full PhantomJS documentation for the Phantom object can be found [here](http://phantomjs.org/api/phantom/)

**Kind**: global class  

* [Phantom](#Phantom)
    * [.addCookie(cookie)](#Phantom+addCookie) ⇒ <code>Promise(Boolean)</code>
    * [.clearCookies()](#Phantom+clearCookies) ⇒ <code>Promise(Boolean)</code>
    * [.createPage()](#Phantom+createPage) ⇒ <code>Promise(Page)</code>
    * [.deleteCookie(cookieName)](#Phantom+deleteCookie) ⇒ <code>Promise(Boolean)</code>
    * [.exit()](#Phantom+exit) ⇒ <code>Promise()</code>
    * [.get(property)](#Phantom+get) ⇒ <code>Promise(Value)</code>
    * [.getCookie(cookieName)](#Phantom+getCookie) ⇒ <code>Promise(Undefined)</code> &#124; <code>Promise(object)</code>
    * [.hasExited()](#Phantom+hasExited) ⇒ <code>Boolean</code>
    * [.injectJs(filename)](#Phantom+injectJs) ⇒ <code>Promise(Boolean)</code>
    * [.on()](#Phantom+on)
    * [.set(property)](#Phantom+set) ⇒ <code>Promise(Boolean)</code>
    * [.setProxy(ip, port, proxyType, username, password)](#Phantom+setProxy) ⇒ <code>Promise()</code>

<a name="Phantom+addCookie"></a>

### phantom.addCookie(cookie) ⇒ <code>Promise(Boolean)</code>
[addCookie](http://phantomjs.org/api/phantom/method/add-cookie.html)

Add a Cookie to the CookieJar.

Cookie object is as follows:
```js
{
  domain  : string,
  value   : string, // required
  name    : string, // required
  httponly: boolean,
  path    : string,
  secure  : boolean
}
```

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>Promise(Boolean)</code> - Whether successful or not  

| Param | Type |
| --- | --- |
| cookie | <code>Object</code> | 

<a name="Phantom+clearCookies"></a>

### phantom.clearCookies() ⇒ <code>Promise(Boolean)</code>
[clearCookie](http://phantomjs.org/api/phantom/method/clear-cookies.html)

Delete all Cookies in the CookieJar

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+createPage"></a>

### phantom.createPage() ⇒ <code>Promise(Page)</code>
Creates a Page. This is equivalent to doing `webpage.create()` in PhantomJS

See [webpage docs](./webpage.md) for how to use the Page object

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+deleteCookie"></a>

### phantom.deleteCookie(cookieName) ⇒ <code>Promise(Boolean)</code>
[deleteCookie](http://phantomjs.org/api/phantom/method/delete-cookie.html)

Delete any Cookies in the CookieJar with a 'name' property
matching cookieName.
Returns true if successful, otherwise false

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>Promise(Boolean)</code> - Whether successful or not  

| Param | Type |
| --- | --- |
| cookieName | <code>String</code> | 

<a name="Phantom+exit"></a>

### phantom.exit() ⇒ <code>Promise()</code>
[exit](http://phantomjs.org/api/phantom/method/exit.html)

Exits the phantom process, will lock down all other functions

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+get"></a>

### phantom.get(property) ⇒ <code>Promise(Value)</code>
*node-phantom-simple specific*

Returns a property, the following can be retrieved:
- cookies
- cookiesEnabled
- libraryPath
- scriptName *deprecated*
- args *deprecated*
- version

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  

| Param | Type |
| --- | --- |
| property | <code>String</code> | 

<a name="Phantom+getCookie"></a>

### phantom.getCookie(cookieName) ⇒ <code>Promise(Undefined)</code> &#124; <code>Promise(object)</code>
*Wrapper specific*

Retrieves a cookie by name. Does this by retrieving the cookie array
and finding the cookie that has the cookieName.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>Promise(Undefined)</code> &#124; <code>Promise(object)</code> - Undefined if not found, otherwise cookie  

| Param | Type | Description |
| --- | --- | --- |
| cookieName | <code>String</code> | name of the cookie (cannot contain spaces) |

<a name="Phantom+hasExited"></a>

### phantom.hasExited() ⇒ <code>Boolean</code>
*Wrapper specific*

Returns true if `phantom.exit()` has been run.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+injectJs"></a>

### phantom.injectJs(filename) ⇒ <code>Promise(Boolean)</code>
[injectJs](http://phantomjs.org/api/phantom/method/inject-js.html)

Injects external script code from the specified file into
the Phantom outer space. If the file cannot be found in
the current directory, libraryPath is used for additional look up.
This function returns true if injection is successful,
otherwise it returns false.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>Promise(Boolean)</code> - true if successful, false if not  

| Param | Type |
| --- | --- |
| filename | <code>String</code> | 

<a name="Phantom+on"></a>

### phantom.on()
*node-phantom-simple specific*

As the browser instance is a 'spawn' object, this
can be used to set certain event handlers on, such as
'error'. All arguments are sent to the node-phantom-simples `on` handler

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+set"></a>

### phantom.set(property) ⇒ <code>Promise(Boolean)</code>
*node-phantom-simple specific*

Sets a property to a set value. The following can be changed:
- cookies
- cookiesEnabled
- libraryPath

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  

| Param | Type |
| --- | --- |
| property | <code>String</code> | 

<a name="Phantom+setProxy"></a>

### phantom.setProxy(ip, port, proxyType, username, password) ⇒ <code>Promise()</code>
*Developer Note*: Sets a proxy by different settings.
This function is undocumented and is not in the API-documentation of PhantomJS.

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip to the proxy |
| port | <code>String</code> | Port of the proxy |
| proxyType | <code>String</code> | http, sock5 or non |
| username | <code>String</code> | username of the proxy |
| password | <code>String</code> | password of the proxy |

