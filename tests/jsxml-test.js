YUI().use('test', function(Y){


	var Assert = Y.Assert,
		XML = jsxml.XML,
		XMLList = jsxml.XMLList,
		QName = jsxml.QName,
		NodeKind = jsxml.NodeKind,
		XMLNode = jsxml.XMLNode,
		Namespace = jsxml.Namespace,
		example = "<?xml version='1.0' encoding='utf-8'?>"
			+"<xml>sss"
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
			Assert.areEqual(NodeKind.PROCESSING_INSTRUCTION, 'processing-instruction');
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
		}
	});
	//XMLNode TestCase
	var xmlNodeTestCase = new Y.Test.Case({
		name: "jsxml.XMLNode TestCase",
		testConstructor: function(){
			Assert.isFunction(XMLNode);
			Assert.isTrue(XMLNode, (new XMLNode()).constructor);
		}
	});
	//XML TestCase
	var xmlTestCase = new Y.Test.Case({

		name: "jsxml.XML TestCase",
		

		testConstructor: function(){
			Assert.isFunction(XML);
			Assert.areEqual(XML, (new XML()).constructor);
		},
		testIgnoreComments: function(){
			Assert.isTrue(XML.ingoreComments);
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
		testAddNamespace: function(){
			var xml  = new XML();
		}

	});
	
	//Runner
	Y.Test.Runner.add(qnameTestCase);
	Y.Test.Runner.add(nodekindTestCase);
	Y.Test.Runner.add(namespaceTestCase);
	Y.Test.Runner.add(xmlNodeTestCase);
	Y.Test.Runner.add(xmlTestCase);
	Y.Test.Runner.run();
	
});