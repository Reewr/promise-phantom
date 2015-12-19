<a name="Phantom"></a>
## Phantom
The Phantom Class contains all the functionaility that would otherwise

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
*Wrapper specific*

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom+createPage"></a>
### phantom.createPage()
Creates a Page

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>Page</code>  
<a name="Phantom+setProxy"></a>
### phantom.setProxy(ip, port, proxyType, username, password)
*Developer Note*: Sets a proxy by different settings.

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
[injectJs](http://phantomjs.org/api/phantom/method/inject-js.html)

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Returns**: <code>boolean</code> - Whether successful or not  
**Promise**: <code>boolean</code> true if successful, false if not  

| Param | Type |
| --- | --- |
| filename | <code>string</code> | 

<a name="Phantom+addCookie"></a>
### phantom.addCookie(cookie)
[addCookie](http://phantomjs.org/api/phantom/method/add-cookie.html)

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code> Whether successful or not  

| Param | Type |
| --- | --- |
| cookie | <code>object</code> | 

<a name="Phantom+getCookie"></a>
### phantom.getCookie(cookieName)
*Wrapper specific*

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>undefined\|cookie</code>  

| Param | Type | Description |
| --- | --- | --- |
| cookieName | <code>string</code> | name of the cookie (cannot contain spaces) |

<a name="Phantom+clearCookies"></a>
### phantom.clearCookies()
[clearCookie](http://phantomjs.org/api/phantom/method/clear-cookies.html)

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code>  
<a name="Phantom+deleteCookie"></a>
### phantom.deleteCookie(cookieName)
[deleteCookie](http://phantomjs.org/api/phantom/method/delete-cookie.html)

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code> Whether successful or not  

| Param | Type |
| --- | --- |
| cookieName | <code>string</code> | 

<a name="Phantom+set"></a>
### phantom.set(property)
*node-phantom-simple specific*

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>boolean</code>  

| Param | Type |
| --- | --- |
| property | <code>string</code> | 

<a name="Phantom+get"></a>
### phantom.get(property)
*node-phantom-simple specific*

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**: <code>value</code>  

| Param | Type |
| --- | --- |
| property | <code>string</code> | 

<a name="Phantom+exit"></a>
### phantom.exit()
[exit](http://phantomjs.org/api/phantom/method/exit.html)

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
**Promise**:   
<a name="Phantom+on"></a>
### phantom.on()
*node-phantom-simple specific*

**Kind**: instance method of <code>[Phantom](#Phantom)</code>  
<a name="Phantom.allowedSetProperties"></a>
### Phantom.allowedSetProperties : <code>Array</code>
A list of allowed properties that are availble through .set

**Kind**: static property of <code>[Phantom](#Phantom)</code>  
<a name="Phantom.allowedGetProperties"></a>
### Phantom.allowedGetProperties : <code>Array</code>
A list of allowed properties that is available through .get

**Kind**: static property of <code>[Phantom](#Phantom)</code>  