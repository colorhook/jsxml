YUI().use('test', function(Y){


	var Assert = Y.Assert,
		XML = jsxml.XML,
		Namespace = jsxml.Namespace;
		
	var namespaceTestcase = new Y.Test.Case({
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
	
	Y.Test.Runner.add(namespaceTestcase);
	Y.Test.Runner.add(xmlTestCase);
	Y.Test.Runner.run();
	
});