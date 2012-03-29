if(typeof exports != "undefined"){
	var YUI = require("yui3").YUI;
	var jsxml = require("../src/jsxml.js").jsxml;
}
YUI().use('test', function(Y){


	var Assert = Y.Assert,
		XML = jsxml.XML,
		XMLList = jsxml.XMLList,
		QName = jsxml.QName,
		NodeKind = jsxml.NodeKind,
		Namespace = jsxml.Namespace,
		example = "<?xml version='1.0' encoding='utf-8'?>"
			+"<xml xmlns='uri' xmlns:h='h'>sss"
				+"<a>a"
					+"<e>e</e>"
					+"<? instruction ?>"
				+"</a>"
				+"<b>b</b>"
				+"<c att='1'/>"
				+"<p><![CDATA[inner tag: @#?&<>;'<p></p>]]></p>"
			 +"</xml>";
	
	//QName TestCase
	var qnameTestCase = new Y.Test.Case({
		name:"jsxml.QName Test Case",
		testConstructor: function(){
			Assert.isFunction(QName);
			Assert.areEqual(QName, (new QName()).constructor);
		},
		testParams: function(){
			var qn = new QName();
			Assert.areEqual(qn.uri, "");
			Assert.areEqual(qn.localName, "");

			qn = new QName('A');
			Assert.areEqual(qn.uri, "");
			Assert.areEqual(qn.localName, "A");

			qn = new QName(undefined, undefined);
			Assert.areEqual(qn.uri, "undefined");
			Assert.areEqual(qn.localName, "undefined");

			qn = new QName(false, null);
			Assert.areEqual(qn.uri, "false");
			Assert.areEqual(qn.localName, "null");

		},
		testToString: function(){
			var qn = new QName();
			Assert.areEqual(qn.toString(), "");

			qn = new QName("localName");
			Assert.areEqual(qn.toString(), "localName");
					
			qn = new QName("uri", "localName");
			Assert.areEqual(qn.toString(), "uri::localName");
				
			qn = new QName(new Namespace("prefix", "http://uri"), "localName");
			Assert.areEqual(qn.toString(), "http://uri::localName");
		},
		testCopy: function(){
			var qn = new QName("uri", "localName");
			var qn2 = qn.copy();
			Assert.areEqual(qn2.toString(), "uri::localName");
		},
		testEquals: function(){
			var qn = new QName("uri", "localName");
			var qn2 = qn.copy();
			Assert.isTrue(qn.equals(qn2));
			qn2 = new QName("uri", "localName");
			Assert.isTrue(qn.equals(qn2));
		}
	});
	//NodeKind TestCase
	var nodekindTestCase = new Y.Test.Case({
		name: "jsxml NodeKind Test Case",
		testType: function(){
			Assert.isObject(NodeKind);
		},
		testValue: function(){
			Assert.areEqual(NodeKind.ELEMENT, 'element');
			Assert.areEqual(NodeKind.COMMENT, 'comment');
			Assert.areEqual(NodeKind.PROCESSING_INSTRUCTIONS, 'processing-instructions');
			Assert.areEqual(NodeKind.TEXT, 'text');
			Assert.areEqual(NodeKind.ATTRIBUTE, 'attribute');
		}
	});

	//Namespace TestCase
	var namespaceTestCase = new Y.Test.Case({
		name: "jsxml.Namespace Test Case",
		
		testConstructor: function(){
			Assert.isFunction(Namespace);
			Assert.areEqual(Namespace, (new Namespace()).constructor);
		},
		testParams: function(){
			var ns = new Namespace();
			Assert.areEqual(ns.prefix, "");
			Assert.areEqual(ns.uri, "");

			ns = new Namespace(undefined);
			Assert.areEqual(ns.prefix, "");
			Assert.areEqual(ns.uri, "undefined");

			ns = new Namespace(undefined, undefined);
			Assert.areEqual(ns.prefix, "undefined");
			Assert.areEqual(ns.uri, "undefined");

			ns = new Namespace(false, null);
			Assert.areEqual(ns.prefix, "false");
			Assert.areEqual(ns.uri, "null");

			ns = new Namespace("http://uri");
			Assert.areEqual(ns.prefix, "");
			Assert.areEqual(ns.uri, "http://uri");

			ns = new Namespace("prefix", "http://uri");
			Assert.areEqual(ns.prefix, "prefix");
			Assert.areEqual(ns.uri, "http://uri");
		},
		testToString: function(){
			var ns = new Namespace();
			Assert.areEqual(ns.uri, ns.toString());
		},
		testCopy: function(){
			var ns = new Namespace("prefix", "http://uri");
			var ns2 = ns.copy();
			Assert.areEqual(ns2.prefix, "prefix");
			Assert.areEqual(ns2.uri, "http://uri");
		},
		testEquals: function(){
			var ns = new Namespace("prefix", "http://uri");
			var ns2 = ns.copy();
			Assert.isTrue(ns.equals(ns2));
			qn2 = new Namespace("prefix", "http://uri");
			Assert.isTrue(ns.equals(ns2));
		}
	});
	
	//XMLList TestCase
	var xmllistTestCase = new Y.Test.Case({
		name: "jsxml.XMLList TestCase",
		testConstructor: function(){
			Assert.isFunction(XMLList);
			Assert.areEqual(XMLList, (new XMLList()).constructor);

			var list = new XMLList();
			Assert.isArray(list._list);
			Assert.areEqual(list._list.length, 0);
		},
		test_addXML: function(){
			var list = new XMLList();
			var xml = new XML();
			list._addXML(xml);
			Assert.areEqual(list._list.length, 1);
			Assert.areEqual(xml, list._list[0]);
		},
		testLength: function(){
			var xml =new XML("<a><b></b><b><c></c></b></a>");
			Assert.areEqual(2, xml.child('b').length());
			Assert.areEqual(0, xml.child('c').length());
		},
		
		testChildren: function(){
			var xml = new XML("<a><b>1</b><b>2</b></a>");
			var list = xml.child('b');
			Assert.areEqual("12", list.children().toString());
			Assert.areEqual("1\n2", list.children().toXMLString());
		},
		testChild: function(){
			var xml = new XML("<a><b><c>1</c></b><b><c>2</c></b><b>3</b></a>");
			var list = xml.child('b');
			var cList = list.child('c');
			Assert.areEqual("12", cList.children().toString());
			Assert.areEqual("1\n2", cList.children().toXMLString());
		},
		testElements: function(){
			var xml = new XML("<a><b><c>1</c></b><b><c>2</c></b><b>3</b></a>");
			var list = xml.child('b');
			var cList = list.elements('c');
			Assert.areEqual("12", cList.children().toString());
			Assert.areEqual("1\n2", cList.children().toXMLString());
		},
		testDescendants: function(){
			var xml = new XML("<a><b><d>1</d></b><b><c><d>2</d></c></b><b><d>3</d></b></a>");
			var list = xml.child('b');
			var dList = list.descendants('d');
			Assert.areEqual("123", dList.children().toString());
			Assert.areEqual("1\n2\n3", dList.children().toXMLString());
		},
		testAttribute: function(){
			var xml = new XML("<a><b a='a1' b='b1'><d>1</d></b><b a='a2' b='b2'><c><d>2</d></c></b><b><d>3</d></b></a>");
			var list = xml.child('b');
			var attList = list.attribute('a');
			Assert.areEqual(2, attList.length());
			Assert.areEqual('a1', attList.item(0).getValue());
			Assert.areEqual('a2', attList.item(1).getValue());
		},
		testAttributes: function(){
			var xml = new XML("<a><b a='a1' b='b1'><d>1</d></b><b a='a2' b='b2'><c><d>2</d></c></b><b><d>3</d></b></a>");
			var list = xml.child('b');
			var attList = list.attributes();
			Assert.areEqual(4, attList.length());
			Assert.areEqual('a1', attList.item(0).getValue());
			Assert.areEqual('b1', attList.item(1).getValue());
			Assert.areEqual('a2', attList.item(2).getValue());
			Assert.areEqual('b2', attList.item(3).getValue());
		},
		testNormalize: function(){
			var xml =new XML("<a><b>  </b><b> </b></a>");
			var i1 = xml.child('b').item(0);
			i1.appendChild("hello");
			Assert.areEqual(1,  xml.child('b').item(0)._children.length, 'after append "hello" the children length should be 1');
			i1.appendChild(" world");
			Assert.areEqual(2, xml.child('b').item(0)._children.length, 'after append "word" the children length should be 2');
			xml.normalize();
			Assert.areEqual(1, xml.child('b').item(0)._children.length, 'after normalize the children length should be 1');
		},
		testComments: function(){
			XML.ignoreComments = false;
			var xml = new XML("<a><!--0--><b>1<!--1--></b><b>2<!--2--></b><b><c><!--3--></c></b><c><!--4--></c></a>");
			var c = xml.child('b').comments();
			XML.ignoreComments = true;
			Assert.areEqual("<!--1-->\n<!--2-->", c.toXMLString());
		},
		testText: function(){
			var xml = new XML("<a>0<b>1</b><b>2</b><b><c>3</c></b><c>4</c></a>");
			var list = xml.child('b');
			var newList = list.text();
			Assert.areEqual(2, newList.length());
			Assert.areEqual("12", newList.toString());
		},
		testMethodProcessingInstructions: function(){
			XML.ignoreProcessingInstructions = false;
			var xml = new XML("<a><?0 ?><b>1<?1 ?></b><b>2<?2 ?></b><b><c><?3 ?></c></b><c><?4 ?></c></a>");
			var pi = xml.child('b').processingInstructions();
			XML.ignoreProcessingInstructions = true;
			Assert.areEqual("<?1 ?>\n<?2 ?>", pi.toXMLString());
		},
		testHasSimpleContent: function(){
			var xml = new XML('<a><b>1</b><b></b></a>');
			var list = xml.child('b');
			Assert.isTrue(list.hasSimpleContent());
		},
		testHasComplexContent: function(){
			var xml = new XML('<a><b><c/></b><b/></a>');
			var list = xml.child('b');
			Assert.isTrue(list.hasComplexContent());
		},
		testToString: function(){
			var xml = new XML("<a><b>1</b><b>2</b></a>");
			var list = xml.child('b');
			Assert.areEqual( "12", list.toString());
		},
		testToXMLString: function(){
			var xml = new XML("<a><b>1</b><b>2</b></a>");
			var list = xml.child('b');
			Assert.areEqual("<b>1</b>\n<b>2</b>", list.toXMLString());

			xml = new XML('<a><b><c/></b><b/></a>');
			Assert.areEqual(2, xml._children.length, 'xml should has 2 child');
			list = xml.child('b')
			Assert.areEqual("<b>\n  <c/>\n</b>\n<b/>", list.toXMLString());

			xml = new XML("<a><b><c>1</c><c><d></d></c></b><b>2</b></a>");
		    list = xml.child('b');
			Assert.areEqual(2, list.length());
			Assert.areEqual(XMLList, list.constructor);
			Assert.areEqual("<b>\n  <c>1</c>\n  <c>\n    <d/>\n  </c>\n</b>\n<b>2</b>", list.toXMLString());
		},
		testCopy: function(){
			var xml = new XML('<xml><a></a><a></a><a b="1" c="2"><b></b><c><d></d></c></a></xml>');
			var list = xml.child('a');
			var listCopy = list.copy();
			Assert.areEqual(list.toString(), listCopy.toString(), 'listCopy should has a same toString() value');
			Assert.areEqual(list.toXMLString(), listCopy.toXMLString(), 'listCopy should has a same toXMLString() value');
		},
		//extension for javascript
		testItem: function(){
			var xml = new XML("<a><b>1</b><b>2</b></a>");
			var item1 = xml.child('b').item(0);
			var item2 = xml.child('b').item(1);
			var item3 = xml.child('b').item(2);
			Assert.areEqual("<b>1</b>", item1.toXMLString());
			Assert.areEqual("<b>2</b>", item2.toXMLString());
			Assert.isUndefined(item3, 'item3 shoud be undefined');
		},
		testEach: function(){
			var count = 0;
			var arr1 = [];
			var arr2 = [];
			var xml = new XML("<a><b>1</b><b>2</b></a>");
			xml.child('b').each(function(item, index){
				count++;
				arr1.push(item);
				arr2.push(index);
			});
			Assert.areEqual(2, count, 'the each function should execute 2 times');
			Assert.areEqual(0, arr2[0]);
			Assert.areEqual(1, arr2[1]);
			Assert.areEqual('<b>1</b>', arr1[0].toXMLString());
			Assert.areEqual('<b>2</b>', arr1[1].toXMLString());

		},
		testDoctype: function(){
			var str = "<!doctype abc>\n<a/>";
			var xml = new XML(str);
			Assert.areEqual(str, xml.toXMLString());
		},
		testDoctype2: function(){
			var str = '<?xml version="1.0" encoding="utf-8" ?>' +
					'<!DOCTYPE element[' +
					'<!ELEMENT element_name element_definition>' +
					'<!ELEMENT element_name element_definition>' +
					']>' +
				    '<xml>xml content</xml>';
			var passed = true;
			try{
				new XML(str);
			}catch(err){
				passed = false;
			}
			Assert.isTrue(passed);
		}
		
	});
	var xml = new XML();
	//XML TestCase
	var xmlTestCase = new Y.Test.Case({

		name: "jsxml.XML TestCase",
		

		testConstructor: function(){
			Assert.isFunction(XML);
			Assert.areEqual(XML, (new XML()).constructor);

			var xml = new XML();
			Assert.isArray(xml._attributes);
			Assert.isArray(xml._children);
			Assert.isNull(xml._parent);
			Assert.areEqual(NodeKind.ELEMENT, xml._nodeKind);
			Assert.areEqual(xml.toString(), "");
			Assert.areEqual(xml.toXMLString(), "");
		},
		testNodeKind: function(){
			var list = new XML();
			list._nodeKind = NodeKind.ATTRIBUTE;
			Assert.areEqual(list.nodeKind(), NodeKind.ATTRIBUTE);
			list._nodeKind  = NodeKind.TEXT;
			Assert.areEqual(list.nodeKind(), NodeKind.TEXT);
			list._nodeKind  = NodeKind.COMMENT;
			Assert.areEqual(list.nodeKind(), NodeKind.COMMENT);
			list._nodeKind  = NodeKind.PROCESSING_INSTRUCTION;
			Assert.areEqual(list.nodeKind(), NodeKind.PROCESSING_INSTRUCTION);
		},
		testLength: function(){
			var xml = new XML();
			Assert.areEqual(xml.length(), 1);
		},
		testName: function(){
			var xml = new XML();

			Assert.areEqual(null, xml.name());
			Assert.areEqual(null, xml.localName());
			
			xml.setName("hello");
			Assert.areEqual(null, xml.name());
			Assert.areEqual(null, xml.localName());

			var ns = new Namespace("prefix", "http://uri");
			var qname = new QName(ns, "localName");
			xml._qname = qname;
			Assert.areEqual(xml.name(), "http://uri:localName");
			Assert.areEqual(xml.localName(), "localName");
			
			xml.setName("newName");
			Assert.areEqual(xml.name(), "newName");
			Assert.areEqual(xml.localName(), "newName");
			
			qname = new QName(ns, "localName");
			xml._qname = qname;
			xml.setLocalName("newLocalName");
			Assert.areEqual(xml.name(), "http://uri:newLocalName");
			Assert.areEqual(xml.localName(), "newLocalName");

			var faild = false;
			try{
				xml.setName("1");
			}catch(e){ faild = true;};
			Assert.isTrue(faild);

			faild = false;
			try{
				xml.setName("a1");
			}catch(e){ faild = true;};
			Assert.isFalse(faild);

			faild = false;
			try{
				xml.setName("a:1");
			}catch(e){ faild = true;};
			Assert.isTrue(faild);

			 false;
			try{
				xml.setLocalName("1");
			}catch(e){ faild = true;};
			Assert.isTrue(faild);

			faild = false;
			try{
				xml.setLocalName("a1");
			}catch(e){ faild = true;};
			Assert.isFalse(faild);

			faild = false;
			try{
				xml.setLocalName("a:1");
			}catch(e){ faild = true;};
			Assert.isTrue(faild);

		},
		testNamespaceDeclaration: function(){
			var xml = new XML();
			Assert.isArray(xml._namespaces);
			Assert.areEqual(xml._namespaces.length, 0);
			var ns = new Namespace("prefix", "uri");
			xml._namespaces.push(ns);
			var dArr = xml.namespaceDeclarations();
			Assert.isArray(dArr);
			Assert.areEqual(1, dArr.length);
			Assert.areEqual(ns, dArr[0]);

			xml = new XML("<a xmlns='uri' xmlns:a='a' xmlns:b='b'/>");
			dArr = xml.namespaceDeclarations();
			Assert.areEqual(3, dArr.length);
		},
		testAddNamespace: function(){
			var xml = new XML();
			var ns = new Namespace("prefix", "uri");
			xml.addNamespace(ns);
			Assert.areEqual(ns, xml._namespaces[0]);
		},
		testRemoveNamespace: function(){
			var xml = new XML();
			var ns = new Namespace("prefix", "uri");
			xml.addNamespace(ns);
			Assert.areEqual(ns, xml._namespaces[0]);
			xml.removeNamespace(ns);
			Assert.areEqual(0, xml._namespaces.length);
		},
		testNamespace: function(){
			var xml = new XML();
			var ns = new Namespace("prefix", "uri");
			xml.addNamespace(ns);
			var myNs = xml.namespace("prefix");
			Assert.areEqual(ns, myNs);

			var myNs2 = xml.namespace();
			Assert.areEqual(myNs2.constructor, Namespace);

			var myNs3 = xml.namespace("prefix2");
			Assert.isUndefined(myNs3);
			
		},
		testSetNamespace: function(){
			var xml = new XML();
			var ns = new Namespace("prefix", "uri");
			xml._qname = new QName();
			xml.setNamespace(ns);
			Assert.areEqual(xml._qname.uri, "uri");
		},
		testInScopeNamespaces: function(){
			var xml  =new XML("<a xmlns:ns='uri' xmlns:pns='p' p='1' b='2'><b>b</b><c>c</c></a>");
			var b = xml.child('b');
			var c = xml.child('c');
			var bns = b.inScopeNamespaces();
			var cns = c.inScopeNamespaces();
			Assert.areEqual(2, bns.length, 'child b should be in 2 scope namespaces');
			Assert.areEqual(2, cns.length, 'child c should be in 2 scope namespaces');
			var ns1 = bns[0];
			Assert.areEqual(Namespace, ns1.constructor, 'the item of inScopeNamespaces shoud be Namespace');
			Assert.areEqual('uri', ns1.uri);
			Assert.areEqual('ns', ns1.prefix);
			var ns2 = bns[1];
			Assert.areEqual('p', ns2.uri);
			Assert.areEqual('pns', ns2.prefix);
		},
		testChildIndex: function(){
			var xml = new XML();
			Assert.areEqual(-1, xml.childIndex());

			xml = new XML("<a><b>b</b><c>c</c></a>");
			Assert.areSame(XML, xml.child('b').constructor, 'the children b should be the XML');
			Assert.areSame(xml, xml.child('b')._parent, 'the children b\'s parent should be xml');
			Assert.areEqual(xml._getFilterChildren()[0].toXMLString(), xml.child('b').toXMLString());
			Assert.areEqual(0, xml.child('b').childIndex(), "the tag b should be the first tag");
			Assert.areEqual(1, xml.child('c').childIndex(), "the tag c should be the second tag");

		},
		testAppendChild: function(){
			var xml = new XML("<a></a>");
			var child = new XML("<b></b>");
			var f = new XML("<a><b></b></a>");
			var result = xml.appendChild(child);
			Assert.areEqual(1, xml._children.length);
			Assert.isTrue(xml._children[0] == child);
			Assert.areSame(xml, result);
			Assert.areEqual(f.toXMLString(), xml.toXMLString());

			xml = new XML("<a><c></c></a>");
			child = new XML("<b></b>");
			f = new XML("<a><c></c><b></b></a>");
			result = xml.appendChild(child);
			Assert.areEqual(result.toXMLString(), xml.toXMLString());
			Assert.areEqual(f.toXMLString(), xml.toString());
		},
		testPrependChild: function(){
			var xml = new XML("<a></a>");
			var child = new XML("<b></b>");
			var f = new XML("<a><b></b></a>");
			var result = xml.prependChild(child);
			Assert.areSame(result, xml);
			Assert.areEqual(f.toXMLString(), xml.toXMLString());

			xml = new XML("<a><c></c></a>");
			child = new XML("<b></b>");
			f = new XML("<a><b></b><c></c></a>");
			result = xml.prependChild(child);
			Assert.areSame(result, xml);
			Assert.areEqual(f.toXMLString(), xml.toString());
		},
		testNormalize: function(){
			var xml = new XML("<a></a>");
			xml.appendChild("hello");
			Assert.areEqual(1, xml._children.length);
			xml.appendChild(" world");
			Assert.areEqual(2, xml._children.length);
			xml.normalize();
			Assert.areEqual(1, xml._children.length);

			var f = new XML("<a>hello world</a>");
			Assert.areEqual(f.toXMLString(), xml.toXMLString());
		},
		testChild: function(child){
			var xml = new XML("<a><b>b</b><c>c</c><c>c2</c></a>");
			Assert.areEqual(XML, xml.child('b').constructor);
			Assert.areEqual(XMLList, xml.child('c').constructor);
			

			XML.ignoreComments = true;
			xml = new XML("<a><!--pre comments--><b>b</b><c>c</c><c>c2</c><?post ps ?></a>");
			Assert.areEqual(3,  xml._getFilterChildren().length);

			XML.ignoreComments = false;
			xml = new XML("<a><!--pre comments--><b>b</b><c>c</c><c>c2</c><?post ps ?></a>");
			var newIndex = xml.child('b').childIndex();
			XML.ignoreComments = true;
			Assert.areEqual(1, newIndex);

			xml = new XML("<a>1</a>");
			Assert.areEqual('1', xml.children().toXMLString(), "xml' s toXMLString should be 1");
			Assert.areEqual('1', xml.children().toString(), "xml' s toString should be 1");
			
		},
		testChildren: function(child){
			var xml = new XML("<a><!--pre comments--><b>b</b><c>c</c><c>c2</c><?post ps ?></a>");
			Assert.areEqual(3, xml.children().length());

			XML.ignoreComments = false;
			var l2 = xml.children().length();
			XML.ignoreComments = true;
			Assert.areEqual(4, l2);
			
			XML.ignoreComments = false;
			XML.ignoreProcessingInstructions = false;
			var l3 = xml.children().length();
			XML.ignoreComments = true;
			XML.ignoreProcessingInstructions = true;
			Assert.areEqual(5, l3);
		},
		testInsertChildBefore: function(){
			var child = new XML("<b></b>");
			var xml = new XML("<a><c></c><d></d></a>");
			var f1 = new XML("<a><b></b><c></c><d></d></a>");
			var f2 = new XML("<a><c></c><b></b><d></d></a>");
			var f3 = new XML("<a><c></c><d></d><b></b></a>");
	
			var result = xml.insertChildBefore(xml.child('c'), child);
			Assert.areSame(result, xml);
			Assert.areEqual(f1.toXMLString(), result.toXMLString());

			 xml = new XML("<a><c></c><d></d></a>");
			 result = xml.insertChildBefore(xml.child('d'), child);
			 Assert.areSame(result, xml);
			Assert.areEqual(f2.toXMLString(), result.toXMLString());

			xml = new XML("<a><c></c><d></d></a>");
			child = new XML("<b><e></e><e></e></b>");
			var f4 = new XML("<a><e></e><e></e><c></c><d></d></a>");
			result = xml.insertChildBefore(xml.child('c'), child.child('e'));
			Assert.areEqual(f4.toXMLString(), result.toXMLString());

			xml = new XML("<a><c></c><d></d></a>");
			child = new XML("<b></b>");
			result = xml.insertChildBefore(null, child);
			Assert.areSame(result, xml);
			Assert.areEqual(f3.toXMLString(), result.toXMLString());
			
			xml = new XML("<a><c></c><d></d></a>");
			var xmlCopy = new XML("<a><c></c><d></d>what</a>");
			result = xml.insertChildBefore(null, "what");
			Assert.isNotUndefined(result, "result should not be undefined");
			Assert.areEqual(xmlCopy.toXMLString(), xml.toXMLString());
		},

		testInsertChildAfter: function(){
			var child = new XML("<b></b>");
			var xml = new XML("<a><c></c><d></d></a>");
			var f1 = new XML("<a><c></c><b></b><d></d></a>");
			var f2 = new XML("<a><c></c><d></d><b></b></a>");
			var f3 = new XML("<a><b></b><c></c><d></d></a>");
			var result = xml.insertChildAfter(xml.child('c'), child);
			Assert.areSame(result, xml);
			Assert.areEqual(f1.toXMLString(), result.toXMLString());
			
			 xml = new XML("<a><c></c><d></d></a>");
			 result = xml.insertChildAfter(xml.child('d'), child);
			 Assert.areSame(result, xml);
			Assert.areEqual(f2.toXMLString(), result.toXMLString());

			xml = new XML("<a><c></c><d></d></a>");
			child = new XML("<b><e></e><e></e></b>");
			var f4 = new XML("<a><c></c><e></e><e></e><d></d></a>");
			result = xml.insertChildAfter(xml.child('c'), child.child('e'));
			Assert.isNotUndefined(result);
			Assert.areEqual(f4.toXMLString(), result.toXMLString());

			xml = new XML("<a><c></c><d></d></a>");
			child = new XML("<b></b>");
			result = xml.insertChildAfter(null, child);
			Assert.areSame(result, xml);
			Assert.areEqual(f3.toXMLString(), result.toXMLString());
			
			xml = new XML("<a><c></c><d></d></a>");
			var xmlCopy = new XML("<a>what<c></c><d></d></a>");
			result = xml.insertChildAfter(null, "what");
			Assert.isNotUndefined(result, "result should not be undefined");
			Assert.areEqual(xmlCopy.toXMLString(), xml.toXMLString())
		},
		testParent: function(){
			var xml = new XML("<a><b></b></a>");
			var child = xml.child('b');
			Assert.areEqual(xml.toXMLString(), child.parent().toXMLString());

			xml = new XML("<a><b><c></c></b></a>");
			var child1 = xml.child('b');
			var child2 = child1.child('c');
			Assert.areEqual(child1.toXMLString(), child2.parent().toXMLString());
			Assert.areEqual(xml.toXMLString(), child1.parent().toXMLString())
		},
		testText: function(){
			var xml = new XML("<a>1<b>2</b>3</a>");
			Assert.areEqual("13", xml.text().toString());
		},
		testSetChildren: function(){
			var xml = new XML("<a>a<b>b</b></a>");
			xml.setChildren("new");
			Assert.areEqual("<a>new</a>", xml.toXMLString());

			xml.setChildren(new XML("<b>b</b>"));
			Assert.areEqual("<a>\n  <b>b</b>\n</a>", xml.toString());
			
			var list = (new XML("<a><b>1</b><b>2</b></a>")).child("b");
			xml.setChildren(list);
			Assert.areEqual(2, list.length()); 
			Assert.areEqual("<a>\n  <b>1</b>\n  <b>2</b>\n</a>", xml.toString());
		},
		testReplace: function(){
			var xml = new XML("<a>before<b>b</b>after<b>b</b></a>");
			xml.replace("b", "__replace__");
			var compareXML = new XML("<a>before__replace__after</a>");
			Assert.areEqual(compareXML.toXMLString(), xml.toXMLString());

		},
		testElements: function(){
			var xml = new XML("<a>a<b>b</b><c>c</c><!--comments--><?ins ?></a>");
			Assert.areEqual(2, xml.elements().length());
			Assert.areEqual(1, xml.elements('c').length());
			Assert.areEqual(0, xml.elements('d').length());
		},
		testDescendents: function(){
			var xml =new XML( "<a><b>b<b>2</b></b><c><b>3</b></c></a>" );
			
			var p = xml.child("null");
			p._addXML(new XML("<b>b<b>2</b></b>"));
			p._addXML(new XML("<b>2</b>"));
			p._addXML(new XML("<b>3</b>"));
			Assert.areEqual(p.toXMLString(), xml.descendants("b").toXMLString(), "b descendents shoud be equal:");

			p = xml.child("null");
			p._addXML(xml.child("b"));
			p._addXML(xml.child("b").text());
			p._addXML(xml.child("b").child("b"));
			p._addXML(xml.child("b").child("b").text());
			p._addXML(xml.child("c"));
			p._addXML(xml.child("c").child("b"));
			p._addXML(xml.child("c").child("b").text());
			Assert.areEqual(p.toXMLString(), xml.descendants().toXMLString(), "* descendants should be equal");
		},
		testAttribute: function(){
			var xml = new XML("<a b='1' c='2'/>");
			var attr = xml.attribute('b');
			Assert.areEqual(NodeKind.ATTRIBUTE, attr.nodeKind());
			Assert.areEqual('1', attr._text, 'attr._text should be 1');
			Assert.areEqual('1', attr.toString(), 'toString value should be 1');
			Assert.areEqual('1', attr.toXMLString());
			attr = xml.attribute('c');
			Assert.areEqual('2', attr.toString());
			Assert.areEqual('2', attr.toXMLString());
		},
		testAttributes: function(){
			var xml = new XML("<a b='1' c='2'/>");
			var attrs = xml.attributes();
			Assert.areEqual(XMLList, attrs.constructor);
			Assert.areEqual('12', attrs.toString());
			Assert.areEqual('1\n2', attrs.toXMLString());
			Assert.areEqual(2, attrs.length());
			Assert.areEqual(0, attrs.children().length());
		},
		testComments: function(){
			XML.ignoreComments = false;
			var xml = new XML("<!--pre comments--><a><!--inner1--><!--inner2--><b><!--child inner--></b></a><!--post comments-->");
			var s = xml.comments();
			XML.ignoreComments = true;
			
			Assert.areEqual(XMLList, s.constructor);
			Assert.areEqual(2, s.length());

		},
		testHasSimpleContent: function(){
			var xml = new XML("<a>hello, jsxml</a>");
			Assert.isTrue(xml.hasSimpleContent());
			Assert.isFalse(xml.hasComplexContent());

			xml = new XML("<a>hello, jsxml<!--comments--><?instruction?></a>");
			Assert.isTrue(xml.hasSimpleContent());
			Assert.isFalse(xml.hasComplexContent());

			xml = new XML("<a><b/></a>");
			Assert.isFalse(xml.hasSimpleContent());
			Assert.isTrue(xml.hasComplexContent());

			xml = new XML("<a>hello, jsxml<b/></a>");
			Assert.isFalse(xml.hasSimpleContent());
			Assert.isTrue(xml.hasComplexContent());

		},
		testToXMLString: function(){
			XML.ignoreComments = true;
			XML.ignoreProcessingInstructions = true;

			var xml = new XML("<a>hello, jsxml</a>");
			Assert.areEqual("<a>hello, jsxml</a>", xml.toXMLString());

			xml = new XML("<a><b>hello, jsxml</b></a>");
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toXMLString());

			xml = new XML("<a><b>hello, jsxml<!--comment--></b></a>");
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toXMLString());
			
			XML.prettyPrinting = false;
			var xmlstr = xml.toXMLString();
			XML.prettyPrinting = true;
			Assert.areEqual("<a><b>hello, jsxml</b></a>", xmlstr);
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toXMLString());

			
			xml = new XML("<a><b>hello, jsxml<!--comment--><?instruction?></b></a>");
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toXMLString());
			
		
			XML.ignoreComments = false;
			xml = new XML("<a><b>hello, jsxml<!--comment--></b></a>");
			Assert.areEqual("<a>\n  <b>\n    hello, jsxml\n    <!--comment-->\n  </b>\n</a>", xml.toXMLString());
			XML.ignoreComments = true;
			
			XML.ignoreProcessingInstructions = false;
			xml = new XML("<a><b>hello, jsxml<!--comment--><?instruction?></b></a>");
			Assert.areEqual("<a>\n  <b>\n    hello, jsxml\n    <?instruction?>\n  </b>\n</a>", xml.toXMLString());
			XML.ignoreProcessingInstructions = true;

			xml = new XML("<a></a>");
			xml.appendChild("hello");
			Assert.areEqual(xml._children.length, 1);
			Assert.areEqual('<a>hello</a>', xml.toXMLString());
			xml.appendChild(",world");
			Assert.areEqual(xml._children.length, 2);
			Assert.areEqual(xml.toXMLString(), '<a>\n  hello\n  ,world\n</a>');
			
			xml = new XML("<ns:a xmlns:ns=\"uri\" m=\"1\">has attribute</ns:a>");
			Assert.areEqual("a", xml.localName());
			Assert.areEqual("uri:a", xml.name());
			Assert.areEqual("<ns:a xmlns:ns=\"uri\" m=\"1\">has attribute</ns:a>", xml.toXMLString());

		},
		testToString: function(){
			var xml = new XML("<a>hello</a>");
			Assert.areEqual("hello", xml.toString());
			
			xml.appendChild(",jsxml");
			Assert.areEqual("hello,jsxml", xml.toString());

			xml = new XML("<a><b>hello, jsxml</b></a>");
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toString());
			
			XML.prettyPrinting = false;
			var xmlstr = xml.toString();
			XML.prettyPrinting = true;
			Assert.areEqual("<a><b>hello, jsxml</b></a>", xmlstr);
			Assert.areEqual("<a>\n  <b>hello, jsxml</b>\n</a>", xml.toString());

		},
		testCopy: function(){
			var xml = new XML('<a b="1" c="2"><b></b><c><d></d></c></a>');
			var xmlCopy = xml.copy();
			Assert.areEqual(xml.toString(), xmlCopy.toString(), 'xmlCopy should has a same toString() value');
			Assert.areEqual(xml.toXMLString(), xmlCopy.toXMLString(), 'xmlCopy should has a same toXMLString() value');
		},

		testExample: function(){
			var xml = new XML(example);
			Assert.areEqual("a", xml.child('a').text().getValue());
			Assert.areEqual("e", xml.child('a').child('e').getValue());
			Assert.areEqual("b", xml.child('b').getValue());
			Assert.areEqual("1", xml.child('c').attribute('att').getValue());
			Assert.areEqual("inner tag: @#?&<>;'<p></p>", xml.child('p').getValue());
	
			xml.child('p').setChildren('<p></p>');
			Assert.isTrue(xml.child('p').text()._useCDATA, 'should auto use CDATA tag for special characters');
			xml.child('p').setChildren('ppppppp');
			Assert.isFalse(xml.child('p').text()._useCDATA, 'should not use CDATA tag for normal characters');
		},
		
		testSetSettings: function(){

			var sett = XML.settings();
			Assert.isTrue(sett.ignoreComments);
			Assert.isTrue(sett.ignoreProcessingInstructions);
			Assert.isTrue(sett.ignoreWhitespace);
			Assert.areEqual(2, sett.prettyIndent);
			Assert.isTrue(sett.prettyPrinting);
			
			sett.prettyIndex = 4;
			Assert.areEqual(2, XML.settings().prettyIndent);

			XML.setSettings({
				ignoreComments: false,
				ignoreProcessingInstructions: false,
				ignoreWhitespace: false,
				prettyIndent: 4
			});
			
			Assert.isFalse(XML.ignoreComments);
			Assert.isFalse(XML.ignoreProcessingInstructions);
			Assert.isFalse(XML.ignoreWhitespace);
			Assert.areEqual(4, XML.prettyIndent);
			Assert.isTrue(XML.prettyPrinting);
			
			XML.ignoreComments = true;
			XML.ignoreProcessingInstructions = true;
			XML.ignoreWhitespace = true;
			XML.prettyIndent = 2;
			XML.prettyPrinting = true;
		},
		testIgnoreComments: function(){
			Assert.isTrue(XML.ignoreComments);
		},
		testIgnoreProcessingInstructions: function(){
			Assert.isTrue(XML.ignoreProcessingInstructions);
		},
		testIgnoreWhitespace: function(){
			Assert.isTrue(XML.ignoreWhitespace);
		},
		testPrettyIndent: function(){
			Assert.areEqual(2, XML.prettyIndent);
		},
		testPrettyPrinting: function(){
			Assert.isTrue(XML.prettyPrinting);
		},
		//extension for javascript
		testGetValue: function(){
			var xml  = new XML("<a>xml</a>");
			var val = xml.getValue();
			Assert.areEqual('xml', val);
		},
		testSetValue: function(){
			var xml = new XML("<a>xml</a>");
			xml.setValue("new Value");
			Assert.areEqual("new Value", xml.getValue());
		},
		testEach: function(){
			var xml  = new XML("<a>xml</a>");
			var count = 0;
			xml.each(function(item, index, host){
				count++;
				Assert.areSame(xml, item);
				Assert.areEqual(xml, host);
				Assert.areEqual(0, index);
			});
			Assert.areEqual(1, count);
		}
	});
	
	//Runner
	Y.Test.Runner.add(qnameTestCase);
	Y.Test.Runner.add(nodekindTestCase);
	Y.Test.Runner.add(namespaceTestCase);
	Y.Test.Runner.add(xmllistTestCase);
	Y.Test.Runner.add(xmlTestCase);
	Y.Test.Runner.run();
	
});