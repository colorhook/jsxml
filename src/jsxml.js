/*!
 * Copyright 2011 http://colorhook.com.
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:1.0.0
 */
/**
 * @preserve Copyright 2011 http://colorhook.com.
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:1.0.0
 */
window.jsxml = (function(){
	
	// Regular Expressions for parsing tags and attributes
	var startTag = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/(\w+)[^>]*>/,
		attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
		_parseXML,
		Namespace,
		QName,
		NodeKind,
		XMLNode,
		XMLList,
		XML;
		
	

	 _parseXML = function(xml, handler ) {
		var index, chars, match, stack = [], last = xml;
		stack.last = function(){
			return this[ this.length - 1 ];
		};

		while (xml) {
			chars = true;
			
			 //CDATA
			 if(xml.indexOf("<![CDATA[") == 0){
			
				index = xml.indexOf("]]>");
				if(index > 0){
					xml = xml.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
						text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

						if ( handler.chars )
							handler.chars( text );

					});
					xml = xml.substring( index + 3 );
				}
				chars = false;
			}
			//instruction
			else if(xml.indexOf("<?") == 0){
				index = xml.indexOf("?>");
				if(index > 0){
					text = xml.substr(2, index-2);
					if(handler.instruction){
						handler.instruction(text);
					}
					xml = xml.substring( index + 2 );
				}
				chars = false;
			}
			// Comment
			else if ( xml.indexOf("<!--") == 0 ) {
				index = xml.indexOf("-->");

				if ( index >= 0 ) {
					if ( handler.comment )
						handler.comment( xml.substring( 4, index ) );
					xml = xml.substring( index + 3 );
					chars = false;
				}

			// end tag
			} else if ( xml.indexOf("</") == 0 ) {
				match = xml.match( endTag );

				if ( match ) {
					xml = xml.substring( match[0].length );
					match[0].replace( endTag, parseEndTag );
					chars = false;
				}

			// start tag
			} else if ( xml.indexOf("<") == 0 ) {
				match = xml.match( startTag );

				if ( match ) {
					xml = xml.substring( match[0].length );
					match[0].replace( startTag, parseStartTag );
					chars = false;
				}
			}

			if ( chars ) {
				index = xml.indexOf("<");
				
				var text = index < 0 ? xml : xml.substring( 0, index );
				xml = index < 0 ? "" : xml.substring( index );
				
				if ( handler.chars )
					handler.chars( text );
			}

	
			if ( xml == last )
				throw "Parse Error: " + xml;
			last = xml;
		}
		
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag(tag, tagName, rest, unary ) {


			parseEndTag( "", tagName );
			unary =  !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						name ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			// If no tag name is provided, clean shop
			if ( !tagName )
				var pos = 0;
				
			// Find the closest opened tag of the same type
			else
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;
			
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );
				
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
	};

	/**
	 * @description Namespace
	 */
	Namespace = function(prefix, uri){
		var len = arguments.length;
		if(len >= 2){
			this.prefix = String(prefix);
			this.uri = String(uri);
		}else if(len == 1){
			this.prefix = "";
			this.uri = String(prefix);
		}else{
			this.prefix = "";
			this.uri =  "";
		}
	}

	Namespace.prototype = {
		constructor: Namespace,
		toString: function(){
			return this.uri;
		}
	}
	/**
	 * @description QName
	 */
	 QName = function(uri, localName){
		var len = arguments.length;
		if(len >= 2){
			this.uri = String(uri);
			this.localName = String(localName);
		}else if(len == 1){
			this.uri = "";
			this.localName = String(uri);
		}else{
			this.uri = "";
			this.localName =  "";
		}
	 }
	 QName.prototype = {
		constructor: QName,
		toString: function(){
			var r = this.uri ? this.uri + "::" : "";
			return r +this.localName;
		}
	 }
	/**
	 * @description NodeKind
	 */
	 NodeKind = {
		 'ELEMENT': 'element',
		 'COMMENT': 'comment',
		 'PROCESSING_INSTRUCTION': 'processing-instruction',
		 'TEXT': 'text',
		 'ATTRIBUTE': 'attribute'
	 }
	 /**
	  * @description XMLNode
	  */
	 XMLNode= function(children, attributes, nodeKind){
		 this.children = children || [];
		 this.attributes = attributes || [];
		 this._nodekind = nodeKind || NodeKind.ELEMENT;
		 this._parent = null;
	 }
	 XMLNode.prototype = {
		constructor: XMLNode
	 }
	/**
	 * @description XML
	 */
	XML = function(str){
		
	}
	
	XML.prototype = {
		constructor: XML
	}
	
	//static properties
	XML.ingoreComments = true;
	XML.ignoreProcessingInstructions = true;
	XML.ignoreWhitespace = true;
	XML.prettyIndent = 2;
	XML.prettyPrinting = true;
	
	//return global object jsxml
	return {
		parseXML: _parseXML,
		Namespace: Namespace,
		QName: QName,
		NodeKind: NodeKind,
		XML: XML
	}
})();