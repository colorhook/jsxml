/*!
 * Copyright 2011 http://colorhook.com.
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:0.3.0
 */
/**
 * @preserve Copyright 2011 http://colorhook.com.
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:0.3.0
 */

(function() {

  /**
   * XML parser comes from HTML Parser by John Resig (ejohn.org)
   * http://ejohn.org/files/htmlparser.js
   * Original code by Erik Arvidsson, Mozilla Public License
   * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
   */
  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([0-9a-zA-Z\$_\.]+:{0,1}[a-zA-Z0-9\$\-_]*)((?:\s+[a-zA-Z\$_]+:{0,1}[a-zA-Z0-9\$\-_]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([a-zA-Z0-9\$\-_\.:]+)[^>]*>/,
    attr = /([a-zA-Z\$_]+:{0,1}[a-zA-Z0-9\$\-_]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
    _parseXML,
    trim,
    merge,
    containsEntity,
    replaceToEntity,
    replaceFromEntity,
    Namespace,
    QName,
    NodeKind,
    _getXMLIfLengthEqualOne,
    XMLList,
    XML;

  /**
   * @description trim whitespace before or after the String
   * @param s{String}
   * @return String
   */
  trim = String.prototype.trim ? function(s) {
    return s && s.trim ? s.trim() : s;
  } : function(s) {
    try {
      return s.replace(/^\s+|\s+$/g, '');
    } catch (err) {
      return s;
    }
  };
  /**
   * @description merge one object to another, used to extend object.
   *   because of the toString property is not enumerable in IE browser,
   *   so we must assign it explicity.
   * @param s1{Object} object need to be extended.
   * @param s2{Object} extension object
   * @return Object
   */
  merge = function(s1, s2) {
    for (var i in s2) {
      if (s2.hasOwnProperty(i)) {
        s1[i] = s2[i];
      }
    }
    //fix IE toString() not Enumerable bug
    if (!-[1, ]) {
      if (s2.toString !== Object.prototype) {
        s1.toString = s2.toString;
      }
    }
  };
  /**
   * @description find element's index from an array.
   * @param array{Array} the array hosting the element
   * @param ele{Object} the element in the array
   * @return Number
   */
  arrayIndexOf = function(array, ele) {
    if (array.indexOf) {
      return array.indexOf(ele);
    }
    for (var i = 0, l = array.length; i < l; i++) {
      if (ele === array[i]) {
        return i;
      }
    }
    return -1;
  };
  /**
   * @description check if the string contains XML entity format(&amp; &lt; &gt;) or not.
   * @param str{String}
   * @return Boolean
   */
  containsEntity = function(str) {
    return str.match(/&(amp|lt|gt);/);
  };
  /**
   * @description convert special characters (& < >) to XML entity format.
   * @param str{String}
   * @return String
   */
  replaceToEntity = function(str) {
    str = str.replace(/&[^(amp;|lt;|gt;)]/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    return str;
  }
  /**
   * @description convert from XML entity format to readable characters.
   * @param str{String}
   * @return String
   */
  replaceFromEntity = function(str) {
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&amp;/g, '&');
    return str;
  }
  /**
   * @description parse XML string
   * @param xml{String} XML string
   * @param handler{Object} callback handler
   * @return void
   */
  _parseXML = function(xml, handler) {
    var index, chars, match, stack = [],
      last = xml;
    stack.last = function() {
      return this[this.length - 1];
    };
    while (xml) {
      chars = true;

      //CDATA
      if (xml.indexOf("<![CDATA[") == 0) {

        index = xml.indexOf("]]>");
        if (index > 0) {
          text = xml.substring(9, index);

          if (handler.chars)
            handler.chars(text, true);

          xml = xml.substring(index + 3);
        } else {
          throw new Error('[XML Parse Error] the CDATA end tag not found: ' + xml);
        }
        chars = false;
      } else if (xml.indexOf("<?") == 0) {

        //Instruction
        index = xml.indexOf("?>");
        if (index > 0) {
          text = xml.substr(2, index - 2);
          if (handler.instruction) {
            handler.instruction(text);
          }
          xml = xml.substring(index + 2);
        } else {
          throw new Error('[XML Parse Error] the Instruction end tag not found: ' + xml);
        }
        chars = false;
      } else if (xml.indexOf("<!--") == 0) {

        // Comment
        index = xml.indexOf("-->");

        if (index >= 0) {
          if (handler.comment)
            handler.comment(xml.substring(4, index));
          xml = xml.substring(index + 3);
          chars = false;
        } else {
          throw new Error('[XML Parse Error] the Comment end tag not found: ' + xml);
        }
      } else if (xml.indexOf("<!") == 0) {

        //doctype
        var m = xml.match(/<!DOCTYPE[^<>]*(<![^<>]*>)*[^<>]*>/i);
        if (m && m[0]) {
          var doctype = m[0];
          index = doctype.length;
          text = xml.substr(2, index - 3);
          if (handler.doctype) {
            handler.doctype(text);
          }
          xml = xml.substring(index);
          chars = false;
        }
      } else if (xml.indexOf("</") == 0) {

        // end tag
        match = xml.match(endTag);

        if (match) {
          xml = xml.substring(match[0].length);
          match[0].replace(endTag, parseEndTag);
          chars = false;
        } else {
          throw new Error('[XML Parse Error] the end tag is invalid: ' + xml);
        }
      } else if (xml.indexOf("<") == 0) {

        // start tag
        match = xml.match(startTag);
        if (match) {
          xml = xml.substring(match[0].length);
          match[0].replace(startTag, parseStartTag);
          chars = false;
        } else {
          throw new Error('[XML Parse Error] the start tag is invalid: ' + xml.substring(0,100));
        }
      }

      if (chars) {
        index = xml.indexOf("<");

        var text = index < 0 ? xml : xml.substring(0, index);
        xml = index < 0 ? "" : xml.substring(index);

        if (handler.chars)
          handler.chars(text);
      }


      if (xml == last)
        throw new Error("[XML Parse Error] " + xml)
      last = xml;
    }

    // Check the tag closed
    if (stack.length) {
      throw new Error("[XML Parse Error] There is tag not closed " + stack.last());
    }

    function parseStartTag(tag, tagName, rest, unary) {

      unary = !! unary;

      if (!unary)
        stack.push(tagName);

      if (handler.start) {
        var attrs = [];

        rest.replace(attr, function(match, name) {
          var value = arguments[2] ? arguments[2] :
            arguments[3] ? arguments[3] :
            arguments[4] ? arguments[4] : "";

          attrs.push({
            name: name,
            value: value,
            escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
          });
        });

        if (handler.start)
          handler.start(tagName, attrs, unary);
      }
    }

    function parseEndTag(tag, tagName) {
      if (!tagName) {
        stack.length = 0;
        return;
      }
      if (!stack.length) {
        throw new Error("[XML Parse Error] Cannot find the start tag for the end tag " + tagName);
      }
      var startTag = stack.last();
      if (startTag != tagName) {
        throw new Error("[XML Parse Error] End tag " + tagName + " is not match the start tag " + startTag);
      }
      stack.length = stack.length - 1;
      if (handler.end) {
        handler.end(startTag);
      }
      return;
      // If no tag name is provided, clean shop
      if (!tagName)
        var pos = 0;

      // Find the closest opened tag of the same type
      else
        for (var pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;

      if (pos >= 0) {
        // Close all the open elements, up the stack
        for (var i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);

          // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  };

  /**
   * @description Namespace class
   * @access public
   * @param prefix{String} the namespace prefix
   * @param uri{String} the namespace uri.
   */
  Namespace = function(prefix, uri) {
    var len = arguments.length;
    if (len >= 2) {
      this.prefix = String(prefix);
      this.uri = String(uri);
    } else if (len == 1) {
      this.prefix = "";
      this.uri = String(prefix);
    } else {
      this.prefix = "";
      this.uri = "";
    }
  }

  Namespace.prototype = {
    constructor: Namespace,

    /**
     * @description to string
     * @access public
     * @return String
     */
    toString: function() {
      return this.uri;
    },
    /**
     * @description return a Namespace copy object
     * @access public
     * @return Namespace
     */
    copy: function() {
      var ns = new Namespace();
      ns.prefix = this.prefix;
      ns.uri = this.uri;
      return ns;
    },
    /**
     * @description check if the two Namespace are equivalent
     * @access public
     * @return Boolean
     */
    equals: function(ns) {
      return this.prefix === ns.prefix && this.uri === ns.uri;
    }
  }
  /**
   * @description QName class
   * @access public
   * @param uri {Namespace | String}
   * @param localName {String}
   */
  QName = function(uri, localName) {
    var len = arguments.length;
    if (len >= 2) {
      this.uri = String(uri);
      this._ns = (uri && uri.constructor == Namespace) ? uri : new Namespace(uri);
      this.localName = String(localName);
    } else if (len == 1) {
      this.uri = "";
      this._ns = new Namespace();
      this.localName = String(uri);
    } else {
      this.uri = "";
      this._ns = new Namespace();
      this.localName = "";
    }
  }
  QName.prototype = {
    constructor: QName,

    /**
     * @description to string
     * @return String
     */
    toString: function() {
      var r = this.uri ? this.uri + "::" : "";
      return r + this.localName;
    },
    /**
     * @description return a QName copy object
     * @return QName
     */
    copy: function() {
      var qn = new QName();
      qn.uri = this.uri;
      qn.localName = this.localName;
      qn._ns = this._ns.copy();
      return qn;
    },
    /**
     * @description check if the two QName are equivalent
     * @access public
     * @return Boolean
     */
    equals: function(qname) {
      return this.localName == qname.localName && this._ns.equals(qname._ns);
    }
  }
  /**
   * @description parse a name & value to a QName
   * @access internal
   * @static
   * @param name{String} namespace declaration name
   * @param value{String} namespace declaration value
   * @return QName
   */
  QName._format = function(name, value) {
    var temp = name.split(":"),
      prefix, localName;
    if (temp.length == 2) {
      prefix = temp[0];
      localName = temp[1];
    } else {
      prefix = '';
      localName = name;
    }
    return new QName(new Namespace(prefix, value), localName);
  }
  /**
   * @description NodeKind class
   * @static
   */
  NodeKind = {
    'DOCTYPE': 'doctype',
    'ELEMENT': 'element',
    'COMMENT': 'comment',
    'PROCESSING_INSTRUCTIONS': 'processing-instructions',
    'TEXT': 'text',
    'ATTRIBUTE': 'attribute'
  }

  /**
   * @description get a suitable class for XML operations by the XMLList.
   *   if the list contains only one child, then return the child XML.
   * @return XML|XMLList
   */
  _getXMLIfLengthEqualOne = function(list) {
    if (list._list && list.length() == 1) {
      return _getXMLIfLengthEqualOne(list._list[0]);
    }
    return list;
  };
  /**
   * @description XMLList is a XML collection
   * @param null
   */
  XMLList = function() {
    this._list = [];
  }
  merge(XMLList.prototype, {
    constructor: XMLList,

    /**
     * @description add a xml to the list
     * @access private
     * @return XMLList
     */
    _addXML: function(xml) {
      if (xml.constructor == XML) {
        this._list.push(xml);
      } else if (xml.constructor == XMLList) {
        this._list = this._list.concat(xml._list);
      }
      return this;
    },
    /**
     * @description get the list length
     * @access public
     * @return int
     */
    length: function() {
      return this._list.length;
    },
    /**
     * @description you cannot call this method in a list, only XML owns childIndex method.
     * @access none
     * @return void
     */
    childIndex: function() {
      throw new Error("this method only availabe in single list XML");
    },
    /**
     * @description return all the child by localName in this xml list.
     * @access public
     * @return XMLList | XML
     */
    child: function(p) {
      var list = new XMLList();
      this.each(function(item) {
        var child = item.child(p);
        if (child.length()) {
          list._addXML(child);
        }
      });
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return all the child in this xml list.
     * @access public
     * @return XMLList | XML
     */
    children: function() {
      return this.child('*');
    },
    /**
     * @description return a special attribute type child by parameter
     * @access public
     * @param p{String} if the p is '*', return all attributes
     * @return XML | XMLList
     * @see attributes
     */
    attribute: function(p) {
      var list = new XMLList();
      this.each(function(item) {
        list._addXML(item.attribute(p));
      });
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return all attribute type child.
     * @access public
     * @return XML | XMLList
     * @see attribute
     */
    attributes: function() {
      return this.attribute('*');
    },
    /**
     * @description find special elements child from the XMLList tree top.
     * @access public
     * @param p{String} the element localName, if the localName is '*', return all the element child.
     * @return XML | XMLList
     */
    elements: function(p) {
      var list = new XMLList();
      this.each(function(item) {
        list._addXML(item.elements(p));
      });
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description find descendants child from the XMLList tree top.
     * @access public
     * @param p{String} the descendant localName, if the localName is '*', return all the descendants.
     * @return XML | XMLList
     */
    descendants: function(p) {
      var list = new XMLList();
      this.each(function(item) {
        list._addXML(item.descendants(p));
      });
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description merge multi text childs nearby to one text child of each list item.
     * @access public
     * @return void
     */
    normalize: function() {
      this.each(function(item) {
        item.normalize();
      });
    },
    /**
     * @description check if all the list item owns simple content only
     * @access public
     * @return Boolean
     * @see hasComplexContent
     */
    hasSimpleContent: function() {
      for (var i = 0, l = this._list.length; i < l; i++) {
        var item = this._list[i];
        if (item.constructor == XMLList ||
          item.hasComplexContent()) {
          return false;
        }
      }
      return true;
    },
    /**
     * @description check if all the list item owns simple content only
     * @access public
     * @return Boolean
     * @see hasSimpleContent
     */
    hasComplexContent: function() {
      return !this.hasSimpleContent();
    },
    /**
     * @description return the text type child
     * @access public
     * @return XML
     */
    text: function() {
      var xml = new XMLList();
      this.each(function(item) {
        if (item.constructor == XML) {
          var t = item.text();
          if (t._text != "") {
            xml._addXML(t);
          }
        }
      });
      return _getXMLIfLengthEqualOne(xml);
    },
    /**
     * @description return the comment type child
     * @access public
     * @return XML | XMLList
     */
    comments: function() {
      var xml = new XMLList();
      this.each(function(item) {
        if (item.constructor == XML) {
          xml._addXML(item.comments());
        }
      });
      return _getXMLIfLengthEqualOne(xml);
    },
    /**
     * @description return the XML processing-instructions.
     * @access public
     * @return XMLList | XML
     */
    processingInstructions: function() {
      var xml = new XMLList();
      this.each(function(item) {
        if (item.constructor == XML) {
          xml._addXML(item.processingInstructions());
        }
      });
      return _getXMLIfLengthEqualOne(xml);
    },
    /**
     * @description return an XMLList copy object.
     * @access public
     * @return XMLList
     */
    copy: function() {
      var list = new XMLList();
      this.each(function(item, i) {
        list._list[i] = item.copy();
      });
      return list;
    },
    /**
     * @description return toXMLString of all the list item
     * @access public
     * @return String
     */
    toXMLString: function() {
      var s = [];
      this.each(function(item) {
        s.push(item.toXMLString());
      });
      return s.join("\n");
    },
    /**
     * @description return toString of all the list item.
     * @access public
     * @return String
     */
    toString: function() {
      var s = "";
      this.each(function(item) {
        s += item.toString();
      });
      return s;
    },
    //===================extension for javascript=================
    /**
     * @description return a special item by item index.
     * @access public
     * @param n{int} the item index
     * @return XML
     */
    item: function(n) {
      return this._list[n];
    },
    /**
     * @description for loop the list item.
     * @access public
     * @param func{Function} the callback handler
     * @return void
     */
    each: function(func) {
      for (var i = 0, l = this._list.length; i < l; i++) {
        func(this._list[i], i, this);
      }
    }
  });
  /**
   * @description XML class
   * @param str{String}
   */
  XML = function(str, debug) {
    this._children = [];
    this._attributes = [];
    this._namespaces = [];
    this._doctypes = [];
    this._nodeKind = NodeKind.ELEMENT;
    this._qname = null;
    this._parent = null;
    this._text = null;
    this._useCDATA = false;

    var current,
      self = this;

    _parseXML(str, {
      start: function(tag, attrs, unary) {
        var xml;
        if (!current) {
          if (XML.createMainDocument) {          
              xml = new XML();
              xml._parent = self;
          } else {
            xml = self;
          }
        } else {
          xml = new XML();
          xml._parent = current;
        }
        xml._qname = QName._format(tag);
        for (var i in attrs) {
          var attr = new XML();
          attr._nodeKind = NodeKind.ATTRIBUTE;
          var _qname;
          if (attrs[i].name === 'xmlns') {
            _qname = new QName(new Namespace('xmlns', attrs[i].value), '');
          } else {
            _qname = QName._format(attrs[i].name, attrs[i].value);
          }
          var prefix = _qname._ns.prefix || "";

          if (prefix === 'xmlns') {
            var ns = new Namespace(_qname.localName, _qname.uri);
            xml.addNamespace(ns);
            if (_qname.localName == xml._qname._ns.prefix) {
              xml.setNamespace(ns);
            }
          } else {
            attr._qname = _qname;
            attr._text = attrs[i].value;
            xml._attributes.push(attr);
          }
        }
        current = xml;
        if (unary) {
          this.end(tag);
        }
      },
      chars: function(text, useCDATA) {
        text = trim(text);
        if (text == "" && XML.ignoreWhitespace) {
          return;
        }
        var el = new XML();
        el._nodeKind = NodeKind.TEXT;
        el._text = text;
        el._useCDATA = useCDATA;
        current._children.push(el);
      },
      end: function(tag) {
        if (current && current._parent) {
          current._parent._children.push(current);
          current = current._parent;
        } else if (current == self) {
          current = null;
        }
      },
      comment: function(value) {
	    if (!current && XML.createMainDocument) {
			current = self;
		}
        var el = new XML();
        el._nodeKind = NodeKind.COMMENT;
        el._text = value;
        current && current._children.push(el);
      },
      instruction: function(value) {
        if (!current && XML.createMainDocument) {
			current = self;
		}
      	
        var el = new XML();
        el._nodeKind = NodeKind.PROCESSING_INSTRUCTIONS;
        el._text = value;
        current && current._children.push(el);
      },
      doctype: function(value) {
        var el = new XML();
        el._nodeKind = NodeKind.DOCTYPE;
        el._text = value;
        if (current) {
          current._children.push(el);
        } else {
          self._doctypes.push(el);
        }
      }
    });

  }

  merge(XML.prototype, {
    /**
     * @description add new namespace to this XML
     * @access public
     * @param ns{Namespace}
     * @return void
     */
    addNamespace: function(ns) {
      if (ns.prefix != undefined) {
        this.removeNamespace(ns);
        this._namespaces.push(ns);
      }
    },
    /**
     * @description remove a namespace from this XML
     * @access public
     * @param ns{Namespace}
     * @return void
     */
    removeNamespace: function(ns) {
      for (var i = 0, l = this._namespaces.length; i < l; i++) {
        if (ns.prefix == this._namespaces[i].prefix) {
          this._namespaces.splice(i, 1);
          break;
        }
      }
    },
    /**
     * @description reture a namespace by prefix
     * @access public
     * @param prefix{String}
     * @return Namespace
     */
    namespace: function(prefix) {
      if (!prefix) {
        return new Namespace();
      }
      for (var i = 0, l = this._namespaces.length; i < l; i++) {
        if (prefix == this._namespaces[i].prefix) {
          return this._namespaces[i];
        }
      }
      return undefined;
    },
    /**
     * @description set the namespace for this XML
     * @access public
     * @param ns{Namespace}
     * @return void
     */
    setNamespace: function(ns) {
      if (ns && ns.constructor == Namespace) {
        this.addNamespace(ns);
        if (this._qname) {
          this._qname.uri = ns.uri;
          this._qname._ns = ns;
        }
      }
    },
    /**
     * @description return declarated namespace of this XML
     * @access public
     * @return Array
     */
    namespaceDeclarations: function() {
      return this._namespaces;
    },
    /**
     * @description return declarated namespace of this XML and all parent XML.
     * @access public
     * @return Array
     */
    inScopeNamespaces: function() {
      var array = this._namespaces;
      var chain = this._parent;
      while (chain) {
        array = chain.inScopeNamespaces().concat(array);
        chain = chain._parent;
      }
      return array;
    },
    /**
     * @description return the nodekind of this element
     * @access public
     * @return String
     * @see NodeKind
     */
    nodeKind: function() {
      return this._nodeKind;
    },
    /**
     * @description return the full name (with declarated namespace) of this xml
     * @access public
     * @return String
     * @see localName
     */
    name: function() {
      if (!this._qname) {
        return null;
      }
      if (this._qname.uri) {
        return this._qname.uri + ":" + this._qname.localName;
      }
      return this._qname.localName;
    },
    /**
     * @description return the local name (without declarated namespace) of this xml
     * @access public
     * @return String
     * @see name
     */
    localName: function() {
      if (!this._qname) {
        return null;
      }
      return this._qname.localName;
    },
    /**
     * @description set the full name (with declarated namespace) of this xml
     * @access public
     * @return void
     * @see name
     */
    setName: function(name) {
      if (this._qname == null) {
        return;
      }
      if (/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(name)) {
        this._qname.uri = "";
        this._qname.localName = name;
      } else {
        throw new Error("invalid value for XML name");
      }
    },
    /**
     * @description set the local name (without declarated namespace) of this xml
     * @access public
     * @return void
     * @see localName
     */
    setLocalName: function(name) {
      if (this._qname == null) {
        return;
      }
      if (/^[a-zA-Z\$_]+[a-zA-Z0-9\$\-_]*$/.test(name)) {
        this._qname.localName = name;
      } else {
        throw new Error("invalid value for XML localName");
      }
    },
    /**
     * @description get the length of this xml tree, return 1 always for XML.
     * @access public
     * @return int
     */
    length: function() {
      return 1;
    },
    /**
     * @description return a special attribute type child by param
     * @access public
     * @param p{String} if the p is '*', return all attributes
     * @return XML | XMLList
     * @see attributes
     */
    attribute: function(p) {
      var attributes = this._attributes,
        i,
        l,
        item,
        list = new XMLList();
      for (i = 0, l = attributes.length; i < l; i++) {
        item = attributes[i];
        if (item._qname.localName == p || p == '*') {
          list._addXML(item);
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return all attribute type child.
     * @access public
     * @return XML | XMLList
     * @see attribute
     */
    attributes: function() {
      return this.attribute('*');
    },
    /**
     * @description create a text type XML node by the text parameter,
     *  if the text contains special characters, use CDATA tag.
     * @access private
     * @param text{String}
     * @return XML
     */
    _createTextNode: function(text) {
      var el = new XML();
      el._nodeKind = NodeKind.TEXT;
      el._text = text;
      el._useCDATA = /['"<>&]/.test(text);
      return el;
    },
    /**
     * @description append child to the children list
     * @access public
     * @param child{XML | XMLList | String} the child need to be add
     * @return XML
     * @see prependChild
     */
    appendChild: function(child) {
      var cc = child.constructor;
      if (cc == XML) {
        child._parent = this;
        this._children.push(child);
      } else if (cc == XMLList) {
        child.each(function(item) {
          item._parent = this;
        });
        this._children = this._children.concat(child._list);
      } else if (cc == String) {
        var c = this._createTextNode(child);
        c._parent = this;
        this._children.push(c);
      }
      return this;
    },
    /**
     * @description prepend child to the children list
     * @access public
     * @param child{XML | XMLList | String} the child need to be add
     * @return XML
     * @see appendChild
     */
    prependChild: function(child) {
      var cc = child.constructor;
      if (cc == XML) {
        child._parent = this;
        this._children.unshift(child);
      } else if (cc == XMLList) {
        child.each(function(item) {
          item._parent = this;
        });
        this._children = this._list.concat(this._children);
      } else if (cc === String) {
        var c = this._createTextNode(child);
        c._parent = this;
        this._children.unshift(c);
      }
      return this;
    },
    /**
     * @description merge multi text childs nearby to one text child.
     * @access public
     * @return void
     */
    normalize: function() {
      var i,
        l,
        preTextEl,
        _c = this._children,
        newChildren = [];

      for (i = 0, l = _c.length; i < l; i++) {
        var item = _c[i],
          nk = item.nodeKind();
        if (nk == NodeKind.TEXT) {
          if (preTextEl) {
            item._text = preTextEl._text + item._text;
            _c[i - 1] = null;
          }
          preTextEl = item;
        } else if (nk == NodeKind.ELEMENT) {
          item.normalize();
          preTextEl = null;
        }
      }
      for (i = 0, l = _c.length; i < l; i++) {
        _c[i] && newChildren.push(_c[i]);
      }
      this._children = newChildren;
    },
    /**
     * @description return a filter children list, if the ignoreComments is true, the list will
     *   not contains any comment child, same as processing-instructions child.
     * @access private
     * @return Array
     */
    _getFilterChildren: function() {
      var i,
        l,
        c = [],
        _c = this._children;

      for (i = 0, l = _c.length; i < l; i++) {
        var item = _c[i],
          nk = item.nodeKind();
        if (nk == NodeKind.ELEMENT || nk == NodeKind.TEXT ||
          (nk == NodeKind.COMMENT && !XML.ignoreComments) ||
          (nk == NodeKind.PROCESSING_INSTRUCTIONS && !XML.ignoreProcessingInstructions)) {
          c.push(item);
        }
      }
      return c;
    },
    /**
     * @description find a child by localName
     * @access public
     * @param p{String} the child localName, if the localName is '*', return all the child.
     * @return XML | XMLList
     */
    child: function(p) {
      var list = new XMLList(),
        i,
        l,
        c = this._getFilterChildren();
      if (typeof p == 'number') {
        if (c.length != 0 && c[p]) {
          list._addXML(c[p]);
        }
      } else {
        for (i = 0, l = c.length; i < l; i++) {
          var xml = c[i];
          if (xml.localName() == p || p == "*") {
            list._addXML(xml);
          }
        }
      }

      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return the child index in its parent child list, return -1 if it is a root XML.
     * @access public
     * @return int
     */
    childIndex: function(p) {
      if (this._parent) {
        return arrayIndexOf(this._parent._getFilterChildren(), this);
      }
      return -1;
    },
    /**
     * @description return all the child
     * @access public
     * @return XML | XMLList
     */
    children: function() {
      return this.child("*");
    },
    /**
     * @description set the child content
     * @access public
     * @param child{string | XML | XMLList} the child need to be replaced
     * @return XML
     */
    setChildren: function(child) {
      this._children = [];
      return this.appendChild(child);
    },
    /**
     * @description replace a child by new content.
     * @access public
     * @param a{string} the child need to be replaced
     * @param b{String | XML | XMLList} the new content
     * @return XML
     */
    replace: function(a, b) {
      var replacedIndex = -1,
        i,
        l,
        c = this._children,
        newChildren = [];

      for (i = 0, l = c.length; i < l; i++) {
        var xml = c[i],
          nk = xml.nodeKind();
        if ((xml.localName() == a || a == "*") && nk == NodeKind.ELEMENT) {
          if (replacedIndex == -1) {
            replacedIndex = i;
            var cc = b.constructor;
            if (cc == XML) {
              b._parent = this;
              newChildren.push(b);
            } else if (cc == XMLList) {
              b.each(function(item) {
                item._parent = this;
              });
              newChildren = newChildren.concat(b._list);
            } else if (cc === String) {
              var t = this._createTextNode(b);
              t._parent = this;
              newChildren.push(t);
            }
          }
        } else {
          newChildren.push(xml);
        }
      }
      if (replacedIndex != -1) {
        this._children = newChildren;
        this.normalize();
      }
      return this;
    },
    /**
     * @description find element type child.
     * @access public
     * @param p{String} the child localName, if the localName is '*', return all the element type child.
     * @return XML | XMLList
     */
    elements: function(p) {
      if (arguments.length == 0) {
        p = '*';
      }
      var list = new XMLList(),
        i,
        l,
        c = this._children;

      for (i = 0, l = c.length; i < l; i++) {
        var xml = c[i];
        if ((xml.localName() == p || p == '*') && xml.nodeKind() == NodeKind.ELEMENT) {
          list._addXML(xml);
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description find descendants child from the XML tree top.
     * @access public
     * @param p{String} the descendant localName, if the localName is '*', return all the descendants.
     * @return XML | XMLList
     */
    descendants: function(p) {
      if (arguments.length == 0) {
        p = '*';
      }
      var list = new XMLList(),
        i,
        l,
        c = this._children;

      for (i = 0, l = c.length; i < l; i++) {
        var xml = c[i],
          nk = xml.nodeKind();
        if ((xml.localName() == p || p == '*') && (nk == NodeKind.ELEMENT || nk == NodeKind.TEXT)) {
          list._addXML(xml);
        }
        if (xml._nodeKind == NodeKind.ELEMENT) {
          list._addXML(xml.descendants(p));
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description insert a child after the special child.
     * @access public
     * @param child1{XML | XMLList} the child in XML
     * @param child2{XML | XMLList} the child need to be inserted.
     * @return XML
     * @see insertChildAfter
     */
    insertChildBefore: function(child1, child2) {
      if (child1 == null) {
        return this.appendChild(child2);
      }
      if (child1.constructor != XML) {
        return undefined;
      }
      var cc = child1.childIndex();
      if (child1._parent == this && cc != -1) {
        if (child2.constructor == XML) {
          child2._parent = this;
          this._children.splice(cc, 0, child2);
        } else if (child2.constructor == XMLList) {
          for (var i = 0, l = child2._list.length; i < l; i++) {
            child2._list[i]._parent = this;
            this._children.splice(cc + i, 0, child2._list[i]);
          }
        } else {
          return undefined;
        }
        return this;
      } else {
        return undefined;
      }
    },
    /**
     * @description insert a child before the special child.
     * @access public
     * @param child1{XML | XMLList} the child in XML
     * @param child2{XML | XMLList} the child need to be inserted.
     * @return XML
     * @see insertChildBefore
     */
    insertChildAfter: function(child1, child2) {
      if (child1 == null) {
        return this.prependChild(child2);
      }
      if (child1.constructor != XML) {
        return undefined;
      }
      var cc = child1.childIndex();
      if (child1._parent == this && cc != -1) {
        if (child2.constructor == XML) {
          child2._parent = this;
          this._children.splice(cc + 1, 0, child2);
        } else if (child2.constructor == XMLList) {
          for (var i = 0, l = child2._list.length; i < l; i++) {
            child2._list[i]._parent = this;
            this._children.splice(cc + 1 + i, 0, child2._list[i]);
          }
        } else {
          return undefined;
        }
        return this;
      } else {
        return undefined;
      }
    },
    /**
     * @description return the parent XML.
     * @access public
     * @return XML
     */
    parent: function() {
      return this._parent;
    },
    /**
     * @description check if the XML contains element type child, If has return false.
     * @acess public
     * @return Boolean
     * @see hasComplexContent
     */
    hasSimpleContent: function() {
      var c = this._children;
      for (var i = 0, l = c.length; i < l; i++) {
        var nk = c[i].nodeKind();
        if (nk === NodeKind.ELEMENT) {
          return false;
        }
      }
      return true;
    },
    /**
     * @description check if the XML contains element type child, If has return true.
     * @access public
     * @return Boolean
     * @see hasSimpleContent
     */
    hasComplexContent: function() {
      return !this.hasSimpleContent();
    },
    /**
     * @description return the comment type child
     * @access public
     * @return XML | XMLList
     */
    comments: function() {
      var list = new XMLList(),
        i,
        l,
        c = this._getFilterChildren();

      for (i = 0, l = c.length; i < l; i++) {
        var xml = c[i];
        if (xml.nodeKind() == NodeKind.COMMENT) {
          list._addXML(xml);
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return the text type child
     * @access public
     * @return XML
     */
    text: function() {
      var c = this._children,
        r = "";
      for (var i = 0, l = c.length; i < l; i++) {
        var nk = c[i].nodeKind();
        if (nk === NodeKind.TEXT) {
          if (c[i]._useCDATA) {
            r += c[i]._text;
          } else {
            r += replaceFromEntity(c[i]._text);
          }
        }
      }
      return this._createTextNode(r);
    },
    /**
     * @description return the XML comments.
     * @access public
     * @return XMLList | XML
     */
    comments: function() {
      var list = new XMLList(),
        i,
        l,
        c = this._getFilterChildren();

      for (i = 0, l = c.length; i < l; i++) {

        var xml = c[i];
        if (xml.nodeKind && xml.nodeKind() == NodeKind.COMMENT) {
          list._addXML(xml);
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return the XML processing-instructions.
     * @access public
     * @return XMLList | XML
     */
    processingInstructions: function() {
      var list = new XMLList(),
        i,
        l,
        c = this._getFilterChildren();

      for (i = 0, l = c.length; i < l; i++) {

        var xml = c[i];
        if (xml.nodeKind && xml.nodeKind() == NodeKind.PROCESSING_INSTRUCTIONS) {
          list._addXML(xml);
        }
      }
      return _getXMLIfLengthEqualOne(list);
    },
    /**
     * @description return an XML copy
     * @access public
     * @return XML
     */
    copy: function() {
      var xml = new XML(),
        i,
        l;
      xml._nodeKind = this._nodeKind;
      xml._text = this._text;
      xml._useCDATA = this._useCDATA;
      if (this._qname) {
        xml._qname = this._qname.copy();
      }
      for (i = 0, l = this._namespaces.length; i < l; i++) {
        xml._namespaces[i] = this._namespaces[i].copy();
      }
      for (i = 0, l = this._attributes.length; i < l; i++) {
        xml._attributes[i] = this._attributes[i].copy();
      }
      for (i = 0, l = this._children.length; i < l; i++) {
        xml._children[i] = this._children[i].copy();
      }
      return xml;
    },
    /**
     * @description format the XML to a String
     * @param indent{int} the whitespace indent
     * @access private
     */
    _toXMLString: function(indent, scopeNamespace) {
      var s = "",
        tag,
        i,
        l,
        nk = this._nodeKind,
        ns = scopeNamespace ? this.inScopeNamespaces() : this._namespaces,
        attrs = this._attributes,
        children = this._children,
        prettyPrinting = XML.prettyPrinting,
        p = [];
      indent = indent || 0;

      if (prettyPrinting) {
        for (i = 0; i < indent; i++) {
          s += XML.prettyTab?"\t":" ";
        }
      }
      for (i = 0, l = this._doctypes.length; i < l; i++) {
        s += this._doctypes[i]._toXMLString(indent) + "\n";
      }

      if (nk == NodeKind.ATTRIBUTE) {
        return s + this._text;
      } else if (nk == NodeKind.TEXT) {
        if (this._useCDATA) {
          return s + "<![CDATA[" + this._text + "]]>";
        } else {
          return s + replaceToEntity(this._text);
        }
      } else if (nk == NodeKind.COMMENT) {
        return s + "<!--" + this._text + "-->";
      } else if (nk == NodeKind.PROCESSING_INSTRUCTIONS) {
        return s + "<?" + this._text + "?>";
      } else if (nk == NodeKind.DOCTYPE) {
        return s + "<!" + this._text + ">";
      }

      if (this._qname) {
		 // _qname was defined so this is not the "self" document
		  if (this._qname._ns.prefix) {
			tag = this._qname._ns.prefix + ":" + this.localName();
		  } else {
			tag = this.localName();
		  }

		  s += "<" + tag;
		  for (i = 0, l = ns.length; i < l; i++) {
			var prefix = ns[i].prefix ? 'xmlns:' + ns[i].prefix : 'xmlns';
			p.push({
			  label: prefix,
			  value: ns[i].uri
			});
		  }
		  for (i = 0, l = attrs.length; i < l; i++) {
			var q = attrs[i]._qname,
			  prefix = q._ns.prefix,
			  label;
			if (prefix) {
			  label = prefix + ':' + q.localName;
			} else {
			  label = q.localName;
			}
			p.push({
			  label: label,
			  value: attrs[i]._text
			});
		  }
		  if (p.length > 0) {
			for (i = 0, l = p.length; i < l; i++) {
			  s += " " + p[i].label + "=\"" + p[i].value + "\"";
			}
		  }
	  }
      p = [];
      for (i = 0, l = children.length; i < l; i++) {
        var el = children[i],
          enk = el.nodeKind();

        if (enk == NodeKind.ELEMENT) {
          p.push(el);
        } else if (enk == NodeKind.COMMENT && !XML.ignoreComments) {
          p.push(el);
        } else if (enk == NodeKind.PROCESSING_INSTRUCTIONS && !XML.ignoreProcessingInstructions) {
          p.push(el);
        } else if (enk == NodeKind.TEXT) {
          p.push(el);
        } else if (enk == NodeKind.DOCTYPE) {
          p.push(el);
        }
      }
      if (p.length == 0) {
        if (s.length>0) 
            s += "/>";
      } else if (p.length == 1 && p[0].nodeKind() == NodeKind.TEXT) {
        s += ">";
        s += p[0]._toXMLString(0);
        s += "</" + tag + ">";
      } else {
		if (this._qname) {
            //only add this if there was a _qname -> meaning this is not the "self" document
			s += ">";
		}
        for (i = 0, l = p.length; i < l; i++) {
          if (prettyPrinting && s!="") {
            s += "\n";
          }
		  
          s += p[i]._toXMLString(indent + (XML.prettyTab?1:XML.prettyIndent) - (!this._qname?(XML.prettyTab?1:XML.prettyIndent):0));
        }
        if (prettyPrinting) {
          s += "\n";
          for (i = 0; i < indent; i++) {
            s += XML.prettyTab?"\t":" ";
          }
        }
		if (tag) {
			s += "</" + tag + ">";
		}
      }
      return s;
    },
    /**
     * @description return the XML string
     * @access public
     * @return String
     */
    toXMLString: function() {
      return this._toXMLString(0, true);
    },
    /**
     * @description return a string representation. If it contains complex content, return the toXMLString.
     * @access public
     * @return String
     */
    toString: function() {
      if (this.hasComplexContent()) {
        return this.toXMLString();
      }
      if (this.nodeKind() == NodeKind.TEXT || this.nodeKind() == NodeKind.ATTRIBUTE) {
        return this._text;
      }
      var s = "";
      for (var i = 0, l = this._children.length; i < l; i++) {
        var el = this._children[i];
        if (el._nodeKind == NodeKind.TEXT) {
          if (el._useCDATA) {
            s += el._text;
          } else {
            s += replaceFromEntity(el._text);
          }
        }
      }
      return s;
    },
    //================extension for javascript=========================
    /**
     * @description compatible to XMLList
     * @access public
     * @param func{Function} callback function
     * @return void
     * @see XMLList.prototype.each
     */
    each: function(func) {
      func(this, 0, this);
    },
    /**
     * @description get the XML simple node value
     * @access public
     * @return String
     * @see setValue
     */
    getValue: function() {
      var nk = this._nodeKind;
      if (nk == NodeKind.TEXT) {
        if (!this._useCDATA && containsEntity(this._text)) {
          return replaceFromEntity(this._text);
        }
        return this._text;
      } else if (nk == NodeKind.ATTRIBUTE) {
        return this._text;
      } else if (nk == NodeKind.ELEMENT && this.hasSimpleContent()) {
        var t = this.text();
        if (t.getValue) {
          return t.getValue();
        }
      }
      return undefined;
    },
    /**
     * @description set the XML simple node value
     * @access public
     * @param val{String} the new node value
     * @return void
     * @see getValue
     */
    setValue: function(val) {
      var nk = this._nodeKind;
      if (nk == NodeKind.TEXT || nk == NodeKind.ATTRIBUTE || nk == NodeKind.COMMENT || nk == NodeKind.PROCESSING_INSTRUCTIONS) {
        this._text = val;
      } else if (nk == NodeKind.ELEMENT && this.hasSimpleContent()) {
        var c = [],
          newText = this._createTextNode(val);
        newText._parent = this;
        c.push(newText);
        for (var i = 0, l = this._children.length; i < l; i++) {
          var item = this._children[i];
          if (item._nodeKind != NodeKind.TEXT) {
            c.push(item);
          }
        }
        this._children = c;
      }
      return this;
    }
  });


  /**
   * @description static properties and methods.
   */
  merge(XML, {

    //create first object as the main document containing comments, processing instructions and first level nodes
    createMainDocument: false,
    ignoreComments: true,
    ignoreProcessingInstructions: true,
    ignoreWhitespace: true,
    prettyIndent: 2,
    prettyPrinting: true,
	prettyTab: false,

    /**
     * @description get an object copy indicating the XML setting.
     * @return Object
     */
    settings: function() {
      return {
        createMainDocument: this.createMainDocument,
        ignoreComments: this.ignoreComments,
        ignoreProcessingInstructions: this.ignoreProcessingInstructions,
        ignoreWhitespace: this.ignoreWhitespace,
        prettyIndent: this.prettyIndent,
        prettyPrinting: this.prettyPrinting,
        prettyTab: this.prettyTab
      }
    },
    /**
     * @description set the XML setting
     * @param sett{Object}
     * @return void
     */
    setSettings: function(sett) {
      if (!sett) {
        return
      }
      var assign = function(p) {
        if (sett.hasOwnProperty(p)) {
          XML[p] = sett[p];
        }
      }
      assign("createMainDocument");
      assign("ignoreComments");
      assign("ignoreProcessingInstructions");
      assign("ignoreWhitespace");
      assign("prettyIndent");
      assign("prettyPrinting");
      assign("prettyTab");
    }
  });

  /**
   * @description return global object jsxml
   * @return Object
   */
  var jsxml = {
    containsEntity: containsEntity,
    replaceToEntity: replaceToEntity,
    replaceFromEntity: replaceFromEntity,
    parseXML: _parseXML,
    Namespace: Namespace,
    QName: QName,
    NodeKind: NodeKind,
    XMLList: XMLList,
    XML: XML
  };

  //support for nodejs
  if (typeof exports != "undefined") {
    for (var i in jsxml) {
      exports[i] = jsxml[i];
    }
  } else if (typeof define === 'function') {
    // Publish as AMD module
    define(function() {
      return jsxml;
    });
  } else {
    // Publish as global (in browsers)
    this.jsxml = jsxml;
  }

}).call(this);