jsxml
==============

jsxml is an XML library for javascript (and node)

How to use?
------------
After add this library to your project, there will be a global object named jsxml. 
```javascript
var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;
```
Here you go:
```javascript
var xml = new XML("your xml string");

//find child nodes
var child = xml.child('childTag');

//find descendants nodes
var descendants = xml.descendants('descendantTag');

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
var attribute = xml.attribute("attributeName");

//get all attributes
var attributes = xml.attributes();
```

All methods above return an XML object or XMLList object, if you want to get the String type content, you should:
```javascript
var xml = new XML("your xml string");

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