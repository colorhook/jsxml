jsxml
==============

jsxml is an XML library for javascript (and node)

单元测试
------
[![travis build status](https://api.travis-ci.org/colorhook/jsxml.png)](https://www.travis-ci.org/colorhook/jsxml)


Install by NPM
--------------

```shell
npm install node-jsxml
```

How to use?
------------
After add this library to your project, there will be a global object named jsxml. 

in HTML file, import using &lt;script&gt; elements.

```html
<script src="jsxml.js"></script>
```

in Node, import using require function.

```javascript
var jsxml = require("node-jsxml");
```

support AMD, CMD. Big thanks to [TimSchlechter](https://github.com/TimSchlechter).

```javascript
seajs.config({
    alias: {
        jsxml: '../src/jsxml.js'
    }
});
seajs.use('jsxml', function(jsxml){
    console.log(jsxml);
});
```

```javascript
var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;
```

Here you go:

```javascript
var xml = new XML("<spring>" + 
		     "<list id='data'>" + 
		       "<element value='jsxml'/>" +
		       "<element value='is'/>" +
		       "<element value='an'/>" +
		       "<element value='xml'/>" +
		       "<element value='parser'/>" +
		     "</list>" +
                  "</spring>");

//find child nodes
var child = xml.child('list');

//print the xml string
console.log(xml.toXMLString());

//modify namespace
xml.addNamespace(new Namespace("ns", "http://colorhook.com"));
xml.children().addNamespace(new Namespace("prefix", "uri"));
console.log(xml.toXMLString());

//find descendants nodes
var descendants = xml.descendants('element');

//get all children
var children = xml.children();
//or
var children = xml.child('*');

//get text node
var text = xml.text();

//get element node
var elements = xml.elements();

//get comment node
var comments = xml.comments();

//get attribute
var attribute = xml.attribute("id");

//get all attributes
var attributes = xml.attributes();
```

All methods above return an XML object or XMLList object, if you want to get the String type content, you should:

```javascript
var xml = new XML(xmlContent);

var attrValue = xml.attribute('attrName').toString();
//or
var attrValue = xml.attribute('attrName').getValue();

var childA = xml.child('a').toString();
//or
var childA = xml.child('a').getValue();
```

If you want to modify the value, you should call method setValue:

```javascript
var xml = new XML("your xml string");

var attr= xml.attribute('attrName');
attr.setValue("newValue");

var childA = xml.child('a');
childA.setValue("newValue");
```

You can regenerate the XML

```javascript
var str = xml.toXMLString();
```

While dealing with a list of childs in XML tree, you should use XMLList API:

```javascript
var list = xml.child("item");
list.each(function(item, index){
//item is an XML
});
```

Advanced topics
----------------

You can also add, retrieve or remove namespaces:

```javascript
var xml = new XML("your xml string");
var ns = xml.namespace("prefix");

var nsNew = new Namespace("prefix", 'uri');
xml.addNamespace(nsNew);
xml.removeNamespace(nsNew);
```

Bugs & Feedback
----------------

Please feel free report bugs or feature requests.
You can send me private message on [github], or send me an email to: [colorhook@gmail.com]

License
-------

jsxml is free to use under MIT license. 