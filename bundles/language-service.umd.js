(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define('@angular/language-service', ['exports', '@angular/compiler', 'typescript', '@angular/core', 'fs', 'path', '@angular/compiler-cli'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@angular/compiler'), require('typescript'), require('@angular/core'), require('fs'), require('path'), require('@angular/compiler-cli'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angularCompiler, global.ts, global.angularCore, global.fs, global.path, global.angularCompilerCli);
        global.ng = global.ng || {};
        global.ng.language_service = mod.exports;
    }
})(this, function (exports, _compiler, _typescript, _core, _fs, _path, _compilerCli) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.VERSION = exports.createLanguageServiceFromTypescript = exports.TypeScriptServiceHost = exports.create = exports.createLanguageService = undefined;

    var ts = _interopRequireWildcard(_typescript);

    var fs = _interopRequireWildcard(_fs);

    var path = _interopRequireWildcard(_path);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

            return arr2;
        } else {
            return Array.from(arr);
        }
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var AstPath$1 = function () {
        function AstPath$1(path) {
            _classCallCheck(this, AstPath$1);

            this.path = path;
        }

        _createClass(AstPath$1, [{
            key: 'parentOf',
            value: function parentOf(node) {
                return this.path[this.path.indexOf(node) - 1];
            }
        }, {
            key: 'childOf',
            value: function childOf(node) {
                return this.path[this.path.indexOf(node) + 1];
            }
        }, {
            key: 'first',
            value: function first(ctor) {
                for (var i = this.path.length - 1; i >= 0; i--) {
                    var item = this.path[i];
                    if (item instanceof ctor) return item;
                }
            }
        }, {
            key: 'push',
            value: function push(node) {
                this.path.push(node);
            }
        }, {
            key: 'pop',
            value: function pop() {
                return this.path.pop();
            }
        }, {
            key: 'empty',
            get: function get() {
                return !this.path || !this.path.length;
            }
        }, {
            key: 'head',
            get: function get() {
                return this.path[0];
            }
        }, {
            key: 'tail',
            get: function get() {
                return this.path[this.path.length - 1];
            }
        }]);

        return AstPath$1;
    }();

    function isParseSourceSpan(value) {
        return value && !!value.start;
    }
    function spanOf(span) {
        if (!span) return undefined;
        if (isParseSourceSpan(span)) {
            return { start: span.start.offset, end: span.end.offset };
        } else {
            if (span.endSourceSpan) {
                return { start: span.sourceSpan.start.offset, end: span.endSourceSpan.end.offset };
            } else if (span.children && span.children.length) {
                return {
                    start: span.sourceSpan.start.offset,
                    end: spanOf(span.children[span.children.length - 1]).end
                };
            }
            return { start: span.sourceSpan.start.offset, end: span.sourceSpan.end.offset };
        }
    }
    function inSpan(position, span, exclusive) {
        return span && exclusive ? position >= span.start && position < span.end : position >= span.start && position <= span.end;
    }
    function offsetSpan(span, amount) {
        return { start: span.start + amount, end: span.end + amount };
    }
    function isNarrower(spanA, spanB) {
        return spanA.start >= spanB.start && spanA.end <= spanB.end;
    }
    function hasTemplateReference(type) {
        if (type.diDeps) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = type.diDeps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var diDep = _step.value;

                    if (diDep.token.identifier && (0, _compiler.identifierName)(diDep.token.identifier) == 'TemplateRef') return true;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
        return false;
    }
    function getSelectors(info) {
        var map = new Map();
        var selectors = flatten(info.directives.map(function (directive) {
            var selectors = _compiler.CssSelector.parse(directive.selector);
            selectors.forEach(function (selector) {
                return map.set(selector, directive);
            });
            return selectors;
        }));
        return { selectors: selectors, map: map };
    }
    function flatten(a) {
        var _ref;

        return (_ref = []).concat.apply(_ref, _toConsumableArray(a));
    }
    function removeSuffix(value, suffix) {
        if (value.endsWith(suffix)) return value.substring(0, value.length - suffix.length);
        return value;
    }
    function uniqueByName(elements) {
        if (elements) {
            var result = [];
            var set = new Set();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var element = _step2.value;

                    if (!set.has(element.name)) {
                        set.add(element.name);
                        result.push(element);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return result;
        }
    }

    var TemplateAstPath = function (_AstPath$) {
        _inherits(TemplateAstPath, _AstPath$);

        function TemplateAstPath(ast, position) {
            var allowWidening = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            _classCallCheck(this, TemplateAstPath);

            var _this2 = _possibleConstructorReturn(this, (TemplateAstPath.__proto__ || Object.getPrototypeOf(TemplateAstPath)).call(this, buildTemplatePath(ast, position, allowWidening)));

            _this2.position = position;
            return _this2;
        }

        return TemplateAstPath;
    }(AstPath$1);

    function buildTemplatePath(ast, position) {
        var allowWidening = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var visitor = new TemplateAstPathBuilder(position, allowWidening);
        (0, _compiler.templateVisitAll)(visitor, ast);
        return visitor.getPath();
    }

    var NullTemplateVisitor = function () {
        function NullTemplateVisitor() {
            _classCallCheck(this, NullTemplateVisitor);
        }

        _createClass(NullTemplateVisitor, [{
            key: 'visitNgContent',
            value: function visitNgContent(ast) {}
        }, {
            key: 'visitEmbeddedTemplate',
            value: function visitEmbeddedTemplate(ast) {}
        }, {
            key: 'visitElement',
            value: function visitElement(ast) {}
        }, {
            key: 'visitReference',
            value: function visitReference(ast) {}
        }, {
            key: 'visitVariable',
            value: function visitVariable(ast) {}
        }, {
            key: 'visitEvent',
            value: function visitEvent(ast) {}
        }, {
            key: 'visitElementProperty',
            value: function visitElementProperty(ast) {}
        }, {
            key: 'visitAttr',
            value: function visitAttr(ast) {}
        }, {
            key: 'visitBoundText',
            value: function visitBoundText(ast) {}
        }, {
            key: 'visitText',
            value: function visitText(ast) {}
        }, {
            key: 'visitDirective',
            value: function visitDirective(ast) {}
        }, {
            key: 'visitDirectiveProperty',
            value: function visitDirectiveProperty(ast) {}
        }]);

        return NullTemplateVisitor;
    }();

    var TemplateAstChildVisitor = function () {
        function TemplateAstChildVisitor(visitor) {
            _classCallCheck(this, TemplateAstChildVisitor);

            this.visitor = visitor;
        }
        // Nodes with children


        _createClass(TemplateAstChildVisitor, [{
            key: 'visitEmbeddedTemplate',
            value: function visitEmbeddedTemplate(ast, context) {
                return this.visitChildren(context, function (visit) {
                    visit(ast.attrs);
                    visit(ast.references);
                    visit(ast.variables);
                    visit(ast.directives);
                    visit(ast.providers);
                    visit(ast.children);
                });
            }
        }, {
            key: 'visitElement',
            value: function visitElement(ast, context) {
                return this.visitChildren(context, function (visit) {
                    visit(ast.attrs);
                    visit(ast.inputs);
                    visit(ast.outputs);
                    visit(ast.references);
                    visit(ast.directives);
                    visit(ast.providers);
                    visit(ast.children);
                });
            }
        }, {
            key: 'visitDirective',
            value: function visitDirective(ast, context) {
                return this.visitChildren(context, function (visit) {
                    visit(ast.inputs);
                    visit(ast.hostProperties);
                    visit(ast.hostEvents);
                });
            }
        }, {
            key: 'visitNgContent',
            value: function visitNgContent(ast, context) {}
        }, {
            key: 'visitReference',
            value: function visitReference(ast, context) {}
        }, {
            key: 'visitVariable',
            value: function visitVariable(ast, context) {}
        }, {
            key: 'visitEvent',
            value: function visitEvent(ast, context) {}
        }, {
            key: 'visitElementProperty',
            value: function visitElementProperty(ast, context) {}
        }, {
            key: 'visitAttr',
            value: function visitAttr(ast, context) {}
        }, {
            key: 'visitBoundText',
            value: function visitBoundText(ast, context) {}
        }, {
            key: 'visitText',
            value: function visitText(ast, context) {}
        }, {
            key: 'visitDirectiveProperty',
            value: function visitDirectiveProperty(ast, context) {}
        }, {
            key: 'visitChildren',
            value: function visitChildren(context, cb) {
                var visitor = this.visitor || this;
                var results = [];
                function visit(children) {
                    if (children && children.length) results.push((0, _compiler.templateVisitAll)(visitor, children, context));
                }
                cb(visit);
                return [].concat.apply([], results);
            }
        }]);

        return TemplateAstChildVisitor;
    }();

    var TemplateAstPathBuilder = function (_TemplateAstChildVisi) {
        _inherits(TemplateAstPathBuilder, _TemplateAstChildVisi);

        function TemplateAstPathBuilder(position, allowWidening) {
            _classCallCheck(this, TemplateAstPathBuilder);

            var _this3 = _possibleConstructorReturn(this, (TemplateAstPathBuilder.__proto__ || Object.getPrototypeOf(TemplateAstPathBuilder)).call(this));

            _this3.position = position;
            _this3.allowWidening = allowWidening;
            _this3.path = [];
            return _this3;
        }

        _createClass(TemplateAstPathBuilder, [{
            key: 'visit',
            value: function visit(ast, context) {
                var span = spanOf(ast);
                if (inSpan(this.position, span)) {
                    var len = this.path.length;
                    if (!len || this.allowWidening || isNarrower(span, spanOf(this.path[len - 1]))) {
                        this.path.push(ast);
                    }
                } else {
                    // Returning a value here will result in the children being skipped.
                    return true;
                }
            }
        }, {
            key: 'visitEmbeddedTemplate',
            value: function visitEmbeddedTemplate(ast, context) {
                return this.visitChildren(context, function (visit) {
                    // Ignore reference, variable and providers
                    visit(ast.attrs);
                    visit(ast.directives);
                    visit(ast.children);
                });
            }
        }, {
            key: 'visitElement',
            value: function visitElement(ast, context) {
                return this.visitChildren(context, function (visit) {
                    // Ingnore providers
                    visit(ast.attrs);
                    visit(ast.inputs);
                    visit(ast.outputs);
                    visit(ast.references);
                    visit(ast.directives);
                    visit(ast.children);
                });
            }
        }, {
            key: 'visitDirective',
            value: function visitDirective(ast, context) {
                // Ignore the host properties of a directive
                var result = this.visitChildren(context, function (visit) {
                    visit(ast.inputs);
                });
                // We never care about the diretive itself, just its inputs.
                if (this.path[this.path.length - 1] == ast) {
                    this.path.pop();
                }
                return result;
            }
        }, {
            key: 'getPath',
            value: function getPath() {
                return this.path;
            }
        }]);

        return TemplateAstPathBuilder;
    }(TemplateAstChildVisitor);

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * An enumeration of basic types.
     *
     * A `LanguageServiceHost` interface.
     *
     * @experimental
     */
    var BuiltinType;
    (function (BuiltinType) {
        /**
         * The type is a type that can hold any other type.
         */
        BuiltinType[BuiltinType["Any"] = 0] = "Any";
        /**
         * The type of a string literal.
         */
        BuiltinType[BuiltinType["String"] = 1] = "String";
        /**
         * The type of a numeric literal.
         */
        BuiltinType[BuiltinType["Number"] = 2] = "Number";
        /**
         * The type of the `true` and `false` literals.
         */
        BuiltinType[BuiltinType["Boolean"] = 3] = "Boolean";
        /**
         * The type of the `undefined` literal.
         */
        BuiltinType[BuiltinType["Undefined"] = 4] = "Undefined";
        /**
         * the type of the `null` literal.
         */
        BuiltinType[BuiltinType["Null"] = 5] = "Null";
        /**
         * the type is an unbound type parameter.
         */
        BuiltinType[BuiltinType["Unbound"] = 6] = "Unbound";
        /**
         * Not a built-in type.
         */
        BuiltinType[BuiltinType["Other"] = 7] = "Other";
    })(BuiltinType || (BuiltinType = {}));
    /**
     * The kind of diagnostic message.
     *
     * @experimental
     */
    var DiagnosticKind;
    (function (DiagnosticKind) {
        DiagnosticKind[DiagnosticKind["Error"] = 0] = "Error";
        DiagnosticKind[DiagnosticKind["Warning"] = 1] = "Warning";
    })(DiagnosticKind || (DiagnosticKind = {}));

    function getExpressionDiagnostics(scope, ast, query) {
        var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var analyzer = new AstType(scope, query, context);
        analyzer.getDiagnostics(ast);
        return analyzer.diagnostics;
    }
    function getExpressionCompletions(scope, ast, position, query) {
        var path = new AstPath(ast, position);
        if (path.empty) return undefined;
        var tail = path.tail;
        var result = scope;
        function getType(ast) {
            return new AstType(scope, query, {}).getType(ast);
        }
        // If the completion request is in a not in a pipe or property access then the global scope
        // (that is the scope of the implicit receiver) is the right scope as the user is typing the
        // beginning of an expression.
        tail.visit({
            visitBinary: function visitBinary(ast) {},
            visitChain: function visitChain(ast) {},
            visitConditional: function visitConditional(ast) {},
            visitFunctionCall: function visitFunctionCall(ast) {},
            visitImplicitReceiver: function visitImplicitReceiver(ast) {},
            visitInterpolation: function visitInterpolation(ast) {
                result = undefined;
            },
            visitKeyedRead: function visitKeyedRead(ast) {},
            visitKeyedWrite: function visitKeyedWrite(ast) {},
            visitLiteralArray: function visitLiteralArray(ast) {},
            visitLiteralMap: function visitLiteralMap(ast) {},
            visitLiteralPrimitive: function visitLiteralPrimitive(ast) {},
            visitMethodCall: function visitMethodCall(ast) {},
            visitPipe: function visitPipe(ast) {
                if (position >= ast.exp.span.end && (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                    // We are in a position a pipe name is expected.
                    result = query.getPipes();
                }
            },
            visitPrefixNot: function visitPrefixNot(ast) {},
            visitPropertyRead: function visitPropertyRead(ast) {
                var receiverType = getType(ast.receiver);
                result = receiverType ? receiverType.members() : scope;
            },
            visitPropertyWrite: function visitPropertyWrite(ast) {
                var receiverType = getType(ast.receiver);
                result = receiverType ? receiverType.members() : scope;
            },
            visitQuote: function visitQuote(ast) {
                // For a quote, return the members of any (if there are any).
                result = query.getBuiltinType(BuiltinType.Any).members();
            },
            visitSafeMethodCall: function visitSafeMethodCall(ast) {
                var receiverType = getType(ast.receiver);
                result = receiverType ? receiverType.members() : scope;
            },
            visitSafePropertyRead: function visitSafePropertyRead(ast) {
                var receiverType = getType(ast.receiver);
                result = receiverType ? receiverType.members() : scope;
            }
        });
        return result && result.values();
    }
    function getExpressionSymbol(scope, ast, position, query) {
        var path = new AstPath(ast, position, /* excludeEmpty */true);
        if (path.empty) return undefined;
        var tail = path.tail;
        function getType(ast) {
            return new AstType(scope, query, {}).getType(ast);
        }
        var symbol = undefined;
        var span = undefined;
        // If the completion request is in a not in a pipe or property access then the global scope
        // (that is the scope of the implicit receiver) is the right scope as the user is typing the
        // beginning of an expression.
        tail.visit({
            visitBinary: function visitBinary(ast) {},
            visitChain: function visitChain(ast) {},
            visitConditional: function visitConditional(ast) {},
            visitFunctionCall: function visitFunctionCall(ast) {},
            visitImplicitReceiver: function visitImplicitReceiver(ast) {},
            visitInterpolation: function visitInterpolation(ast) {},
            visitKeyedRead: function visitKeyedRead(ast) {},
            visitKeyedWrite: function visitKeyedWrite(ast) {},
            visitLiteralArray: function visitLiteralArray(ast) {},
            visitLiteralMap: function visitLiteralMap(ast) {},
            visitLiteralPrimitive: function visitLiteralPrimitive(ast) {},
            visitMethodCall: function visitMethodCall(ast) {
                var receiverType = getType(ast.receiver);
                symbol = receiverType && receiverType.members().get(ast.name);
                span = ast.span;
            },
            visitPipe: function visitPipe(ast) {
                if (position >= ast.exp.span.end && (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                    // We are in a position a pipe name is expected.
                    var pipes = query.getPipes();
                    if (pipes) {
                        symbol = pipes.get(ast.name);
                        span = ast.span;
                    }
                }
            },
            visitPrefixNot: function visitPrefixNot(ast) {},
            visitPropertyRead: function visitPropertyRead(ast) {
                var receiverType = getType(ast.receiver);
                symbol = receiverType && receiverType.members().get(ast.name);
                span = ast.span;
            },
            visitPropertyWrite: function visitPropertyWrite(ast) {
                var receiverType = getType(ast.receiver);
                symbol = receiverType && receiverType.members().get(ast.name);
                span = ast.span;
            },
            visitQuote: function visitQuote(ast) {},
            visitSafeMethodCall: function visitSafeMethodCall(ast) {
                var receiverType = getType(ast.receiver);
                symbol = receiverType && receiverType.members().get(ast.name);
                span = ast.span;
            },
            visitSafePropertyRead: function visitSafePropertyRead(ast) {
                var receiverType = getType(ast.receiver);
                symbol = receiverType && receiverType.members().get(ast.name);
                span = ast.span;
            }
        });
        if (symbol && span) {
            return { symbol: symbol, span: span };
        }
    }
    // Consider moving to expression_parser/ast

    var NullVisitor = function () {
        function NullVisitor() {
            _classCallCheck(this, NullVisitor);
        }

        _createClass(NullVisitor, [{
            key: 'visitBinary',
            value: function visitBinary(ast) {}
        }, {
            key: 'visitChain',
            value: function visitChain(ast) {}
        }, {
            key: 'visitConditional',
            value: function visitConditional(ast) {}
        }, {
            key: 'visitFunctionCall',
            value: function visitFunctionCall(ast) {}
        }, {
            key: 'visitImplicitReceiver',
            value: function visitImplicitReceiver(ast) {}
        }, {
            key: 'visitInterpolation',
            value: function visitInterpolation(ast) {}
        }, {
            key: 'visitKeyedRead',
            value: function visitKeyedRead(ast) {}
        }, {
            key: 'visitKeyedWrite',
            value: function visitKeyedWrite(ast) {}
        }, {
            key: 'visitLiteralArray',
            value: function visitLiteralArray(ast) {}
        }, {
            key: 'visitLiteralMap',
            value: function visitLiteralMap(ast) {}
        }, {
            key: 'visitLiteralPrimitive',
            value: function visitLiteralPrimitive(ast) {}
        }, {
            key: 'visitMethodCall',
            value: function visitMethodCall(ast) {}
        }, {
            key: 'visitPipe',
            value: function visitPipe(ast) {}
        }, {
            key: 'visitPrefixNot',
            value: function visitPrefixNot(ast) {}
        }, {
            key: 'visitPropertyRead',
            value: function visitPropertyRead(ast) {}
        }, {
            key: 'visitPropertyWrite',
            value: function visitPropertyWrite(ast) {}
        }, {
            key: 'visitQuote',
            value: function visitQuote(ast) {}
        }, {
            key: 'visitSafeMethodCall',
            value: function visitSafeMethodCall(ast) {}
        }, {
            key: 'visitSafePropertyRead',
            value: function visitSafePropertyRead(ast) {}
        }]);

        return NullVisitor;
    }();

    var TypeDiagnostic = function TypeDiagnostic(kind, message, ast) {
        _classCallCheck(this, TypeDiagnostic);

        this.kind = kind;
        this.message = message;
        this.ast = ast;
    };

    var AstType = function () {
        function AstType(scope, query, context) {
            _classCallCheck(this, AstType);

            this.scope = scope;
            this.query = query;
            this.context = context;
        }

        _createClass(AstType, [{
            key: 'getType',
            value: function getType(ast) {
                return ast.visit(this);
            }
        }, {
            key: 'getDiagnostics',
            value: function getDiagnostics(ast) {
                this.diagnostics = [];
                var type = ast.visit(this);
                if (this.context.event && type.callable) {
                    this.reportWarning('Unexpected callable expression. Expected a method call', ast);
                }
                return this.diagnostics;
            }
        }, {
            key: 'visitBinary',
            value: function visitBinary(ast) {
                // Treat undefined and null as other.
                function normalize(kind, other) {
                    switch (kind) {
                        case BuiltinType.Undefined:
                        case BuiltinType.Null:
                            return normalize(other, BuiltinType.Other);
                    }
                    return kind;
                }
                var leftType = this.getType(ast.left);
                var rightType = this.getType(ast.right);
                var leftRawKind = this.query.getTypeKind(leftType);
                var rightRawKind = this.query.getTypeKind(rightType);
                var leftKind = normalize(leftRawKind, rightRawKind);
                var rightKind = normalize(rightRawKind, leftRawKind);
                // The following swtich implements operator typing similar to the
                // type production tables in the TypeScript specification.
                // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.19
                var operKind = leftKind << 8 | rightKind;
                switch (ast.operation) {
                    case '*':
                    case '/':
                    case '%':
                    case '-':
                    case '<<':
                    case '>>':
                    case '>>>':
                    case '&':
                    case '^':
                    case '|':
                        switch (operKind) {
                            case BuiltinType.Any << 8 | BuiltinType.Any:
                            case BuiltinType.Number << 8 | BuiltinType.Any:
                            case BuiltinType.Any << 8 | BuiltinType.Number:
                            case BuiltinType.Number << 8 | BuiltinType.Number:
                                return this.query.getBuiltinType(BuiltinType.Number);
                            default:
                                var errorAst = ast.left;
                                switch (leftKind) {
                                    case BuiltinType.Any:
                                    case BuiltinType.Number:
                                        errorAst = ast.right;
                                        break;
                                }
                                return this.reportError('Expected a numeric type', errorAst);
                        }
                    case '+':
                        switch (operKind) {
                            case BuiltinType.Any << 8 | BuiltinType.Any:
                            case BuiltinType.Any << 8 | BuiltinType.Boolean:
                            case BuiltinType.Any << 8 | BuiltinType.Number:
                            case BuiltinType.Any << 8 | BuiltinType.Other:
                            case BuiltinType.Boolean << 8 | BuiltinType.Any:
                            case BuiltinType.Number << 8 | BuiltinType.Any:
                            case BuiltinType.Other << 8 | BuiltinType.Any:
                                return this.anyType;
                            case BuiltinType.Any << 8 | BuiltinType.String:
                            case BuiltinType.Boolean << 8 | BuiltinType.String:
                            case BuiltinType.Number << 8 | BuiltinType.String:
                            case BuiltinType.String << 8 | BuiltinType.Any:
                            case BuiltinType.String << 8 | BuiltinType.Boolean:
                            case BuiltinType.String << 8 | BuiltinType.Number:
                            case BuiltinType.String << 8 | BuiltinType.String:
                            case BuiltinType.String << 8 | BuiltinType.Other:
                            case BuiltinType.Other << 8 | BuiltinType.String:
                                return this.query.getBuiltinType(BuiltinType.String);
                            case BuiltinType.Number << 8 | BuiltinType.Number:
                                return this.query.getBuiltinType(BuiltinType.Number);
                            case BuiltinType.Boolean << 8 | BuiltinType.Number:
                            case BuiltinType.Other << 8 | BuiltinType.Number:
                                return this.reportError('Expected a number type', ast.left);
                            case BuiltinType.Number << 8 | BuiltinType.Boolean:
                            case BuiltinType.Number << 8 | BuiltinType.Other:
                                return this.reportError('Expected a number type', ast.right);
                            default:
                                return this.reportError('Expected operands to be a string or number type', ast);
                        }
                    case '>':
                    case '<':
                    case '<=':
                    case '>=':
                    case '==':
                    case '!=':
                    case '===':
                    case '!==':
                        switch (operKind) {
                            case BuiltinType.Any << 8 | BuiltinType.Any:
                            case BuiltinType.Any << 8 | BuiltinType.Boolean:
                            case BuiltinType.Any << 8 | BuiltinType.Number:
                            case BuiltinType.Any << 8 | BuiltinType.String:
                            case BuiltinType.Any << 8 | BuiltinType.Other:
                            case BuiltinType.Boolean << 8 | BuiltinType.Any:
                            case BuiltinType.Boolean << 8 | BuiltinType.Boolean:
                            case BuiltinType.Number << 8 | BuiltinType.Any:
                            case BuiltinType.Number << 8 | BuiltinType.Number:
                            case BuiltinType.String << 8 | BuiltinType.Any:
                            case BuiltinType.String << 8 | BuiltinType.String:
                            case BuiltinType.Other << 8 | BuiltinType.Any:
                            case BuiltinType.Other << 8 | BuiltinType.Other:
                                return this.query.getBuiltinType(BuiltinType.Boolean);
                            default:
                                return this.reportError('Expected the operants to be of similar type or any', ast);
                        }
                    case '&&':
                        return rightType;
                    case '||':
                        return this.query.getTypeUnion(leftType, rightType);
                }
                return this.reportError('Unrecognized operator ' + ast.operation, ast);
            }
        }, {
            key: 'visitChain',
            value: function visitChain(ast) {
                if (this.diagnostics) {
                    // If we are producing diagnostics, visit the children
                    visitChildren(ast, this);
                }
                // The type of a chain is always undefined.
                return this.query.getBuiltinType(BuiltinType.Undefined);
            }
        }, {
            key: 'visitConditional',
            value: function visitConditional(ast) {
                // The type of a conditional is the union of the true and false conditions.
                return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
            }
        }, {
            key: 'visitFunctionCall',
            value: function visitFunctionCall(ast) {
                var _this4 = this;

                // The type of a function call is the return type of the selected signature.
                // The signature is selected based on the types of the arguments. Angular doesn't
                // support contextual typing of arguments so this is simpler than TypeScript's
                // version.
                var args = ast.args.map(function (arg) {
                    return _this4.getType(arg);
                });
                var target = this.getType(ast.target);
                if (!target || !target.callable) return this.reportError('Call target is not callable', ast);
                var signature = target.selectSignature(args);
                if (signature) return signature.result;
                // TODO: Consider a better error message here.
                return this.reportError('Unable no compatible signature found for call', ast);
            }
        }, {
            key: 'visitImplicitReceiver',
            value: function visitImplicitReceiver(ast) {
                var _this = this;
                // Return a pseudo-symbol for the implicit receiver.
                // The members of the implicit receiver are what is defined by the
                // scope passed into this class.
                return {
                    name: '$implict',
                    kind: 'component',
                    language: 'ng-template',
                    type: undefined,
                    container: undefined,
                    callable: false,
                    public: true,
                    definition: undefined,
                    members: function members() {
                        return _this.scope;
                    },
                    signatures: function signatures() {
                        return [];
                    },
                    selectSignature: function selectSignature(types) {
                        return undefined;
                    },
                    indexed: function indexed(argument) {
                        return undefined;
                    }
                };
            }
        }, {
            key: 'visitInterpolation',
            value: function visitInterpolation(ast) {
                // If we are producing diagnostics, visit the children.
                if (this.diagnostics) {
                    visitChildren(ast, this);
                }
                return this.undefinedType;
            }
        }, {
            key: 'visitKeyedRead',
            value: function visitKeyedRead(ast) {
                var targetType = this.getType(ast.obj);
                var keyType = this.getType(ast.key);
                var result = targetType.indexed(keyType);
                return result || this.anyType;
            }
        }, {
            key: 'visitKeyedWrite',
            value: function visitKeyedWrite(ast) {
                // The write of a type is the type of the value being written.
                return this.getType(ast.value);
            }
        }, {
            key: 'visitLiteralArray',
            value: function visitLiteralArray(ast) {
                var _query,
                    _this5 = this;

                // A type literal is an array type of the union of the elements
                return this.query.getArrayType((_query = this.query).getTypeUnion.apply(_query, _toConsumableArray(ast.expressions.map(function (element) {
                    return _this5.getType(element);
                }))));
            }
        }, {
            key: 'visitLiteralMap',
            value: function visitLiteralMap(ast) {
                // If we are producing diagnostics, visit the children
                if (this.diagnostics) {
                    visitChildren(ast, this);
                }
                // TODO: Return a composite type.
                return this.anyType;
            }
        }, {
            key: 'visitLiteralPrimitive',
            value: function visitLiteralPrimitive(ast) {
                // The type of a literal primitive depends on the value of the literal.
                switch (ast.value) {
                    case true:
                    case false:
                        return this.query.getBuiltinType(BuiltinType.Boolean);
                    case null:
                        return this.query.getBuiltinType(BuiltinType.Null);
                    case undefined:
                        return this.query.getBuiltinType(BuiltinType.Undefined);
                    default:
                        switch (_typeof(ast.value)) {
                            case 'string':
                                return this.query.getBuiltinType(BuiltinType.String);
                            case 'number':
                                return this.query.getBuiltinType(BuiltinType.Number);
                            default:
                                return this.reportError('Unrecognized primitive', ast);
                        }
                }
            }
        }, {
            key: 'visitMethodCall',
            value: function visitMethodCall(ast) {
                return this.resolveMethodCall(this.getType(ast.receiver), ast);
            }
        }, {
            key: 'visitPipe',
            value: function visitPipe(ast) {
                var _this6 = this;

                // The type of a pipe node is the return type of the pipe's transform method. The table returned
                // by getPipes() is expected to contain symbols with the corresponding transform method type.
                var pipe = this.query.getPipes().get(ast.name);
                if (!pipe) return this.reportError('No pipe by the name ' + pipe.name + ' found', ast);
                var expType = this.getType(ast.exp);
                var signature = pipe.selectSignature([expType].concat(ast.args.map(function (arg) {
                    return _this6.getType(arg);
                })));
                if (!signature) return this.reportError('Unable to resolve signature for pipe invocation', ast);
                return signature.result;
            }
        }, {
            key: 'visitPrefixNot',
            value: function visitPrefixNot(ast) {
                // The type of a prefix ! is always boolean.
                return this.query.getBuiltinType(BuiltinType.Boolean);
            }
        }, {
            key: 'visitPropertyRead',
            value: function visitPropertyRead(ast) {
                return this.resolvePropertyRead(this.getType(ast.receiver), ast);
            }
        }, {
            key: 'visitPropertyWrite',
            value: function visitPropertyWrite(ast) {
                // The type of a write is the type of the value being written.
                return this.getType(ast.value);
            }
        }, {
            key: 'visitQuote',
            value: function visitQuote(ast) {
                // The type of a quoted expression is any.
                return this.query.getBuiltinType(BuiltinType.Any);
            }
        }, {
            key: 'visitSafeMethodCall',
            value: function visitSafeMethodCall(ast) {
                return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
            }
        }, {
            key: 'visitSafePropertyRead',
            value: function visitSafePropertyRead(ast) {
                return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
            }
        }, {
            key: 'resolveMethodCall',
            value: function resolveMethodCall(receiverType, ast) {
                var _this7 = this;

                if (this.isAny(receiverType)) {
                    return this.anyType;
                }
                // The type of a method is the selected methods result type.
                var method = receiverType.members().get(ast.name);
                if (!method) return this.reportError('Unknown method ' + ast.name, ast);
                if (!method.type.callable) return this.reportError('Member ' + ast.name + ' is not callable', ast);
                var signature = method.type.selectSignature(ast.args.map(function (arg) {
                    return _this7.getType(arg);
                }));
                if (!signature) return this.reportError('Unable to resolve signature for call of method ' + ast.name, ast);
                return signature.result;
            }
        }, {
            key: 'resolvePropertyRead',
            value: function resolvePropertyRead(receiverType, ast) {
                if (this.isAny(receiverType)) {
                    return this.anyType;
                }
                // The type of a property read is the seelcted member's type.
                var member = receiverType.members().get(ast.name);
                if (!member) {
                    var receiverInfo = receiverType.name;
                    if (receiverInfo == '$implict') {
                        receiverInfo = 'The component declaration, template variable declarations, and element references do';
                    } else {
                        receiverInfo = '\'' + receiverInfo + '\' does';
                    }
                    return this.reportError('Identifier \'' + ast.name + '\' is not defined. ' + receiverInfo + ' not contain such a member', ast);
                }
                if (!member.public) {
                    var _receiverInfo = receiverType.name;
                    if (_receiverInfo == '$implict') {
                        _receiverInfo = 'the component';
                    } else {
                        _receiverInfo = '\'' + _receiverInfo + '\'';
                    }
                    this.reportWarning('Identifier \'' + ast.name + '\' refers to a private member of ' + _receiverInfo, ast);
                }
                return member.type;
            }
        }, {
            key: 'reportError',
            value: function reportError(message, ast) {
                if (this.diagnostics) {
                    this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Error, message, ast));
                }
                return this.anyType;
            }
        }, {
            key: 'reportWarning',
            value: function reportWarning(message, ast) {
                if (this.diagnostics) {
                    this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Warning, message, ast));
                }
                return this.anyType;
            }
        }, {
            key: 'isAny',
            value: function isAny(symbol) {
                return !symbol || this.query.getTypeKind(symbol) == BuiltinType.Any || symbol.type && this.isAny(symbol.type);
            }
        }, {
            key: 'anyType',
            get: function get() {
                var result = this._anyType;
                if (!result) {
                    result = this._anyType = this.query.getBuiltinType(BuiltinType.Any);
                }
                return result;
            }
        }, {
            key: 'undefinedType',
            get: function get() {
                var result = this._undefinedType;
                if (!result) {
                    result = this._undefinedType = this.query.getBuiltinType(BuiltinType.Undefined);
                }
                return result;
            }
        }]);

        return AstType;
    }();

    var AstPath = function (_AstPath$2) {
        _inherits(AstPath, _AstPath$2);

        function AstPath(ast, position) {
            var excludeEmpty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            _classCallCheck(this, AstPath);

            var _this8 = _possibleConstructorReturn(this, (AstPath.__proto__ || Object.getPrototypeOf(AstPath)).call(this, new AstPathVisitor(position, excludeEmpty).buildPath(ast).path));

            _this8.position = position;
            return _this8;
        }

        return AstPath;
    }(AstPath$1);

    var AstPathVisitor = function (_NullVisitor) {
        _inherits(AstPathVisitor, _NullVisitor);

        function AstPathVisitor(position, excludeEmpty) {
            _classCallCheck(this, AstPathVisitor);

            var _this9 = _possibleConstructorReturn(this, (AstPathVisitor.__proto__ || Object.getPrototypeOf(AstPathVisitor)).call(this));

            _this9.position = position;
            _this9.excludeEmpty = excludeEmpty;
            _this9.path = [];
            return _this9;
        }

        _createClass(AstPathVisitor, [{
            key: 'visit',
            value: function visit(ast) {
                if ((!this.excludeEmpty || ast.span.start < ast.span.end) && inSpan(this.position, ast.span)) {
                    this.path.push(ast);
                    visitChildren(ast, this);
                }
            }
        }, {
            key: 'buildPath',
            value: function buildPath(ast) {
                // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
                // the visit() method above would never see it.
                if (ast instanceof _compiler.ASTWithSource) {
                    ast = ast.ast;
                }
                this.visit(ast);
                return this;
            }
        }]);

        return AstPathVisitor;
    }(NullVisitor);

    // TODO: Consider moving to expression_parser/ast
    function visitChildren(ast, visitor) {
        function visit(ast) {
            visitor.visit && visitor.visit(ast) || ast.visit(visitor);
        }
        function visitAll(asts) {
            asts.forEach(visit);
        }
        ast.visit({
            visitBinary: function visitBinary(ast) {
                visit(ast.left);
                visit(ast.right);
            },
            visitChain: function visitChain(ast) {
                visitAll(ast.expressions);
            },
            visitConditional: function visitConditional(ast) {
                visit(ast.condition);
                visit(ast.trueExp);
                visit(ast.falseExp);
            },
            visitFunctionCall: function visitFunctionCall(ast) {
                visit(ast.target);
                visitAll(ast.args);
            },
            visitImplicitReceiver: function visitImplicitReceiver(ast) {},
            visitInterpolation: function visitInterpolation(ast) {
                visitAll(ast.expressions);
            },
            visitKeyedRead: function visitKeyedRead(ast) {
                visit(ast.obj);
                visit(ast.key);
            },
            visitKeyedWrite: function visitKeyedWrite(ast) {
                visit(ast.obj);
                visit(ast.key);
                visit(ast.obj);
            },
            visitLiteralArray: function visitLiteralArray(ast) {
                visitAll(ast.expressions);
            },
            visitLiteralMap: function visitLiteralMap(ast) {},
            visitLiteralPrimitive: function visitLiteralPrimitive(ast) {},
            visitMethodCall: function visitMethodCall(ast) {
                visit(ast.receiver);
                visitAll(ast.args);
            },
            visitPipe: function visitPipe(ast) {
                visit(ast.exp);
                visitAll(ast.args);
            },
            visitPrefixNot: function visitPrefixNot(ast) {
                visit(ast.expression);
            },
            visitPropertyRead: function visitPropertyRead(ast) {
                visit(ast.receiver);
            },
            visitPropertyWrite: function visitPropertyWrite(ast) {
                visit(ast.receiver);
                visit(ast.value);
            },
            visitQuote: function visitQuote(ast) {},
            visitSafeMethodCall: function visitSafeMethodCall(ast) {
                visit(ast.receiver);
                visitAll(ast.args);
            },
            visitSafePropertyRead: function visitSafePropertyRead(ast) {
                visit(ast.receiver);
            }
        });
    }
    function getExpressionScope(info, path, includeEvent) {
        var result = info.template.members;
        var references = getReferences(info);
        var variables = getVarDeclarations(info, path);
        var events = getEventDeclaration(info, path, includeEvent);
        if (references.length || variables.length || events.length) {
            var referenceTable = info.template.query.createSymbolTable(references);
            var variableTable = info.template.query.createSymbolTable(variables);
            var eventsTable = info.template.query.createSymbolTable(events);
            result = info.template.query.mergeSymbolTable([result, referenceTable, variableTable, eventsTable]);
        }
        return result;
    }
    function getEventDeclaration(info, path, includeEvent) {
        var result = [];
        if (includeEvent) {
            // TODO: Determine the type of the event parameter based on the Observable<T> or EventEmitter<T>
            // of the event.
            result = [{
                name: '$event',
                kind: 'variable',
                type: info.template.query.getBuiltinType(BuiltinType.Any)
            }];
        }
        return result;
    }
    function getReferences(info) {
        var result = [];
        function processReferences(references) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                var _loop = function _loop() {
                    var reference = _step3.value;

                    var type = void 0;
                    if (reference.value) {
                        type = info.template.query.getTypeSymbol((0, _compiler.tokenReference)(reference.value));
                    }
                    result.push({
                        name: reference.name,
                        kind: 'reference',
                        type: type || info.template.query.getBuiltinType(BuiltinType.Any),
                        get definition() {
                            return getDefintionOf(info, reference);
                        }
                    });
                };

                for (var _iterator3 = references[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
        var visitor = new (function (_TemplateAstChildVisi2) {
            _inherits(_class, _TemplateAstChildVisi2);

            function _class() {
                _classCallCheck(this, _class);

                return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
            }

            _createClass(_class, [{
                key: 'visitEmbeddedTemplate',
                value: function visitEmbeddedTemplate(ast, context) {
                    _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'visitEmbeddedTemplate', this).call(this, ast, context);
                    processReferences(ast.references);
                }
            }, {
                key: 'visitElement',
                value: function visitElement(ast, context) {
                    _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'visitElement', this).call(this, ast, context);
                    processReferences(ast.references);
                }
            }]);

            return _class;
        }(TemplateAstChildVisitor))();
        (0, _compiler.templateVisitAll)(visitor, info.templateAst);
        return result;
    }
    function getVarDeclarations(info, path) {
        var result = [];
        var current = path.tail;
        while (current) {
            if (current instanceof _compiler.EmbeddedTemplateAst) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    var _loop2 = function _loop2() {
                        var variable = _step4.value;

                        var name = variable.name;
                        // Find the first directive with a context.
                        var context = current.directives.map(function (d) {
                            return info.template.query.getTemplateContext(d.directive.type.reference);
                        }).find(function (c) {
                            return !!c;
                        });
                        // Determine the type of the context field referenced by variable.value.
                        var type = void 0;
                        if (context) {
                            var value = context.get(variable.value);
                            if (value) {
                                type = value.type;
                                var kind = info.template.query.getTypeKind(type);
                                if (kind === BuiltinType.Any || kind == BuiltinType.Unbound) {
                                    // The any type is not very useful here. For special cases, such as ngFor, we can do
                                    // better.
                                    type = refinedVariableType(type, info, current);
                                }
                            }
                        }
                        if (!type) {
                            type = info.template.query.getBuiltinType(BuiltinType.Any);
                        }
                        result.push({
                            name: name,
                            kind: 'variable', type: type, get definition() {
                                return getDefintionOf(info, variable);
                            }
                        });
                    };

                    for (var _iterator4 = current.variables[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        _loop2();
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
            current = path.parentOf(current);
        }
        return result;
    }
    function refinedVariableType(type, info, templateElement) {
        // Special case the ngFor directive
        var ngForDirective = templateElement.directives.find(function (d) {
            var name = (0, _compiler.identifierName)(d.directive.type);
            return name == 'NgFor' || name == 'NgForOf';
        });
        if (ngForDirective) {
            var ngForOfBinding = ngForDirective.inputs.find(function (i) {
                return i.directiveName == 'ngForOf';
            });
            if (ngForOfBinding) {
                var bindingType = new AstType(info.template.members, info.template.query, {}).getType(ngForOfBinding.value);
                if (bindingType) {
                    return info.template.query.getElementType(bindingType);
                }
            }
        }
        // We can't do better, just return the original type.
        return type;
    }
    function getDefintionOf(info, ast) {
        if (info.fileName) {
            var templateOffset = info.template.span.start;
            return [{
                fileName: info.fileName,
                span: {
                    start: ast.sourceSpan.start.offset + templateOffset,
                    end: ast.sourceSpan.end.offset + templateOffset
                }
            }];
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var values = ['ID', 'CDATA', 'NAME', ['ltr', 'rtl'], ['rect', 'circle', 'poly', 'default'], 'NUMBER', ['nohref'], ['ismap'], ['declare'], ['DATA', 'REF', 'OBJECT'], ['GET', 'POST'], 'IDREF', ['TEXT', 'PASSWORD', 'CHECKBOX', 'RADIO', 'SUBMIT', 'RESET', 'FILE', 'HIDDEN', 'IMAGE', 'BUTTON'], ['checked'], ['disabled'], ['readonly'], ['multiple'], ['selected'], ['button', 'submit', 'reset'], ['void', 'above', 'below', 'hsides', 'lhs', 'rhs', 'vsides', 'box', 'border'], ['none', 'groups', 'rows', 'cols', 'all'], ['left', 'center', 'right', 'justify', 'char'], ['top', 'middle', 'bottom', 'baseline'], 'IDREFS', ['row', 'col', 'rowgroup', 'colgroup'], ['defer']];
    var groups = [{ id: 0 }, {
        onclick: 1,
        ondblclick: 1,
        onmousedown: 1,
        onmouseup: 1,
        onmouseover: 1,
        onmousemove: 1,
        onmouseout: 1,
        onkeypress: 1,
        onkeydown: 1,
        onkeyup: 1
    }, { lang: 2, dir: 3 }, { onload: 1, onunload: 1 }, { name: 1 }, { href: 1 }, { type: 1 }, { alt: 1 }, { tabindex: 5 }, { media: 1 }, { nohref: 6 }, { usemap: 1 }, { src: 1 }, { onfocus: 1, onblur: 1 }, { charset: 1 }, { declare: 8, classid: 1, codebase: 1, data: 1, codetype: 1, archive: 1, standby: 1 }, { title: 1 }, { value: 1 }, { cite: 1 }, { datetime: 1 }, { accept: 1 }, { shape: 4, coords: 1 }, { for: 11
    }, { action: 1, method: 10, enctype: 1, onsubmit: 1, onreset: 1, 'accept-charset': 1 }, { valuetype: 9 }, { longdesc: 1 }, { width: 1 }, { disabled: 14 }, { readonly: 15, onselect: 1 }, { accesskey: 1 }, { size: 5, multiple: 16 }, { onchange: 1 }, { label: 1 }, { selected: 17 }, { type: 12, checked: 13, size: 1, maxlength: 5 }, { rows: 5, cols: 5 }, { type: 18 }, { height: 1 }, { summary: 1, border: 1, frame: 19, rules: 20, cellspacing: 1, cellpadding: 1, datapagesize: 1 }, { align: 21, char: 1, charoff: 1, valign: 22 }, { span: 5 }, { abbr: 1, axis: 1, headers: 23, scope: 24, rowspan: 5, colspan: 5 }, { profile: 1 }, { 'http-equiv': 2, name: 2, content: 1, scheme: 1 }, { class: 1, style: 1 }, { hreflang: 2, rel: 1, rev: 1 }, { ismap: 7 }, { defer: 25, event: 1, for: 1 }];
    var elements = {
        TT: [0, 1, 2, 16, 44],
        I: [0, 1, 2, 16, 44],
        B: [0, 1, 2, 16, 44],
        BIG: [0, 1, 2, 16, 44],
        SMALL: [0, 1, 2, 16, 44],
        EM: [0, 1, 2, 16, 44],
        STRONG: [0, 1, 2, 16, 44],
        DFN: [0, 1, 2, 16, 44],
        CODE: [0, 1, 2, 16, 44],
        SAMP: [0, 1, 2, 16, 44],
        KBD: [0, 1, 2, 16, 44],
        VAR: [0, 1, 2, 16, 44],
        CITE: [0, 1, 2, 16, 44],
        ABBR: [0, 1, 2, 16, 44],
        ACRONYM: [0, 1, 2, 16, 44],
        SUB: [0, 1, 2, 16, 44],
        SUP: [0, 1, 2, 16, 44],
        SPAN: [0, 1, 2, 16, 44],
        BDO: [0, 2, 16, 44],
        BR: [0, 16, 44],
        BODY: [0, 1, 2, 3, 16, 44],
        ADDRESS: [0, 1, 2, 16, 44],
        DIV: [0, 1, 2, 16, 44],
        A: [0, 1, 2, 4, 5, 6, 8, 13, 14, 16, 21, 29, 44, 45],
        MAP: [0, 1, 2, 4, 16, 44],
        AREA: [0, 1, 2, 5, 7, 8, 10, 13, 16, 21, 29, 44],
        LINK: [0, 1, 2, 5, 6, 9, 14, 16, 44, 45],
        IMG: [0, 1, 2, 4, 7, 11, 12, 16, 25, 26, 37, 44, 46],
        OBJECT: [0, 1, 2, 4, 6, 8, 11, 15, 16, 26, 37, 44],
        PARAM: [0, 4, 6, 17, 24],
        HR: [0, 1, 2, 16, 44],
        P: [0, 1, 2, 16, 44],
        H1: [0, 1, 2, 16, 44],
        H2: [0, 1, 2, 16, 44],
        H3: [0, 1, 2, 16, 44],
        H4: [0, 1, 2, 16, 44],
        H5: [0, 1, 2, 16, 44],
        H6: [0, 1, 2, 16, 44],
        PRE: [0, 1, 2, 16, 44],
        Q: [0, 1, 2, 16, 18, 44],
        BLOCKQUOTE: [0, 1, 2, 16, 18, 44],
        INS: [0, 1, 2, 16, 18, 19, 44],
        DEL: [0, 1, 2, 16, 18, 19, 44],
        DL: [0, 1, 2, 16, 44],
        DT: [0, 1, 2, 16, 44],
        DD: [0, 1, 2, 16, 44],
        OL: [0, 1, 2, 16, 44],
        UL: [0, 1, 2, 16, 44],
        LI: [0, 1, 2, 16, 44],
        FORM: [0, 1, 2, 4, 16, 20, 23, 44],
        LABEL: [0, 1, 2, 13, 16, 22, 29, 44],
        INPUT: [0, 1, 2, 4, 7, 8, 11, 12, 13, 16, 17, 20, 27, 28, 29, 31, 34, 44, 46],
        SELECT: [0, 1, 2, 4, 8, 13, 16, 27, 30, 31, 44],
        OPTGROUP: [0, 1, 2, 16, 27, 32, 44],
        OPTION: [0, 1, 2, 16, 17, 27, 32, 33, 44],
        TEXTAREA: [0, 1, 2, 4, 8, 13, 16, 27, 28, 29, 31, 35, 44],
        FIELDSET: [0, 1, 2, 16, 44],
        LEGEND: [0, 1, 2, 16, 29, 44],
        BUTTON: [0, 1, 2, 4, 8, 13, 16, 17, 27, 29, 36, 44],
        TABLE: [0, 1, 2, 16, 26, 38, 44],
        CAPTION: [0, 1, 2, 16, 44],
        COLGROUP: [0, 1, 2, 16, 26, 39, 40, 44],
        COL: [0, 1, 2, 16, 26, 39, 40, 44],
        THEAD: [0, 1, 2, 16, 39, 44],
        TBODY: [0, 1, 2, 16, 39, 44],
        TFOOT: [0, 1, 2, 16, 39, 44],
        TR: [0, 1, 2, 16, 39, 44],
        TH: [0, 1, 2, 16, 39, 41, 44],
        TD: [0, 1, 2, 16, 39, 41, 44],
        HEAD: [2, 42],
        TITLE: [2],
        BASE: [5],
        META: [2, 43],
        STYLE: [2, 6, 9, 16],
        SCRIPT: [6, 12, 14, 47],
        NOSCRIPT: [0, 1, 2, 16, 44],
        HTML: [2]
    };
    var defaultAttributes = [0, 1, 2, 4];
    function elementNames() {
        return Object.keys(elements).sort().map(function (v) {
            return v.toLowerCase();
        });
    }
    function compose(indexes) {
        var result = {};
        if (indexes) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = indexes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var index = _step5.value;

                    var group = groups[index];
                    for (var name in group) {
                        if (group.hasOwnProperty(name)) result[name] = values[group[name]];
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
        return result;
    }
    function attributeNames(element) {
        return Object.keys(compose(elements[element.toUpperCase()] || defaultAttributes)).sort();
    }
    // This section is describes the DOM property surface of a DOM element and is dervided from
    // from the SCHEMA strings from the security context information. SCHEMA is copied here because
    // it would be an unnecessary risk to allow this array to be imported from the security context
    // schema registry.
    var SCHEMA = ['[Element]|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop', '[HTMLElement]^[Element]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate', 'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate', 'media^[HTMLElement]|!autoplay,!controls,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,#playbackRate,preload,src,%srcObject,#volume', ':svg:^[HTMLElement]|*abort,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex', ':svg:graphics^:svg:|', ':svg:animation^:svg:|*begin,*end,*repeat', ':svg:geometry^:svg:|', ':svg:componentTransferFunction^:svg:|', ':svg:gradient^:svg:|', ':svg:textContent^:svg:graphics|', ':svg:textPositioning^:svg:textContent|', 'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username', 'area^[HTMLElement]|alt,coords,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,search,shape,target,username', 'audio^media|', 'br^[HTMLElement]|clear', 'base^[HTMLElement]|href,target', 'body^[HTMLElement]|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink', 'button^[HTMLElement]|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value', 'canvas^[HTMLElement]|#height,#width', 'content^[HTMLElement]|select', 'dl^[HTMLElement]|!compact', 'datalist^[HTMLElement]|', 'details^[HTMLElement]|!open', 'dialog^[HTMLElement]|!open,returnValue', 'dir^[HTMLElement]|!compact', 'div^[HTMLElement]|align', 'embed^[HTMLElement]|align,height,name,src,type,width', 'fieldset^[HTMLElement]|!disabled,name', 'font^[HTMLElement]|color,face,size', 'form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target', 'frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src', 'frameset^[HTMLElement]|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows', 'hr^[HTMLElement]|align,color,!noShade,size,width', 'head^[HTMLElement]|', 'h1,h2,h3,h4,h5,h6^[HTMLElement]|align', 'html^[HTMLElement]|version', 'iframe^[HTMLElement]|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width', 'img^[HTMLElement]|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width', 'input^[HTMLElement]|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width', 'keygen^[HTMLElement]|!autofocus,challenge,!disabled,keytype,name', 'li^[HTMLElement]|type,#value', 'label^[HTMLElement]|htmlFor', 'legend^[HTMLElement]|align', 'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,rel,%relList,rev,%sizes,target,type', 'map^[HTMLElement]|name', 'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width', 'menu^[HTMLElement]|!compact', 'meta^[HTMLElement]|content,httpEquiv,name,scheme', 'meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value', 'ins,del^[HTMLElement]|cite,dateTime', 'ol^[HTMLElement]|!compact,!reversed,#start,type', 'object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width', 'optgroup^[HTMLElement]|!disabled,label', 'option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value', 'output^[HTMLElement]|defaultValue,%htmlFor,name,value', 'p^[HTMLElement]|align', 'param^[HTMLElement]|name,type,value,valueType', 'picture^[HTMLElement]|', 'pre^[HTMLElement]|#width', 'progress^[HTMLElement]|#max,#value', 'q,blockquote,cite^[HTMLElement]|', 'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type', 'select^[HTMLElement]|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value', 'shadow^[HTMLElement]|', 'source^[HTMLElement]|media,sizes,src,srcset,type', 'span^[HTMLElement]|', 'style^[HTMLElement]|!disabled,media,type', 'caption^[HTMLElement]|align', 'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width', 'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width', 'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width', 'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign', 'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign', 'template^[HTMLElement]|', 'textarea^[HTMLElement]|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap', 'title^[HTMLElement]|text', 'track^[HTMLElement]|!default,kind,label,src,srclang', 'ul^[HTMLElement]|!compact,type', 'unknown^[HTMLElement]|', 'video^media|#height,poster,#width', ':svg:a^:svg:graphics|', ':svg:animate^:svg:animation|', ':svg:animateMotion^:svg:animation|', ':svg:animateTransform^:svg:animation|', ':svg:circle^:svg:geometry|', ':svg:clipPath^:svg:graphics|', ':svg:cursor^:svg:|', ':svg:defs^:svg:graphics|', ':svg:desc^:svg:|', ':svg:discard^:svg:|', ':svg:ellipse^:svg:geometry|', ':svg:feBlend^:svg:|', ':svg:feColorMatrix^:svg:|', ':svg:feComponentTransfer^:svg:|', ':svg:feComposite^:svg:|', ':svg:feConvolveMatrix^:svg:|', ':svg:feDiffuseLighting^:svg:|', ':svg:feDisplacementMap^:svg:|', ':svg:feDistantLight^:svg:|', ':svg:feDropShadow^:svg:|', ':svg:feFlood^:svg:|', ':svg:feFuncA^:svg:componentTransferFunction|', ':svg:feFuncB^:svg:componentTransferFunction|', ':svg:feFuncG^:svg:componentTransferFunction|', ':svg:feFuncR^:svg:componentTransferFunction|', ':svg:feGaussianBlur^:svg:|', ':svg:feImage^:svg:|', ':svg:feMerge^:svg:|', ':svg:feMergeNode^:svg:|', ':svg:feMorphology^:svg:|', ':svg:feOffset^:svg:|', ':svg:fePointLight^:svg:|', ':svg:feSpecularLighting^:svg:|', ':svg:feSpotLight^:svg:|', ':svg:feTile^:svg:|', ':svg:feTurbulence^:svg:|', ':svg:filter^:svg:|', ':svg:foreignObject^:svg:graphics|', ':svg:g^:svg:graphics|', ':svg:image^:svg:graphics|', ':svg:line^:svg:geometry|', ':svg:linearGradient^:svg:gradient|', ':svg:mpath^:svg:|', ':svg:marker^:svg:|', ':svg:mask^:svg:|', ':svg:metadata^:svg:|', ':svg:path^:svg:geometry|', ':svg:pattern^:svg:|', ':svg:polygon^:svg:geometry|', ':svg:polyline^:svg:geometry|', ':svg:radialGradient^:svg:gradient|', ':svg:rect^:svg:geometry|', ':svg:svg^:svg:graphics|#currentScale,#zoomAndPan', ':svg:script^:svg:|type', ':svg:set^:svg:animation|', ':svg:stop^:svg:|', ':svg:style^:svg:|!disabled,media,title,type', ':svg:switch^:svg:graphics|', ':svg:symbol^:svg:|', ':svg:tspan^:svg:textPositioning|', ':svg:text^:svg:textPositioning|', ':svg:textPath^:svg:textContent|', ':svg:title^:svg:|', ':svg:use^:svg:graphics|', ':svg:view^:svg:|#zoomAndPan', 'data^[HTMLElement]|value', 'menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default', 'summary^[HTMLElement]|', 'time^[HTMLElement]|dateTime'];
    var EVENT = 'event';
    var BOOLEAN = 'boolean';
    var NUMBER = 'number';
    var STRING = 'string';
    var OBJECT = 'object';

    var SchemaInformation = function () {
        function SchemaInformation() {
            var _this11 = this;

            _classCallCheck(this, SchemaInformation);

            this.schema = {};
            SCHEMA.forEach(function (encodedType) {
                var parts = encodedType.split('|');
                var properties = parts[1].split(',');
                var typeParts = (parts[0] + '^').split('^');
                var typeName = typeParts[0];
                var type = {};
                typeName.split(',').forEach(function (tag) {
                    return _this11.schema[tag.toLowerCase()] = type;
                });
                var superName = typeParts[1];
                var superType = superName && _this11.schema[superName.toLowerCase()];
                if (superType) {
                    for (var key in superType) {
                        type[key] = superType[key];
                    }
                }
                properties.forEach(function (property) {
                    if (property == '') {} else if (property.startsWith('*')) {
                        type[property.substring(1)] = EVENT;
                    } else if (property.startsWith('!')) {
                        type[property.substring(1)] = BOOLEAN;
                    } else if (property.startsWith('#')) {
                        type[property.substring(1)] = NUMBER;
                    } else if (property.startsWith('%')) {
                        type[property.substring(1)] = OBJECT;
                    } else {
                        type[property] = STRING;
                    }
                });
            });
        }

        _createClass(SchemaInformation, [{
            key: 'allKnownElements',
            value: function allKnownElements() {
                return Object.keys(this.schema);
            }
        }, {
            key: 'eventsOf',
            value: function eventsOf(elementName) {
                var elementType = this.schema[elementName.toLowerCase()] || {};
                return Object.keys(elementType).filter(function (property) {
                    return elementType[property] === EVENT;
                });
            }
        }, {
            key: 'propertiesOf',
            value: function propertiesOf(elementName) {
                var elementType = this.schema[elementName.toLowerCase()] || {};
                return Object.keys(elementType).filter(function (property) {
                    return elementType[property] !== EVENT;
                });
            }
        }, {
            key: 'typeOf',
            value: function typeOf(elementName, property) {
                return (this.schema[elementName.toLowerCase()] || {})[property];
            }
        }], [{
            key: 'instance',
            get: function get() {
                var result = SchemaInformation._instance;
                if (!result) {
                    result = SchemaInformation._instance = new SchemaInformation();
                }
                return result;
            }
        }]);

        return SchemaInformation;
    }();

    function eventNames(elementName) {
        return SchemaInformation.instance.eventsOf(elementName);
    }
    function propertyNames(elementName) {
        return SchemaInformation.instance.propertiesOf(elementName);
    }

    var HtmlAstPath = function (_AstPath$3) {
        _inherits(HtmlAstPath, _AstPath$3);

        function HtmlAstPath(ast, position) {
            _classCallCheck(this, HtmlAstPath);

            var _this12 = _possibleConstructorReturn(this, (HtmlAstPath.__proto__ || Object.getPrototypeOf(HtmlAstPath)).call(this, buildPath(ast, position)));

            _this12.position = position;
            return _this12;
        }

        return HtmlAstPath;
    }(AstPath$1);

    function buildPath(ast, position) {
        var visitor = new HtmlAstPathBuilder(position);
        (0, _compiler.visitAll)(visitor, ast);
        return visitor.getPath();
    }

    var ChildVisitor = function () {
        function ChildVisitor(visitor) {
            _classCallCheck(this, ChildVisitor);

            this.visitor = visitor;
        }

        _createClass(ChildVisitor, [{
            key: 'visitElement',
            value: function visitElement(ast, context) {
                this.visitChildren(context, function (visit) {
                    visit(ast.attrs);
                    visit(ast.children);
                });
            }
        }, {
            key: 'visitAttribute',
            value: function visitAttribute(ast, context) {}
        }, {
            key: 'visitText',
            value: function visitText(ast, context) {}
        }, {
            key: 'visitComment',
            value: function visitComment(ast, context) {}
        }, {
            key: 'visitExpansion',
            value: function visitExpansion(ast, context) {
                return this.visitChildren(context, function (visit) {
                    visit(ast.cases);
                });
            }
        }, {
            key: 'visitExpansionCase',
            value: function visitExpansionCase(ast, context) {}
        }, {
            key: 'visitChildren',
            value: function visitChildren(context, cb) {
                var visitor = this.visitor || this;
                var results = [];
                function visit(children) {
                    if (children) results.push((0, _compiler.visitAll)(visitor, children, context));
                }
                cb(visit);
                return [].concat.apply([], results);
            }
        }]);

        return ChildVisitor;
    }();

    var HtmlAstPathBuilder = function (_ChildVisitor) {
        _inherits(HtmlAstPathBuilder, _ChildVisitor);

        function HtmlAstPathBuilder(position) {
            _classCallCheck(this, HtmlAstPathBuilder);

            var _this13 = _possibleConstructorReturn(this, (HtmlAstPathBuilder.__proto__ || Object.getPrototypeOf(HtmlAstPathBuilder)).call(this));

            _this13.position = position;
            _this13.path = [];
            return _this13;
        }

        _createClass(HtmlAstPathBuilder, [{
            key: 'visit',
            value: function visit(ast, context) {
                var span = spanOf(ast);
                if (inSpan(this.position, span)) {
                    this.path.push(ast);
                } else {
                    // Returning a value here will result in the children being skipped.
                    return true;
                }
            }
        }, {
            key: 'getPath',
            value: function getPath() {
                return this.path;
            }
        }]);

        return HtmlAstPathBuilder;
    }(ChildVisitor);

    var TEMPLATE_ATTR_PREFIX = '*';
    var hiddenHtmlElements = {
        html: true,
        script: true,
        noscript: true,
        base: true,
        body: true,
        title: true,
        head: true,
        link: true
    };
    function getTemplateCompletions(templateInfo) {
        var result = undefined;
        var htmlAst = templateInfo.htmlAst,
            templateAst = templateInfo.templateAst,
            template = templateInfo.template;

        // The templateNode starts at the delimiter character so we add 1 to skip it.
        var templatePosition = templateInfo.position - template.span.start;
        var path = new HtmlAstPath(htmlAst, templatePosition);
        var mostSpecific = path.tail;
        if (path.empty) {
            result = elementCompletions(templateInfo, path);
        } else {
            var astPosition = templatePosition - mostSpecific.sourceSpan.start.offset;
            mostSpecific.visit({
                visitElement: function visitElement(ast) {
                    var startTagSpan = spanOf(ast.sourceSpan);
                    var tagLen = ast.name.length;
                    if (templatePosition <= startTagSpan.start + tagLen + 1 /* 1 for the opening angle bracked */) {
                            // If we are in the tag then return the element completions.
                            result = elementCompletions(templateInfo, path);
                        } else if (templatePosition < startTagSpan.end) {
                        // We are in the attribute section of the element (but not in an attribute).
                        // Return the attribute completions.
                        result = attributeCompletions(templateInfo, path);
                    }
                },
                visitAttribute: function visitAttribute(ast) {
                    if (!ast.valueSpan || !inSpan(templatePosition, spanOf(ast.valueSpan))) {
                        // We are in the name of an attribute. Show attribute completions.
                        result = attributeCompletions(templateInfo, path);
                    } else if (ast.valueSpan && inSpan(templatePosition, spanOf(ast.valueSpan))) {
                        result = attributeValueCompletions(templateInfo, templatePosition, ast);
                    }
                },
                visitText: function visitText(ast) {
                    // Check if we are in a entity.
                    result = entityCompletions(getSourceText(template, spanOf(ast)), astPosition);
                    if (result) return result;
                    result = interpolationCompletions(templateInfo, templatePosition);
                    if (result) return result;
                    var element = path.first(Element$1);
                    if (element) {
                        var definition = (0, _compiler.getHtmlTagDefinition)(element.name);
                        if (definition.contentType === _compiler.TagContentType.PARSABLE_DATA) {
                            result = voidElementAttributeCompletions(templateInfo, path);
                            if (!result) {
                                // If the element can hold content Show element completions.
                                result = elementCompletions(templateInfo, path);
                            }
                        }
                    } else {
                        // If no element container, implies parsable data so show elements.
                        result = voidElementAttributeCompletions(templateInfo, path);
                        if (!result) {
                            result = elementCompletions(templateInfo, path);
                        }
                    }
                },
                visitComment: function visitComment(ast) {},
                visitExpansion: function visitExpansion(ast) {},
                visitExpansionCase: function visitExpansionCase(ast) {}
            }, null);
        }
        return result;
    }
    function attributeCompletions(info, path) {
        var item = path.tail instanceof Element$1 ? path.tail : path.parentOf(path.tail);
        if (item instanceof Element$1) {
            return attributeCompletionsForElement(info, item.name, item);
        }
        return undefined;
    }
    function attributeCompletionsForElement(info, elementName, element) {
        var attributes = getAttributeInfosForElement(info, elementName, element);
        // Map all the attributes to a completion
        return attributes.map(function (attr) {
            return {
                kind: attr.fromHtml ? 'html attribute' : 'attribute',
                name: nameOfAttr(attr),
                sort: attr.name
            };
        });
    }
    function getAttributeInfosForElement(info, elementName, element) {
        var attributes = [];
        // Add html attributes
        var htmlAttributes = attributeNames(elementName) || [];
        if (htmlAttributes) {
            attributes.push.apply(attributes, _toConsumableArray(htmlAttributes.map(function (name) {
                return { name: name, fromHtml: true };
            })));
        }
        // Add html properties
        var htmlProperties = propertyNames(elementName);
        if (htmlProperties) {
            attributes.push.apply(attributes, _toConsumableArray(htmlProperties.map(function (name) {
                return { name: name, input: true };
            })));
        }
        // Add html events
        var htmlEvents = eventNames(elementName);
        if (htmlEvents) {
            attributes.push.apply(attributes, _toConsumableArray(htmlEvents.map(function (name) {
                return { name: name, output: true };
            })));
        }

        var _getSelectors = getSelectors(info),
            selectors = _getSelectors.selectors,
            selectorMap = _getSelectors.map;

        if (selectors && selectors.length) {
            // All the attributes that are selectable should be shown.
            var applicableSelectors = selectors.filter(function (selector) {
                return !selector.element || selector.element == elementName;
            });
            var selectorAndAttributeNames = applicableSelectors.map(function (selector) {
                return { selector: selector, attrs: selector.attrs.filter(function (a) {
                        return !!a;
                    }) };
            });
            var attrs = flatten(selectorAndAttributeNames.map(function (selectorAndAttr) {
                var directive = selectorMap.get(selectorAndAttr.selector);
                var result = selectorAndAttr.attrs.map(function (name) {
                    return { name: name, input: name in directive.inputs, output: name in directive.outputs };
                });
                return result;
            }));
            // Add template attribute if a directive contains a template reference
            selectorAndAttributeNames.forEach(function (selectorAndAttr) {
                var selector = selectorAndAttr.selector;
                var directive = selectorMap.get(selector);
                if (directive && hasTemplateReference(directive.type) && selector.attrs.length && selector.attrs[0]) {
                    attrs.push({ name: selector.attrs[0], template: true });
                }
            });
            // All input and output properties of the matching directives should be added.
            var elementSelector = element ? createElementCssSelector(element) : createElementCssSelector(new Element$1(elementName, [], [], undefined, undefined, undefined));
            var matcher = new _compiler.SelectorMatcher();
            matcher.addSelectables(selectors);
            matcher.match(elementSelector, function (selector) {
                var directive = selectorMap.get(selector);
                if (directive) {
                    var _attrs, _attrs2;

                    (_attrs = attrs).push.apply(_attrs, _toConsumableArray(Object.keys(directive.inputs).map(function (name) {
                        return { name: name, input: true };
                    })));
                    (_attrs2 = attrs).push.apply(_attrs2, _toConsumableArray(Object.keys(directive.outputs).map(function (name) {
                        return { name: name, output: true };
                    })));
                }
            });
            // If a name shows up twice, fold it into a single value.
            attrs = foldAttrs(attrs);
            // Now expand them back out to ensure that input/output shows up as well as input and
            // output.
            attributes.push.apply(attributes, _toConsumableArray(flatten(attrs.map(expandedAttr))));
        }
        return attributes;
    }
    function attributeValueCompletions(info, position, attr) {
        var path = new TemplateAstPath(info.templateAst, position);
        var mostSpecific = path.tail;
        if (mostSpecific) {
            var visitor = new ExpressionVisitor(info, position, attr, function () {
                return getExpressionScope(info, path, false);
            });
            mostSpecific.visit(visitor, null);
            if (!visitor.result || !visitor.result.length) {
                // Try allwoing widening the path
                var widerPath = new TemplateAstPath(info.templateAst, position, /* allowWidening */true);
                if (widerPath.tail) {
                    var widerVisitor = new ExpressionVisitor(info, position, attr, function () {
                        return getExpressionScope(info, widerPath, false);
                    });
                    widerPath.tail.visit(widerVisitor, null);
                    return widerVisitor.result;
                }
            }
            return visitor.result;
        }
    }
    function elementCompletions(info, path) {
        var htmlNames = elementNames().filter(function (name) {
            return !(name in hiddenHtmlElements);
        });
        // Collect the elements referenced by the selectors
        var directiveElements = getSelectors(info).selectors.map(function (selector) {
            return selector.element;
        }).filter(function (name) {
            return !!name;
        });
        var components = directiveElements.map(function (name) {
            return { kind: 'component', name: name, sort: name };
        });
        var htmlElements = htmlNames.map(function (name) {
            return { kind: 'element', name: name, sort: name };
        });
        // Return components and html elements
        return uniqueByName(htmlElements.concat(components));
    }
    function entityCompletions(value, position) {
        // Look for entity completions
        var re = /&[A-Za-z]*;?(?!\d)/g;
        var found = void 0;
        var result = void 0;
        while (found = re.exec(value)) {
            var len = found[0].length;
            if (position >= found.index && position < found.index + len) {
                result = Object.keys(_compiler.NAMED_ENTITIES).map(function (name) {
                    return { kind: 'entity', name: '&' + name + ';', sort: name };
                });
                break;
            }
        }
        return result;
    }
    function interpolationCompletions(info, position) {
        // Look for an interpolation in at the position.
        var templatePath = new TemplateAstPath(info.templateAst, position);
        var mostSpecific = templatePath.tail;
        if (mostSpecific) {
            var visitor = new ExpressionVisitor(info, position, undefined, function () {
                return getExpressionScope(info, templatePath, false);
            });
            mostSpecific.visit(visitor, null);
            return uniqueByName(visitor.result);
        }
    }
    // There is a special case of HTML where text that contains a unclosed tag is treated as
    // text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
    // element "Some <a text". We, however, want to treat this as if the user was requesting
    // the attributes of an "a" element, not requesting completion in the a text element. This
    // code checks for this case and returns element completions if it is detected or undefined
    // if it is not.
    function voidElementAttributeCompletions(info, path) {
        var tail = path.tail;
        if (tail instanceof _compiler.Text) {
            var match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
            // The position must be after the match, otherwise we are still in a place where elements
            // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
            if (match && path.position >= match.index + match[0].length + tail.sourceSpan.start.offset) {
                return attributeCompletionsForElement(info, match[3]);
            }
        }
    }

    var ExpressionVisitor = function (_NullTemplateVisitor) {
        _inherits(ExpressionVisitor, _NullTemplateVisitor);

        function ExpressionVisitor(info, position, attr, getExpressionScope) {
            _classCallCheck(this, ExpressionVisitor);

            var _this14 = _possibleConstructorReturn(this, (ExpressionVisitor.__proto__ || Object.getPrototypeOf(ExpressionVisitor)).call(this));

            _this14.info = info;
            _this14.position = position;
            _this14.attr = attr;
            _this14.getExpressionScope = getExpressionScope;
            if (!getExpressionScope) {
                _this14.getExpressionScope = function () {
                    return info.template.members;
                };
            }
            return _this14;
        }

        _createClass(ExpressionVisitor, [{
            key: 'visitDirectiveProperty',
            value: function visitDirectiveProperty(ast) {
                this.attributeValueCompletions(ast.value);
            }
        }, {
            key: 'visitElementProperty',
            value: function visitElementProperty(ast) {
                this.attributeValueCompletions(ast.value);
            }
        }, {
            key: 'visitEvent',
            value: function visitEvent(ast) {
                this.attributeValueCompletions(ast.handler);
            }
        }, {
            key: 'visitElement',
            value: function visitElement(ast) {
                var _this15 = this;

                if (this.attr && getSelectors(this.info) && this.attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
                    // The value is a template expression but the expression AST was not produced when the
                    // TemplateAst was produce so
                    // do that now.
                    var key = this.attr.name.substr(TEMPLATE_ATTR_PREFIX.length);
                    // Find the selector
                    var selectorInfo = getSelectors(this.info);
                    var selectors = selectorInfo.selectors;
                    var selector = selectors.filter(function (s) {
                        return s.attrs.some(function (attr, i) {
                            return i % 2 == 0 && attr == key;
                        });
                    })[0];
                    var templateBindingResult = this.info.expressionParser.parseTemplateBindings(key, this.attr.value, null);
                    // find the template binding that contains the position
                    var valueRelativePosition = this.position - this.attr.valueSpan.start.offset - 1;
                    var bindings = templateBindingResult.templateBindings;
                    var binding = bindings.find(function (binding) {
                        return inSpan(valueRelativePosition, binding.span, /* exclusive */true);
                    }) || bindings.find(function (binding) {
                        return inSpan(valueRelativePosition, binding.span);
                    });
                    var keyCompletions = function keyCompletions() {
                        var keys = [];
                        if (selector) {
                            var attrNames = selector.attrs.filter(function (_, i) {
                                return i % 2 == 0;
                            });
                            keys = attrNames.filter(function (name) {
                                return name.startsWith(key) && name != key;
                            }).map(function (name) {
                                return lowerName(name.substr(key.length));
                            });
                        }
                        keys.push('let');
                        _this15.result = keys.map(function (key) {
                            return { kind: 'key', name: key, sort: key };
                        });
                    };
                    if (!binding || binding.key == key && !binding.expression) {
                        // We are in the root binding. We should return `let` and keys that are left in the
                        // selector.
                        keyCompletions();
                    } else if (binding.keyIsVar) {
                        var equalLocation = this.attr.value.indexOf('=');
                        this.result = [];
                        if (equalLocation >= 0 && valueRelativePosition >= equalLocation) {
                            // We are after the '=' in a let clause. The valid values here are the members of the
                            // template reference's type parameter.
                            var directiveMetadata = selectorInfo.map.get(selector);
                            var contextTable = this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
                            if (contextTable) {
                                this.result = this.symbolsToCompletions(contextTable.values());
                            }
                        } else if (binding.key && valueRelativePosition <= binding.key.length - key.length) {
                            keyCompletions();
                        }
                    } else {
                        // If the position is in the expression or after the key or there is no key, return the
                        // expression completions
                        if (binding.expression && inSpan(valueRelativePosition, binding.expression.ast.span) || binding.key && valueRelativePosition > binding.span.start + (binding.key.length - key.length) || !binding.key) {
                            var span = new _compiler.ParseSpan(0, this.attr.value.length);
                            this.attributeValueCompletions(binding.expression ? binding.expression.ast : new _compiler.PropertyRead(span, new _compiler.ImplicitReceiver(span), ''), valueRelativePosition);
                        } else {
                            keyCompletions();
                        }
                    }
                }
            }
        }, {
            key: 'visitBoundText',
            value: function visitBoundText(ast) {
                var expressionPosition = this.position - ast.sourceSpan.start.offset;
                if (inSpan(expressionPosition, ast.value.span)) {
                    var completions = getExpressionCompletions(this.getExpressionScope(), ast.value, expressionPosition, this.info.template.query);
                    if (completions) {
                        this.result = this.symbolsToCompletions(completions);
                    }
                }
            }
        }, {
            key: 'attributeValueCompletions',
            value: function attributeValueCompletions(value, position) {
                var symbols = getExpressionCompletions(this.getExpressionScope(), value, position == null ? this.attributeValuePosition : position, this.info.template.query);
                if (symbols) {
                    this.result = this.symbolsToCompletions(symbols);
                }
            }
        }, {
            key: 'symbolsToCompletions',
            value: function symbolsToCompletions(symbols) {
                return symbols.filter(function (s) {
                    return !s.name.startsWith('__') && s.public;
                }).map(function (symbol) {
                    return { kind: symbol.kind, name: symbol.name, sort: symbol.name };
                });
            }
        }, {
            key: 'attributeValuePosition',
            get: function get() {
                return this.position - this.attr.valueSpan.start.offset - 1;
            }
        }]);

        return ExpressionVisitor;
    }(NullTemplateVisitor);

    function getSourceText(template, span) {
        return template.source.substring(span.start, span.end);
    }
    function nameOfAttr(attr) {
        var name = attr.name;
        if (attr.output) {
            name = removeSuffix(name, 'Events');
            name = removeSuffix(name, 'Changed');
        }
        var result = [name];
        if (attr.input) {
            result.unshift('[');
            result.push(']');
        }
        if (attr.output) {
            result.unshift('(');
            result.push(')');
        }
        if (attr.template) {
            result.unshift('*');
        }
        return result.join('');
    }
    var templateAttr = /^(\w+:)?(template$|^\*)/;
    function createElementCssSelector(element) {
        var cssSelector = new _compiler.CssSelector();
        var elNameNoNs = (0, _compiler.splitNsName)(element.name)[1];
        cssSelector.setElement(elNameNoNs);
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = element.attrs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var attr = _step6.value;

                if (!attr.name.match(templateAttr)) {
                    var _splitNsName = (0, _compiler.splitNsName)(attr.name),
                        _splitNsName2 = _slicedToArray(_splitNsName, 2),
                        _ = _splitNsName2[0],
                        attrNameNoNs = _splitNsName2[1];

                    cssSelector.addAttribute(attrNameNoNs, attr.value);
                    if (attr.name.toLowerCase() == 'class') {
                        var classes = attr.value.split(/s+/g);
                        classes.forEach(function (className) {
                            return cssSelector.addClassName(className);
                        });
                    }
                }
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }

        return cssSelector;
    }
    function foldAttrs(attrs) {
        var inputOutput = new Map();
        var templates = new Map();
        var result = [];
        attrs.forEach(function (attr) {
            if (attr.fromHtml) {
                return attr;
            }
            if (attr.template) {
                var duplicate = templates.get(attr.name);
                if (!duplicate) {
                    result.push({ name: attr.name, template: true });
                    templates.set(attr.name, attr);
                }
            }
            if (attr.input || attr.output) {
                var _duplicate = inputOutput.get(attr.name);
                if (_duplicate) {
                    _duplicate.input = _duplicate.input || attr.input;
                    _duplicate.output = _duplicate.output || attr.output;
                } else {
                    var cloneAttr = { name: attr.name };
                    if (attr.input) cloneAttr.input = true;
                    if (attr.output) cloneAttr.output = true;
                    result.push(cloneAttr);
                    inputOutput.set(attr.name, cloneAttr);
                }
            }
        });
        return result;
    }
    function expandedAttr(attr) {
        if (attr.input && attr.output) {
            return [attr, { name: attr.name, input: true, output: false }, { name: attr.name, input: false, output: true }];
        }
        return [attr];
    }
    function lowerName(name) {
        return name && name[0].toLowerCase() + name.substr(1);
    }

    function locateSymbol(info) {
        var templatePosition = info.position - info.template.span.start;
        var path = new TemplateAstPath(info.templateAst, templatePosition);
        if (path.tail) {
            var symbol = undefined;
            var span = undefined;
            var attributeValueSymbol = function attributeValueSymbol(ast) {
                var inEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                var attribute = findAttribute(info);
                if (attribute) {
                    if (inSpan(templatePosition, spanOf(attribute.valueSpan))) {
                        var scope = getExpressionScope(info, path, inEvent);
                        var expressionOffset = attribute.valueSpan.start.offset + 1;
                        var result = getExpressionSymbol(scope, ast, templatePosition - expressionOffset, info.template.query);
                        if (result) {
                            symbol = result.symbol;
                            span = offsetSpan(result.span, expressionOffset);
                        }
                        return true;
                    }
                }
                return false;
            };
            path.tail.visit({
                visitNgContent: function visitNgContent(ast) {},
                visitEmbeddedTemplate: function visitEmbeddedTemplate(ast) {},
                visitElement: function visitElement(ast) {
                    var component = ast.directives.find(function (d) {
                        return d.directive.isComponent;
                    });
                    if (component) {
                        symbol = info.template.query.getTypeSymbol(component.directive.type.reference);
                        symbol = symbol && new OverrideKindSymbol(symbol, 'component');
                        span = spanOf(ast);
                    } else {
                        // Find a directive that matches the element name
                        var directive = ast.directives.find(function (d) {
                            return d.directive.selector.indexOf(ast.name) >= 0;
                        });
                        if (directive) {
                            symbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                            symbol = symbol && new OverrideKindSymbol(symbol, 'directive');
                            span = spanOf(ast);
                        }
                    }
                },
                visitReference: function visitReference(ast) {
                    symbol = info.template.query.getTypeSymbol((0, _compiler.tokenReference)(ast.value));
                    span = spanOf(ast);
                },
                visitVariable: function visitVariable(ast) {},
                visitEvent: function visitEvent(ast) {
                    if (!attributeValueSymbol(ast.handler, /* inEvent */true)) {
                        symbol = findOutputBinding(info, path, ast);
                        symbol = symbol && new OverrideKindSymbol(symbol, 'event');
                        span = spanOf(ast);
                    }
                },
                visitElementProperty: function visitElementProperty(ast) {
                    attributeValueSymbol(ast.value);
                },
                visitAttr: function visitAttr(ast) {},
                visitBoundText: function visitBoundText(ast) {
                    var expressionPosition = templatePosition - ast.sourceSpan.start.offset;
                    if (inSpan(expressionPosition, ast.value.span)) {
                        var scope = getExpressionScope(info, path, /* includeEvent */false);
                        var result = getExpressionSymbol(scope, ast.value, expressionPosition, info.template.query);
                        if (result) {
                            symbol = result.symbol;
                            span = offsetSpan(result.span, ast.sourceSpan.start.offset);
                        }
                    }
                },
                visitText: function visitText(ast) {},
                visitDirective: function visitDirective(ast) {
                    symbol = info.template.query.getTypeSymbol(ast.directive.type.reference);
                    span = spanOf(ast);
                },
                visitDirectiveProperty: function visitDirectiveProperty(ast) {
                    if (!attributeValueSymbol(ast.value)) {
                        symbol = findInputBinding(info, path, ast);
                        span = spanOf(ast);
                    }
                }
            }, null);
            if (symbol && span) {
                return { symbol: symbol, span: offsetSpan(span, info.template.span.start) };
            }
        }
    }
    function findAttribute(info) {
        var templatePosition = info.position - info.template.span.start;
        var path = new HtmlAstPath(info.htmlAst, templatePosition);
        return path.first(_compiler.Attribute);
    }
    function findInputBinding(info, path, binding) {
        var element = path.first(_compiler.ElementAst);
        if (element) {
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = element.directives[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var directive = _step7.value;

                    var invertedInput = invertMap(directive.directive.inputs);
                    var fieldName = invertedInput[binding.templateName];
                    if (fieldName) {
                        var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        if (classSymbol) {
                            return classSymbol.members().get(fieldName);
                        }
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }
    function findOutputBinding(info, path, binding) {
        var element = path.first(_compiler.ElementAst);
        if (element) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = element.directives[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var directive = _step8.value;

                    var invertedOutputs = invertMap(directive.directive.outputs);
                    var fieldName = invertedOutputs[binding.name];
                    if (fieldName) {
                        var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        if (classSymbol) {
                            return classSymbol.members().get(fieldName);
                        }
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }
    function invertMap(obj) {
        var result = {};
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = Object.keys(obj)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var name = _step9.value;

                var v = obj[name];
                result[v] = name;
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
                }
            }
        }

        return result;
    }
    /**
     * Wrap a symbol and change its kind to component.
     */

    var OverrideKindSymbol = function () {
        function OverrideKindSymbol(sym, kindOverride) {
            _classCallCheck(this, OverrideKindSymbol);

            this.sym = sym;
            this.kindOverride = kindOverride;
        }

        _createClass(OverrideKindSymbol, [{
            key: 'members',
            value: function members() {
                return this.sym.members();
            }
        }, {
            key: 'signatures',
            value: function signatures() {
                return this.sym.signatures();
            }
        }, {
            key: 'selectSignature',
            value: function selectSignature(types) {
                return this.sym.selectSignature(types);
            }
        }, {
            key: 'indexed',
            value: function indexed(argument) {
                return this.sym.indexed(argument);
            }
        }, {
            key: 'name',
            get: function get() {
                return this.sym.name;
            }
        }, {
            key: 'kind',
            get: function get() {
                return this.kindOverride;
            }
        }, {
            key: 'language',
            get: function get() {
                return this.sym.language;
            }
        }, {
            key: 'type',
            get: function get() {
                return this.sym.type;
            }
        }, {
            key: 'container',
            get: function get() {
                return this.sym.container;
            }
        }, {
            key: 'public',
            get: function get() {
                return this.sym.public;
            }
        }, {
            key: 'callable',
            get: function get() {
                return this.sym.callable;
            }
        }, {
            key: 'definition',
            get: function get() {
                return this.sym.definition;
            }
        }]);

        return OverrideKindSymbol;
    }();

    function getDefinition(info) {
        var result = locateSymbol(info);
        return result && result.symbol.definition;
    }

    function getTemplateDiagnostics(fileName, astProvider, templates) {
        var results = [];
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
            var _loop3 = function _loop3() {
                var template = _step10.value;

                var ast = astProvider.getTemplateAst(template, fileName);
                if (ast) {
                    if (ast.parseErrors && ast.parseErrors.length) {
                        results.push.apply(results, _toConsumableArray(ast.parseErrors.map(function (e) {
                            return {
                                kind: DiagnosticKind.Error,
                                span: offsetSpan(spanOf(e.span), template.span.start),
                                message: e.msg
                            };
                        })));
                    } else if (ast.templateAst) {
                        var expressionDiagnostics = getTemplateExpressionDiagnostics(template, ast);
                        results.push.apply(results, _toConsumableArray(expressionDiagnostics));
                    }
                    if (ast.errors) {
                        results.push.apply(results, _toConsumableArray(ast.errors.map(function (e) {
                            return { kind: e.kind, span: e.span || template.span, message: e.message };
                        })));
                    }
                }
            };

            for (var _iterator10 = templates[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                _loop3();
            }
        } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                    _iterator10.return();
                }
            } finally {
                if (_didIteratorError10) {
                    throw _iteratorError10;
                }
            }
        }

        return results;
    }
    function getDeclarationDiagnostics(declarations, modules) {
        var results = [];
        var directives = undefined;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
            var _loop4 = function _loop4() {
                var declaration = _step11.value;

                var report = function report(message, span) {
                    results.push({
                        kind: DiagnosticKind.Error,
                        span: span || declaration.declarationSpan, message: message
                    });
                };
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = declaration.errors[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var error = _step12.value;

                        report(error.message, error.span);
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }

                if (declaration.metadata) {
                    if (declaration.metadata.isComponent) {
                        if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
                            report('Component \'' + declaration.type.name + '\' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration');
                        }
                        if (declaration.metadata.template.template == null && !declaration.metadata.template.templateUrl) {
                            report('Component ' + declaration.type.name + ' must have a template or templateUrl');
                        }
                    } else {
                        if (!directives) {
                            directives = new Set();
                            modules.ngModules.forEach(function (module) {
                                module.declaredDirectives.forEach(function (directive) {
                                    directives.add(directive.reference);
                                });
                            });
                        }
                        if (!directives.has(declaration.type)) {
                            report('Directive \'' + declaration.type.name + '\' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration');
                        }
                    }
                }
            };

            for (var _iterator11 = declarations[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                _loop4();
            }
        } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                }
            } finally {
                if (_didIteratorError11) {
                    throw _iteratorError11;
                }
            }
        }

        return results;
    }
    function getTemplateExpressionDiagnostics(template, astResult) {
        var info = {
            template: template,
            htmlAst: astResult.htmlAst,
            directive: astResult.directive,
            directives: astResult.directives,
            pipes: astResult.pipes,
            templateAst: astResult.templateAst,
            expressionParser: astResult.expressionParser
        };
        var visitor = new ExpressionDiagnosticsVisitor(info, function (path, includeEvent) {
            return getExpressionScope(info, path, includeEvent);
        });
        (0, _compiler.templateVisitAll)(visitor, astResult.templateAst);
        return visitor.diagnostics;
    }

    var ExpressionDiagnosticsVisitor = function (_TemplateAstChildVisi3) {
        _inherits(ExpressionDiagnosticsVisitor, _TemplateAstChildVisi3);

        function ExpressionDiagnosticsVisitor(info, getExpressionScope) {
            _classCallCheck(this, ExpressionDiagnosticsVisitor);

            var _this16 = _possibleConstructorReturn(this, (ExpressionDiagnosticsVisitor.__proto__ || Object.getPrototypeOf(ExpressionDiagnosticsVisitor)).call(this));

            _this16.info = info;
            _this16.getExpressionScope = getExpressionScope;
            _this16.diagnostics = [];
            _this16.path = new TemplateAstPath([], 0);
            return _this16;
        }

        _createClass(ExpressionDiagnosticsVisitor, [{
            key: 'visitDirective',
            value: function visitDirective(ast, context) {
                // Override the default child visitor to ignore the host properties of a directive.
                if (ast.inputs && ast.inputs.length) {
                    (0, _compiler.templateVisitAll)(this, ast.inputs, context);
                }
            }
        }, {
            key: 'visitBoundText',
            value: function visitBoundText(ast) {
                this.push(ast);
                this.diagnoseExpression(ast.value, ast.sourceSpan.start.offset, false);
                this.pop();
            }
        }, {
            key: 'visitDirectiveProperty',
            value: function visitDirectiveProperty(ast) {
                this.push(ast);
                this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
                this.pop();
            }
        }, {
            key: 'visitElementProperty',
            value: function visitElementProperty(ast) {
                this.push(ast);
                this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
                this.pop();
            }
        }, {
            key: 'visitEvent',
            value: function visitEvent(ast) {
                this.push(ast);
                this.diagnoseExpression(ast.handler, this.attributeValueLocation(ast), true);
                this.pop();
            }
        }, {
            key: 'visitVariable',
            value: function visitVariable(ast) {
                var directive = this.directiveSummary;
                if (directive && ast.value) {
                    var _context = this.info.template.query.getTemplateContext(directive.type.reference);
                    if (!_context.has(ast.value)) {
                        if (ast.value === '$implicit') {
                            this.reportError('The template context does not have an implicit value', spanOf(ast.sourceSpan));
                        } else {
                            this.reportError('The template context does not defined a member called \'' + ast.value + '\'', spanOf(ast.sourceSpan));
                        }
                    }
                }
            }
        }, {
            key: 'visitElement',
            value: function visitElement(ast, context) {
                this.push(ast);
                _get(ExpressionDiagnosticsVisitor.prototype.__proto__ || Object.getPrototypeOf(ExpressionDiagnosticsVisitor.prototype), 'visitElement', this).call(this, ast, context);
                this.pop();
            }
        }, {
            key: 'visitEmbeddedTemplate',
            value: function visitEmbeddedTemplate(ast, context) {
                var previousDirectiveSummary = this.directiveSummary;
                this.push(ast);
                // Find directive that refernces this template
                this.directiveSummary = ast.directives.map(function (d) {
                    return d.directive;
                }).find(function (d) {
                    return hasTemplateReference(d.type);
                });
                // Process children
                _get(ExpressionDiagnosticsVisitor.prototype.__proto__ || Object.getPrototypeOf(ExpressionDiagnosticsVisitor.prototype), 'visitEmbeddedTemplate', this).call(this, ast, context);
                this.pop();
                this.directiveSummary = previousDirectiveSummary;
            }
        }, {
            key: 'attributeValueLocation',
            value: function attributeValueLocation(ast) {
                var path = new HtmlAstPath(this.info.htmlAst, ast.sourceSpan.start.offset);
                var last = path.tail;
                if (last instanceof _compiler.Attribute && last.valueSpan) {
                    // Add 1 for the quote.
                    return last.valueSpan.start.offset + 1;
                }
                return ast.sourceSpan.start.offset;
            }
        }, {
            key: 'diagnoseExpression',
            value: function diagnoseExpression(ast, offset, includeEvent) {
                var _diagnostics,
                    _this17 = this;

                var scope = this.getExpressionScope(this.path, includeEvent);
                (_diagnostics = this.diagnostics).push.apply(_diagnostics, _toConsumableArray(getExpressionDiagnostics(scope, ast, this.info.template.query, {
                    event: includeEvent
                }).map(function (d) {
                    return {
                        span: offsetSpan(d.ast.span, offset + _this17.info.template.span.start),
                        kind: d.kind,
                        message: d.message
                    };
                })));
            }
        }, {
            key: 'push',
            value: function push(ast) {
                this.path.push(ast);
            }
        }, {
            key: 'pop',
            value: function pop() {
                this.path.pop();
            }
        }, {
            key: 'selectors',
            value: function selectors() {
                var result = this._selectors;
                if (!result) {
                    this._selectors = result = getSelectors(this.info);
                }
                return result;
            }
        }, {
            key: 'findElement',
            value: function findElement(position) {
                var htmlPath = new HtmlAstPath(this.info.htmlAst, position);
                if (htmlPath.tail instanceof _compiler.Element) {
                    return htmlPath.tail;
                }
            }
        }, {
            key: 'reportError',
            value: function reportError(message, span) {
                this.diagnostics.push({
                    span: offsetSpan(span, this.info.template.span.start),
                    kind: DiagnosticKind.Error, message: message
                });
            }
        }, {
            key: 'reportWarning',
            value: function reportWarning(message, span) {
                this.diagnostics.push({
                    span: offsetSpan(span, this.info.template.span.start),
                    kind: DiagnosticKind.Warning, message: message
                });
            }
        }]);

        return ExpressionDiagnosticsVisitor;
    }(TemplateAstChildVisitor);

    function getHover(info) {
        var result = locateSymbol(info);
        if (result) {
            return { text: hoverTextOf(result.symbol), span: result.span };
        }
    }
    function hoverTextOf(symbol) {
        var result = [{ text: symbol.kind }, { text: ' ' }, { text: symbol.name, language: symbol.language }];
        var container = symbol.container;
        if (container) {
            result.push({ text: ' of ' }, { text: container.name, language: container.language });
        }
        return result;
    }

    /**
     * Create an instance of an Angular `LanguageService`.
     *
     * @experimental
     */
    function createLanguageService(host) {
        return new LanguageServiceImpl(host);
    }

    var LanguageServiceImpl = function () {
        function LanguageServiceImpl(host) {
            _classCallCheck(this, LanguageServiceImpl);

            this.host = host;
        }

        _createClass(LanguageServiceImpl, [{
            key: 'getTemplateReferences',
            value: function getTemplateReferences() {
                return this.host.getTemplateReferences();
            }
        }, {
            key: 'getDiagnostics',
            value: function getDiagnostics(fileName) {
                var results = [];
                var templates = this.host.getTemplates(fileName);
                if (templates && templates.length) {
                    results.push.apply(results, _toConsumableArray(getTemplateDiagnostics(fileName, this, templates)));
                }
                var declarations = this.host.getDeclarations(fileName);
                if (declarations && declarations.length) {
                    var summary = this.host.getAnalyzedModules();
                    results.push.apply(results, _toConsumableArray(getDeclarationDiagnostics(declarations, summary)));
                }
                return uniqueBySpan(results);
            }
        }, {
            key: 'getPipesAt',
            value: function getPipesAt(fileName, position) {
                var templateInfo = this.getTemplateAstAtPosition(fileName, position);
                if (templateInfo) {
                    return templateInfo.pipes.map(function (pipeInfo) {
                        return { name: pipeInfo.name, symbol: pipeInfo.type.reference };
                    });
                }
            }
        }, {
            key: 'getCompletionsAt',
            value: function getCompletionsAt(fileName, position) {
                var templateInfo = this.getTemplateAstAtPosition(fileName, position);
                if (templateInfo) {
                    return getTemplateCompletions(templateInfo);
                }
            }
        }, {
            key: 'getDefinitionAt',
            value: function getDefinitionAt(fileName, position) {
                var templateInfo = this.getTemplateAstAtPosition(fileName, position);
                if (templateInfo) {
                    return getDefinition(templateInfo);
                }
            }
        }, {
            key: 'getHoverAt',
            value: function getHoverAt(fileName, position) {
                var templateInfo = this.getTemplateAstAtPosition(fileName, position);
                if (templateInfo) {
                    return getHover(templateInfo);
                }
            }
        }, {
            key: 'getTemplateAstAtPosition',
            value: function getTemplateAstAtPosition(fileName, position) {
                var template = this.host.getTemplateAt(fileName, position);
                if (template) {
                    var astResult = this.getTemplateAst(template, fileName);
                    if (astResult && astResult.htmlAst && astResult.templateAst) return {
                        position: position,
                        fileName: fileName,
                        template: template,
                        htmlAst: astResult.htmlAst,
                        directive: astResult.directive,
                        directives: astResult.directives,
                        pipes: astResult.pipes,
                        templateAst: astResult.templateAst,
                        expressionParser: astResult.expressionParser
                    };
                }
                return undefined;
            }
        }, {
            key: 'getTemplateAst',
            value: function getTemplateAst(template, contextFile) {
                var _this18 = this;

                var result = void 0;
                try {
                    var resolvedMetadata = this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type);
                    var metadata = resolvedMetadata && resolvedMetadata.metadata;
                    if (metadata) {
                        var rawHtmlParser = new _compiler.HtmlParser();
                        var htmlParser = new _compiler.I18NHtmlParser(rawHtmlParser);
                        var expressionParser = new _compiler.Parser(new _compiler.Lexer());
                        var config = new _compiler.CompilerConfig();
                        var parser = new _compiler.TemplateParser(config, expressionParser, new _compiler.DomElementSchemaRegistry(), htmlParser, null, []);
                        var htmlResult = htmlParser.parse(template.source, '');
                        var analyzedModules = this.host.getAnalyzedModules();
                        var errors = undefined;
                        var ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
                        if (!ngModule) {
                            // Reported by the the declaration diagnostics.
                            ngModule = findSuitableDefaultModule(analyzedModules);
                        }
                        if (ngModule) {
                            var resolvedDirectives = ngModule.transitiveModule.directives.map(function (d) {
                                return _this18.host.resolver.getNonNormalizedDirectiveMetadata(d.reference);
                            });
                            var directives = resolvedDirectives.filter(function (d) {
                                return d !== null;
                            }).map(function (d) {
                                return d.metadata.toSummary();
                            });
                            var pipes = ngModule.transitiveModule.pipes.map(function (p) {
                                return _this18.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary();
                            });
                            var schemas = ngModule.schemas;
                            var parseResult = parser.tryParseHtml(htmlResult, metadata, template.source, directives, pipes, schemas, '');
                            result = {
                                htmlAst: htmlResult.rootNodes,
                                templateAst: parseResult.templateAst,
                                directive: metadata, directives: directives, pipes: pipes,
                                parseErrors: parseResult.errors, expressionParser: expressionParser, errors: errors
                            };
                        }
                    }
                } catch (e) {
                    var span = template.span;
                    if (e.fileName == contextFile) {
                        span = template.query.getSpanAt(e.line, e.column) || span;
                    }
                    result = { errors: [{ kind: DiagnosticKind.Error, message: e.message, span: span }] };
                }
                return result;
            }
        }, {
            key: 'metadataResolver',
            get: function get() {
                return this.host.resolver;
            }
        }]);

        return LanguageServiceImpl;
    }();

    function uniqueBySpan(elements) {
        if (elements) {
            var result = [];
            var map = new Map();
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = elements[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var element = _step13.value;

                    var span = element.span;
                    var set = map.get(span.start);
                    if (!set) {
                        set = new Set();
                        map.set(span.start, set);
                    }
                    if (!set.has(span.end)) {
                        set.add(span.end);
                        result.push(element);
                    }
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return result;
        }
    }
    function findSuitableDefaultModule(modules) {
        var result = void 0;
        var resultSize = 0;
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
            for (var _iterator14 = modules.ngModules[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                var module = _step14.value;

                var moduleSize = module.transitiveModule.directives.length;
                if (moduleSize > resultSize) {
                    result = module;
                    resultSize = moduleSize;
                }
            }
        } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                    _iterator14.return();
                }
            } finally {
                if (_didIteratorError14) {
                    throw _iteratorError14;
                }
            }
        }

        return result;
    }

    var ReflectorModuleModuleResolutionHost = function () {
        function ReflectorModuleModuleResolutionHost(host) {
            var _this19 = this;

            _classCallCheck(this, ReflectorModuleModuleResolutionHost);

            this.host = host;
            if (host.directoryExists) this.directoryExists = function (directoryName) {
                return _this19.host.directoryExists(directoryName);
            };
        }

        _createClass(ReflectorModuleModuleResolutionHost, [{
            key: 'fileExists',
            value: function fileExists(fileName) {
                return !!this.host.getScriptSnapshot(fileName);
            }
        }, {
            key: 'readFile',
            value: function readFile(fileName) {
                var snapshot = this.host.getScriptSnapshot(fileName);
                if (snapshot) {
                    return snapshot.getText(0, snapshot.getLength());
                }
            }
        }]);

        return ReflectorModuleModuleResolutionHost;
    }();

    var ReflectorHost = function (_CompilerHost) {
        _inherits(ReflectorHost, _CompilerHost);

        function ReflectorHost(getProgram, serviceHost, options) {
            _classCallCheck(this, ReflectorHost);

            var _this20 = _possibleConstructorReturn(this, (ReflectorHost.__proto__ || Object.getPrototypeOf(ReflectorHost)).call(this, null, options, new _compilerCli.ModuleResolutionHostAdapter(new ReflectorModuleModuleResolutionHost(serviceHost))));

            _this20.getProgram = getProgram;
            return _this20;
        }

        _createClass(ReflectorHost, [{
            key: 'program',
            get: function get() {
                return this.getProgram();
            },
            set: function set(value) {
                // Discard the result set by ancestor constructor
            }
        }]);

        return ReflectorHost;
    }(_compilerCli.CompilerHost);

    // In TypeScript 2.1 these flags moved
    // These helpers work for both 2.0 and 2.1.
    var isPrivate = ts.ModifierFlags ? function (node) {
        return !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Private);
    } : function (node) {
        return !!(node.flags & ts.NodeFlags.Private);
    };
    var isReferenceType = ts.ObjectFlags ? function (type) {
        return !!(type.flags & ts.TypeFlags.Object && type.objectFlags & ts.ObjectFlags.Reference);
    } : function (type) {
        return !!(type.flags & ts.TypeFlags.Reference);
    };
    /**
     * Create a `LanguageServiceHost`
     */
    function createLanguageServiceFromTypescript(host, service) {
        var ngHost = new TypeScriptServiceHost(host, service);
        var ngServer = createLanguageService(ngHost);
        ngHost.setSite(ngServer);
        return ngServer;
    }
    /**
     * The language service never needs the normalized versions of the metadata. To avoid parsing
     * the content and resolving references, return an empty file. This also allows normalizing
     * template that are syntatically incorrect which is required to provide completions in
     * syntatically incorrect templates.
     */

    var DummyHtmlParser = function (_HtmlParser) {
        _inherits(DummyHtmlParser, _HtmlParser);

        function DummyHtmlParser() {
            _classCallCheck(this, DummyHtmlParser);

            return _possibleConstructorReturn(this, (DummyHtmlParser.__proto__ || Object.getPrototypeOf(DummyHtmlParser)).call(this));
        }

        _createClass(DummyHtmlParser, [{
            key: 'parse',
            value: function parse(source, url) {
                var parseExpansionForms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var interpolationConfig = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _compiler.DEFAULT_INTERPOLATION_CONFIG;

                return new _compiler.ParseTreeResult([], []);
            }
        }]);

        return DummyHtmlParser;
    }(_compiler.HtmlParser);

    var DummyResourceLoader = function (_ResourceLoader) {
        _inherits(DummyResourceLoader, _ResourceLoader);

        function DummyResourceLoader() {
            _classCallCheck(this, DummyResourceLoader);

            return _possibleConstructorReturn(this, (DummyResourceLoader.__proto__ || Object.getPrototypeOf(DummyResourceLoader)).apply(this, arguments));
        }

        _createClass(DummyResourceLoader, [{
            key: 'get',
            value: function get(url) {
                return Promise.resolve('');
            }
        }]);

        return DummyResourceLoader;
    }(_compiler.ResourceLoader);

    var TypeScriptServiceHost = function () {
        function TypeScriptServiceHost(host, tsService) {
            _classCallCheck(this, TypeScriptServiceHost);

            this.host = host;
            this.tsService = tsService;
            this._staticSymbolCache = new _compiler.StaticSymbolCache();
            this._typeCache = [];
            this.modulesOutOfDate = true;
        }

        _createClass(TypeScriptServiceHost, [{
            key: 'setSite',
            value: function setSite(service) {
                this.service = service;
            }
        }, {
            key: 'getTemplateReferences',
            value: function getTemplateReferences() {
                this.ensureTemplateMap();
                return this.templateReferences;
            }
        }, {
            key: 'getTemplateAt',
            value: function getTemplateAt(fileName, position) {
                var sourceFile = this.getSourceFile(fileName);
                if (sourceFile) {
                    this.context = sourceFile.fileName;
                    var node = this.findNode(sourceFile, position);
                    if (node) {
                        return this.getSourceFromNode(fileName, this.host.getScriptVersion(sourceFile.fileName), node);
                    }
                } else {
                    this.ensureTemplateMap();
                    // TODO: Cannocalize the file?
                    var componentType = this.fileToComponent.get(fileName);
                    if (componentType) {
                        return this.getSourceFromType(fileName, this.host.getScriptVersion(fileName), componentType);
                    }
                }
            }
        }, {
            key: 'getAnalyzedModules',
            value: function getAnalyzedModules() {
                this.validate();
                return this.ensureAnalyzedModules();
            }
        }, {
            key: 'ensureAnalyzedModules',
            value: function ensureAnalyzedModules() {
                var analyzedModules = this.analyzedModules;
                if (!analyzedModules) {
                    var analyzeHost = {
                        isSourceFile: function isSourceFile(filePath) {
                            return true;
                        }
                    };
                    var programSymbols = (0, _compiler.extractProgramSymbols)(this.staticSymbolResolver, this.program.getSourceFiles().map(function (sf) {
                        return sf.fileName;
                    }), analyzeHost);
                    analyzedModules = this.analyzedModules = (0, _compiler.analyzeNgModules)(programSymbols, analyzeHost, this.resolver);
                }
                return analyzedModules;
            }
        }, {
            key: 'getTemplates',
            value: function getTemplates(fileName) {
                var _this23 = this;

                this.ensureTemplateMap();
                var componentType = this.fileToComponent.get(fileName);
                if (componentType) {
                    var templateSource = this.getTemplateAt(fileName, 0);
                    if (templateSource) {
                        return [templateSource];
                    }
                } else {
                    var version = this.host.getScriptVersion(fileName);
                    var result = [];
                    // Find each template string in the file
                    var visit = function visit(child) {
                        var templateSource = _this23.getSourceFromNode(fileName, version, child);
                        if (templateSource) {
                            result.push(templateSource);
                        } else {
                            ts.forEachChild(child, visit);
                        }
                    };
                    var sourceFile = this.getSourceFile(fileName);
                    if (sourceFile) {
                        this.context = sourceFile.path;
                        ts.forEachChild(sourceFile, visit);
                    }
                    return result.length ? result : undefined;
                }
            }
        }, {
            key: 'getDeclarations',
            value: function getDeclarations(fileName) {
                var _this24 = this;

                var result = [];
                var sourceFile = this.getSourceFile(fileName);
                if (sourceFile) {
                    var visit = function visit(child) {
                        var declaration = _this24.getDeclarationFromNode(sourceFile, child);
                        if (declaration) {
                            result.push(declaration);
                        } else {
                            ts.forEachChild(child, visit);
                        }
                    };
                    ts.forEachChild(sourceFile, visit);
                }
                return result;
            }
        }, {
            key: 'getSourceFile',
            value: function getSourceFile(fileName) {
                return this.tsService.getProgram().getSourceFile(fileName);
            }
        }, {
            key: 'updateAnalyzedModules',
            value: function updateAnalyzedModules() {
                this.validate();
                if (this.modulesOutOfDate) {
                    this.analyzedModules = null;
                    this._reflector = null;
                    this._staticSymbolResolver = null;
                    this.templateReferences = null;
                    this.fileToComponent = null;
                    this.ensureAnalyzedModules();
                    this.modulesOutOfDate = false;
                }
            }
        }, {
            key: 'validate',
            value: function validate() {
                var program = this.program;
                if (this.lastProgram != program) {
                    this.clearCaches();
                    this.lastProgram = program;
                }
            }
        }, {
            key: 'clearCaches',
            value: function clearCaches() {
                this._checker = null;
                this._typeCache = [];
                this._resolver = null;
                this.collectedErrors = null;
                this.modulesOutOfDate = true;
            }
        }, {
            key: 'ensureTemplateMap',
            value: function ensureTemplateMap() {
                if (!this.fileToComponent || !this.templateReferences) {
                    var fileToComponent = new Map();
                    var templateReference = [];
                    var ngModuleSummary = this.getAnalyzedModules();
                    var urlResolver = (0, _compiler.createOfflineCompileUrlResolver)();
                    var _iteratorNormalCompletion15 = true;
                    var _didIteratorError15 = false;
                    var _iteratorError15 = undefined;

                    try {
                        for (var _iterator15 = ngModuleSummary.ngModules[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                            var module = _step15.value;
                            var _iteratorNormalCompletion16 = true;
                            var _didIteratorError16 = false;
                            var _iteratorError16 = undefined;

                            try {
                                for (var _iterator16 = module.declaredDirectives[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                    var directive = _step16.value;

                                    var _resolver$getNonNorma = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference),
                                        metadata = _resolver$getNonNorma.metadata,
                                        annotation = _resolver$getNonNorma.annotation;

                                    if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                                        var templateName = urlResolver.resolve((0, _compiler.componentModuleUrl)(this.reflector, directive.reference, annotation), metadata.template.templateUrl);
                                        fileToComponent.set(templateName, directive.reference);
                                        templateReference.push(templateName);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError16 = true;
                                _iteratorError16 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                        _iterator16.return();
                                    }
                                } finally {
                                    if (_didIteratorError16) {
                                        throw _iteratorError16;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError15 = true;
                        _iteratorError15 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                _iterator15.return();
                            }
                        } finally {
                            if (_didIteratorError15) {
                                throw _iteratorError15;
                            }
                        }
                    }

                    this.fileToComponent = fileToComponent;
                    this.templateReferences = templateReference;
                }
            }
        }, {
            key: 'getSourceFromDeclaration',
            value: function getSourceFromDeclaration(fileName, version, source, span, type, declaration, node, sourceFile) {
                var queryCache = undefined;
                var t = this;
                if (declaration) {
                    return {
                        version: version,
                        source: source,
                        span: span,
                        type: type,
                        get members() {
                            var checker = t.checker;
                            var program = t.program;
                            var type = checker.getTypeAtLocation(declaration);
                            return new TypeWrapper(type, { node: node, program: program, checker: checker }).members();
                        },
                        get query() {
                            if (!queryCache) {
                                queryCache = new TypeScriptSymbolQuery(t.program, t.checker, sourceFile, function () {
                                    var pipes = t.service.getPipesAt(fileName, node.getStart());
                                    var checker = t.checker;
                                    var program = t.program;
                                    return new PipesTable(pipes, { node: node, program: program, checker: checker });
                                });
                            }
                            return queryCache;
                        }
                    };
                }
            }
        }, {
            key: 'getSourceFromNode',
            value: function getSourceFromNode(fileName, version, node) {
                var result = undefined;
                var t = this;
                switch (node.kind) {
                    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                    case ts.SyntaxKind.StringLiteral:
                        var _getTemplateClassDecl = this.getTemplateClassDeclFromNode(node),
                            _getTemplateClassDecl2 = _slicedToArray(_getTemplateClassDecl, 2),
                            _declaration = _getTemplateClassDecl2[0],
                            decorator = _getTemplateClassDecl2[1];

                        var queryCache = undefined;
                        if (_declaration && _declaration.name) {
                            var sourceFile = this.getSourceFile(fileName);
                            return this.getSourceFromDeclaration(fileName, version, this.stringOf(node), shrink(spanOf$1(node)), this.reflector.getStaticSymbol(sourceFile.fileName, _declaration.name.text), _declaration, node, sourceFile);
                        }
                        break;
                }
                return result;
            }
        }, {
            key: 'getSourceFromType',
            value: function getSourceFromType(fileName, version, type) {
                var result = undefined;
                var declaration = this.getTemplateClassFromStaticSymbol(type);
                if (declaration) {
                    var snapshot = this.host.getScriptSnapshot(fileName);
                    var source = snapshot.getText(0, snapshot.getLength());
                    result = this.getSourceFromDeclaration(fileName, version, source, { start: 0, end: source.length }, type, declaration, declaration, declaration.getSourceFile());
                }
                return result;
            }
        }, {
            key: 'collectError',
            value: function collectError(error, filePath) {
                var errorMap = this.collectedErrors;
                if (!errorMap) {
                    errorMap = this.collectedErrors = new Map();
                }
                var errors = errorMap.get(filePath);
                if (!errors) {
                    errors = [];
                    this.collectedErrors.set(filePath, errors);
                }
                errors.push(error);
            }
        }, {
            key: 'getTemplateClassFromStaticSymbol',
            value: function getTemplateClassFromStaticSymbol(type) {
                var source = this.getSourceFile(type.filePath);
                if (source) {
                    var declarationNode = ts.forEachChild(source, function (child) {
                        if (child.kind === ts.SyntaxKind.ClassDeclaration) {
                            var classDeclaration = child;
                            if (classDeclaration.name.text === type.name) {
                                return classDeclaration;
                            }
                        }
                    });
                    return declarationNode;
                }
                return undefined;
            }
        }, {
            key: 'getTemplateClassDeclFromNode',
            value: function getTemplateClassDeclFromNode(currentToken) {
                // Verify we are in a 'template' property assignment, in an object literal, which is an call
                // arg, in a decorator
                var parentNode = currentToken.parent; // PropertyAssignment
                if (!parentNode) {
                    return TypeScriptServiceHost.missingTemplate;
                }
                if (parentNode.kind !== ts.SyntaxKind.PropertyAssignment) {
                    return TypeScriptServiceHost.missingTemplate;
                } else {
                    // TODO: Is this different for a literal, i.e. a quoted property name like "template"?
                    if (parentNode.name.text !== 'template') {
                        return TypeScriptServiceHost.missingTemplate;
                    }
                }
                parentNode = parentNode.parent; // ObjectLiteralExpression
                if (!parentNode || parentNode.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                    return TypeScriptServiceHost.missingTemplate;
                }
                parentNode = parentNode.parent; // CallExpression
                if (!parentNode || parentNode.kind !== ts.SyntaxKind.CallExpression) {
                    return TypeScriptServiceHost.missingTemplate;
                }
                var callTarget = parentNode.expression;
                var decorator = parentNode.parent; // Decorator
                if (!decorator || decorator.kind !== ts.SyntaxKind.Decorator) {
                    return TypeScriptServiceHost.missingTemplate;
                }
                var declaration = decorator.parent; // ClassDeclaration
                if (!declaration || declaration.kind !== ts.SyntaxKind.ClassDeclaration) {
                    return TypeScriptServiceHost.missingTemplate;
                }
                return [declaration, callTarget];
            }
        }, {
            key: 'getCollectedErrors',
            value: function getCollectedErrors(defaultSpan, sourceFile) {
                var errors = this.collectedErrors && this.collectedErrors.get(sourceFile.fileName);
                return errors && errors.map(function (e) {
                    return { message: e.message, span: spanAt(sourceFile, e.line, e.column) || defaultSpan };
                }) || [];
            }
        }, {
            key: 'getDeclarationFromNode',
            value: function getDeclarationFromNode(sourceFile, node) {
                if (node.kind == ts.SyntaxKind.ClassDeclaration && node.decorators && node.name) {
                    var _iteratorNormalCompletion17 = true;
                    var _didIteratorError17 = false;
                    var _iteratorError17 = undefined;

                    try {
                        for (var _iterator17 = node.decorators[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                            var decorator = _step17.value;

                            if (decorator.expression && decorator.expression.kind == ts.SyntaxKind.CallExpression) {
                                var classDeclaration = node;
                                if (classDeclaration.name) {
                                    var call = decorator.expression;
                                    var target = call.expression;
                                    var _type = this.checker.getTypeAtLocation(target);
                                    if (_type) {
                                        var staticSymbol = this._reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
                                        try {
                                            if (this.resolver.isDirective(staticSymbol)) {
                                                var _resolver$getNonNorma2 = this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol),
                                                    metadata = _resolver$getNonNorma2.metadata;

                                                var declarationSpan = spanOf$1(target);
                                                return {
                                                    type: staticSymbol,
                                                    declarationSpan: declarationSpan,
                                                    metadata: metadata,
                                                    errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                                };
                                            }
                                        } catch (e) {
                                            if (e.message) {
                                                this.collectError(e, sourceFile.fileName);
                                                var _declarationSpan = spanOf$1(target);
                                                return {
                                                    type: staticSymbol,
                                                    declarationSpan: _declarationSpan,
                                                    errors: this.getCollectedErrors(_declarationSpan, sourceFile)
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError17 = true;
                        _iteratorError17 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                _iterator17.return();
                            }
                        } finally {
                            if (_didIteratorError17) {
                                throw _iteratorError17;
                            }
                        }
                    }
                }
            }
        }, {
            key: 'stringOf',
            value: function stringOf(node) {
                switch (node.kind) {
                    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                        return node.text;
                    case ts.SyntaxKind.StringLiteral:
                        return node.text;
                }
            }
        }, {
            key: 'findNode',
            value: function findNode(sourceFile, position) {
                var _this = this;
                function find(node) {
                    if (position >= node.getStart() && position < node.getEnd()) {
                        return ts.forEachChild(node, find) || node;
                    }
                }
                return find(sourceFile);
            }
        }, {
            key: 'findLiteralType',
            value: function findLiteralType(kind, context) {
                var checker = this.checker;
                var type = void 0;
                switch (kind) {
                    case BuiltinType.Any:
                        type = checker.getTypeAtLocation({
                            kind: ts.SyntaxKind.AsExpression,
                            expression: { kind: ts.SyntaxKind.TrueKeyword },
                            type: { kind: ts.SyntaxKind.AnyKeyword }
                        });
                        break;
                    case BuiltinType.Boolean:
                        type = checker.getTypeAtLocation({ kind: ts.SyntaxKind.TrueKeyword });
                        break;
                    case BuiltinType.Null:
                        type = checker.getTypeAtLocation({ kind: ts.SyntaxKind.NullKeyword });
                        break;
                    case BuiltinType.Number:
                        type = checker.getTypeAtLocation({ kind: ts.SyntaxKind.NumericLiteral });
                        break;
                    case BuiltinType.String:
                        type = checker.getTypeAtLocation({ kind: ts.SyntaxKind.NoSubstitutionTemplateLiteral });
                        break;
                    case BuiltinType.Undefined:
                        type = checker.getTypeAtLocation({ kind: ts.SyntaxKind.VoidExpression });
                        break;
                    default:
                        throw new Error('Internal error, unhandled literal kind ' + kind + ':' + BuiltinType[kind]);
                }
                return new TypeWrapper(type, context);
            }
        }, {
            key: 'resolver',
            get: function get() {
                var _this25 = this;

                this.validate();
                var result = this._resolver;
                if (!result) {
                    var moduleResolver = new _compiler.NgModuleResolver(this.reflector);
                    var directiveResolver = new _compiler.DirectiveResolver(this.reflector);
                    var pipeResolver = new _compiler.PipeResolver(this.reflector);
                    var elementSchemaRegistry = new _compiler.DomElementSchemaRegistry();
                    var resourceLoader = new DummyResourceLoader();
                    var urlResolver = (0, _compiler.createOfflineCompileUrlResolver)();
                    var htmlParser = new DummyHtmlParser();
                    // This tracks the CompileConfig in codegen.ts. Currently these options
                    // are hard-coded except for genDebugInfo which is not applicable as we
                    // never generate code.
                    var config = new _compiler.CompilerConfig({
                        genDebugInfo: false,
                        defaultEncapsulation: _core.ViewEncapsulation.Emulated,
                        logBindingUpdate: false,
                        useJit: false
                    });
                    var directiveNormalizer = new _compiler.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
                    result = this._resolver = new _compiler.CompileMetadataResolver(config, moduleResolver, directiveResolver, pipeResolver, new _compiler.SummaryResolver(), elementSchemaRegistry, directiveNormalizer, this._staticSymbolCache, this.reflector, function (error, type) {
                        return _this25.collectError(error, type && type.filePath);
                    });
                }
                return result;
            }
        }, {
            key: 'program',
            get: function get() {
                return this.tsService.getProgram();
            }
        }, {
            key: 'checker',
            get: function get() {
                var checker = this._checker;
                if (!checker) {
                    checker = this._checker = this.program.getTypeChecker();
                }
                return checker;
            }
        }, {
            key: 'reflectorHost',
            get: function get() {
                var _this26 = this;

                var result = this._reflectorHost;
                if (!result) {
                    if (!this.context) {
                        // Make up a context by finding the first script and using that as the base dir.
                        this.context = this.host.getScriptFileNames()[0];
                    }
                    // Use the file context's directory as the base directory.
                    // The host's getCurrentDirectory() is not reliable as it is always "" in
                    // tsserver. We don't need the exact base directory, just one that contains
                    // a source file.
                    var source = this.tsService.getProgram().getSourceFile(this.context);
                    if (!source) {
                        throw new Error('Internal error: no context could be determined');
                    }
                    var tsConfigPath = findTsConfig(source.fileName);
                    var basePath = path.dirname(tsConfigPath || this.context);
                    result = this._reflectorHost = new ReflectorHost(function () {
                        return _this26.tsService.getProgram();
                    }, this.host, { basePath: basePath, genDir: basePath });
                }
                return result;
            }
        }, {
            key: 'staticSymbolResolver',
            get: function get() {
                var _this27 = this;

                var result = this._staticSymbolResolver;
                if (!result) {
                    var summaryResolver = new _compiler.AotSummaryResolver({
                        loadSummary: function loadSummary(filePath) {
                            return null;
                        },
                        isSourceFile: function isSourceFile(sourceFilePath) {
                            return true;
                        },
                        getOutputFileName: function getOutputFileName(sourceFilePath) {
                            return null;
                        }
                    }, this._staticSymbolCache);
                    result = this._staticSymbolResolver = new _compiler.StaticSymbolResolver(this.reflectorHost, this._staticSymbolCache, summaryResolver, function (e, filePath) {
                        return _this27.collectError(e, filePath);
                    });
                }
                return result;
            }
        }, {
            key: 'reflector',
            get: function get() {
                var _this28 = this;

                var result = this._reflector;
                if (!result) {
                    result = this._reflector = new _compiler.StaticReflector(this.staticSymbolResolver, [], [], function (e, filePath) {
                        return _this28.collectError(e, filePath);
                    });
                }
                return result;
            }
        }]);

        return TypeScriptServiceHost;
    }();

    TypeScriptServiceHost.missingTemplate = [];

    var TypeScriptSymbolQuery = function () {
        function TypeScriptSymbolQuery(program, checker, source, fetchPipes) {
            _classCallCheck(this, TypeScriptSymbolQuery);

            this.program = program;
            this.checker = checker;
            this.source = source;
            this.fetchPipes = fetchPipes;
            this.typeCache = new Map();
        }

        _createClass(TypeScriptSymbolQuery, [{
            key: 'getTypeKind',
            value: function getTypeKind(symbol) {
                return typeKindOf(this.getTsTypeOf(symbol));
            }
        }, {
            key: 'getBuiltinType',
            value: function getBuiltinType(kind) {
                // TODO: Replace with typeChecker API when available.
                var result = this.typeCache.get(kind);
                if (!result) {
                    var _type2 = getBuiltinTypeFromTs(kind, { checker: this.checker, node: this.source, program: this.program });
                    result = new TypeWrapper(_type2, { program: this.program, checker: this.checker, node: this.source });
                    this.typeCache.set(kind, result);
                }
                return result;
            }
        }, {
            key: 'getTypeUnion',
            value: function getTypeUnion() {
                var _ref2;

                // TODO: Replace with typeChecker API when available
                var checker = this.checker;
                // No API exists so the cheat is to just return the last type any if no types are given.
                return arguments.length ? (_ref2 = arguments.length - 1, arguments.length <= _ref2 ? undefined : arguments[_ref2]) : this.getBuiltinType(BuiltinType.Any);
            }
        }, {
            key: 'getArrayType',
            value: function getArrayType(type) {
                // TODO: Replace with typeChecker API when available
                return this.getBuiltinType(BuiltinType.Any);
            }
        }, {
            key: 'getElementType',
            value: function getElementType(type) {
                if (type instanceof TypeWrapper) {
                    var elementType = getTypeParameterOf(type.tsType, 'Array');
                    if (elementType) {
                        return new TypeWrapper(elementType, type.context);
                    }
                }
            }
        }, {
            key: 'getNonNullableType',
            value: function getNonNullableType(symbol) {
                // TODO: Replace with typeChecker API when available;
                return symbol;
            }
        }, {
            key: 'getPipes',
            value: function getPipes() {
                var result = this.pipesCache;
                if (!result) {
                    result = this.pipesCache = this.fetchPipes();
                }
                return result;
            }
        }, {
            key: 'getTemplateContext',
            value: function getTemplateContext(type) {
                var context = { node: this.source, program: this.program, checker: this.checker };
                var typeSymbol = findClassSymbolInContext(type, context);
                if (typeSymbol) {
                    var contextType = this.getTemplateRefContextType(typeSymbol);
                    if (contextType) return new SymbolWrapper(contextType, context).members();
                }
            }
        }, {
            key: 'getTypeSymbol',
            value: function getTypeSymbol(type) {
                var context = { node: this.source, program: this.program, checker: this.checker };
                var typeSymbol = findClassSymbolInContext(type, context);
                return new SymbolWrapper(typeSymbol, context);
            }
        }, {
            key: 'createSymbolTable',
            value: function createSymbolTable(symbols) {
                var result = new MapSymbolTable();
                result.addAll(symbols.map(function (s) {
                    return new DeclaredSymbol(s);
                }));
                return result;
            }
        }, {
            key: 'mergeSymbolTable',
            value: function mergeSymbolTable(symbolTables) {
                var result = new MapSymbolTable();
                var _iteratorNormalCompletion18 = true;
                var _didIteratorError18 = false;
                var _iteratorError18 = undefined;

                try {
                    for (var _iterator18 = symbolTables[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                        var symbolTable = _step18.value;

                        result.addAll(symbolTable.values());
                    }
                } catch (err) {
                    _didIteratorError18 = true;
                    _iteratorError18 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion18 && _iterator18.return) {
                            _iterator18.return();
                        }
                    } finally {
                        if (_didIteratorError18) {
                            throw _iteratorError18;
                        }
                    }
                }

                return result;
            }
        }, {
            key: 'getSpanAt',
            value: function getSpanAt(line, column) {
                return spanAt(this.source, line, column);
            }
        }, {
            key: 'getTemplateRefContextType',
            value: function getTemplateRefContextType(type) {
                var constructor = type.members['__constructor'];
                if (constructor) {
                    var constructorDeclaration = constructor.declarations[0];
                    var _iteratorNormalCompletion19 = true;
                    var _didIteratorError19 = false;
                    var _iteratorError19 = undefined;

                    try {
                        for (var _iterator19 = constructorDeclaration.parameters[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                            var parameter = _step19.value;

                            var _type3 = this.checker.getTypeAtLocation(parameter.type);
                            if (_type3.symbol.name == 'TemplateRef' && isReferenceType(_type3)) {
                                var typeReference = _type3;
                                if (typeReference.typeArguments.length === 1) {
                                    return typeReference.typeArguments[0].symbol;
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError19 = true;
                        _iteratorError19 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion19 && _iterator19.return) {
                                _iterator19.return();
                            }
                        } finally {
                            if (_didIteratorError19) {
                                throw _iteratorError19;
                            }
                        }
                    }

                    ;
                }
            }
        }, {
            key: 'getTsTypeOf',
            value: function getTsTypeOf(symbol) {
                var type = this.getTypeWrapper(symbol);
                return type && type.tsType;
            }
        }, {
            key: 'getTypeWrapper',
            value: function getTypeWrapper(symbol) {
                var type = undefined;
                if (symbol instanceof TypeWrapper) {
                    type = symbol;
                } else if (symbol.type instanceof TypeWrapper) {
                    type = symbol.type;
                }
                return type;
            }
        }]);

        return TypeScriptSymbolQuery;
    }();

    function typeCallable(type) {
        var signatures = type.getCallSignatures();
        return signatures && signatures.length != 0;
    }
    function signaturesOf(type, context) {
        return type.getCallSignatures().map(function (s) {
            return new SignatureWrapper(s, context);
        });
    }
    function _selectSignature(type, context, types) {
        // TODO: Do a better job of selecting the right signature.
        var signatures = type.getCallSignatures();
        return signatures.length ? new SignatureWrapper(signatures[0], context) : undefined;
    }
    function toSymbolTable(symbols) {
        var result = {};
        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
            for (var _iterator20 = symbols[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                var symbol = _step20.value;

                result[symbol.name] = symbol;
            }
        } catch (err) {
            _didIteratorError20 = true;
            _iteratorError20 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion20 && _iterator20.return) {
                    _iterator20.return();
                }
            } finally {
                if (_didIteratorError20) {
                    throw _iteratorError20;
                }
            }
        }

        return result;
    }
    function toSymbols(symbolTable, filter) {
        var result = [];
        var own = typeof symbolTable.hasOwnProperty === 'function' ? function (name) {
            return symbolTable.hasOwnProperty(name);
        } : function (name) {
            return !!symbolTable[name];
        };
        for (var name in symbolTable) {
            if (own(name) && (!filter || filter(symbolTable[name]))) {
                result.push(symbolTable[name]);
            }
        }
        return result;
    }

    var TypeWrapper = function () {
        function TypeWrapper(tsType, context) {
            _classCallCheck(this, TypeWrapper);

            this.tsType = tsType;
            this.context = context;
            if (!tsType) {
                throw Error('Internal: null type');
            }
        }

        _createClass(TypeWrapper, [{
            key: 'members',
            value: function members() {
                return new SymbolTableWrapper(this.tsType.getProperties(), this.context);
            }
        }, {
            key: 'signatures',
            value: function signatures() {
                return signaturesOf(this.tsType, this.context);
            }
        }, {
            key: 'selectSignature',
            value: function selectSignature(types) {
                return _selectSignature(this.tsType, this.context, types);
            }
        }, {
            key: 'indexed',
            value: function indexed(argument) {
                return undefined;
            }
        }, {
            key: 'name',
            get: function get() {
                var symbol = this.tsType.symbol;
                return symbol && symbol.name || '<anonymous>';
            }
        }, {
            key: 'kind',
            get: function get() {
                return 'type';
            }
        }, {
            key: 'language',
            get: function get() {
                return 'typescript';
            }
        }, {
            key: 'type',
            get: function get() {
                return undefined;
            }
        }, {
            key: 'container',
            get: function get() {
                return undefined;
            }
        }, {
            key: 'public',
            get: function get() {
                return true;
            }
        }, {
            key: 'callable',
            get: function get() {
                return typeCallable(this.tsType);
            }
        }, {
            key: 'definition',
            get: function get() {
                return definitionFromTsSymbol(this.tsType.getSymbol());
            }
        }]);

        return TypeWrapper;
    }();

    var SymbolWrapper = function () {
        function SymbolWrapper(symbol, context) {
            _classCallCheck(this, SymbolWrapper);

            this.symbol = symbol;
            this.context = context;
        }

        _createClass(SymbolWrapper, [{
            key: 'members',
            value: function members() {
                return new SymbolTableWrapper(this.symbol.members, this.context);
            }
        }, {
            key: 'signatures',
            value: function signatures() {
                return signaturesOf(this.tsType, this.context);
            }
        }, {
            key: 'selectSignature',
            value: function selectSignature(types) {
                return _selectSignature(this.tsType, this.context, types);
            }
        }, {
            key: 'indexed',
            value: function indexed(argument) {
                return undefined;
            }
        }, {
            key: 'name',
            get: function get() {
                return this.symbol.name;
            }
        }, {
            key: 'kind',
            get: function get() {
                return this.callable ? 'method' : 'property';
            }
        }, {
            key: 'language',
            get: function get() {
                return 'typescript';
            }
        }, {
            key: 'type',
            get: function get() {
                return new TypeWrapper(this.tsType, this.context);
            }
        }, {
            key: 'container',
            get: function get() {
                return getContainerOf(this.symbol, this.context);
            }
        }, {
            key: 'public',
            get: function get() {
                // Symbols that are not explicitly made private are public.
                return !isSymbolPrivate(this.symbol);
            }
        }, {
            key: 'callable',
            get: function get() {
                return typeCallable(this.tsType);
            }
        }, {
            key: 'definition',
            get: function get() {
                return definitionFromTsSymbol(this.symbol);
            }
        }, {
            key: 'tsType',
            get: function get() {
                var type = this._tsType;
                if (!type) {
                    type = this._tsType = this.context.checker.getTypeOfSymbolAtLocation(this.symbol, this.context.node);
                }
                return type;
            }
        }]);

        return SymbolWrapper;
    }();

    var DeclaredSymbol = function () {
        function DeclaredSymbol(declaration) {
            _classCallCheck(this, DeclaredSymbol);

            this.declaration = declaration;
        }

        _createClass(DeclaredSymbol, [{
            key: 'members',
            value: function members() {
                return this.declaration.type.members();
            }
        }, {
            key: 'signatures',
            value: function signatures() {
                return this.declaration.type.signatures();
            }
        }, {
            key: 'selectSignature',
            value: function selectSignature(types) {
                return this.declaration.type.selectSignature(types);
            }
        }, {
            key: 'indexed',
            value: function indexed(argument) {
                return undefined;
            }
        }, {
            key: 'name',
            get: function get() {
                return this.declaration.name;
            }
        }, {
            key: 'kind',
            get: function get() {
                return this.declaration.kind;
            }
        }, {
            key: 'language',
            get: function get() {
                return 'ng-template';
            }
        }, {
            key: 'container',
            get: function get() {
                return undefined;
            }
        }, {
            key: 'type',
            get: function get() {
                return this.declaration.type;
            }
        }, {
            key: 'callable',
            get: function get() {
                return this.declaration.type.callable;
            }
        }, {
            key: 'public',
            get: function get() {
                return true;
            }
        }, {
            key: 'definition',
            get: function get() {
                return this.declaration.definition;
            }
        }]);

        return DeclaredSymbol;
    }();

    var SignatureWrapper = function () {
        function SignatureWrapper(signature, context) {
            _classCallCheck(this, SignatureWrapper);

            this.signature = signature;
            this.context = context;
        }

        _createClass(SignatureWrapper, [{
            key: 'arguments',
            get: function get() {
                return new SymbolTableWrapper(this.signature.getParameters(), this.context);
            }
        }, {
            key: 'result',
            get: function get() {
                return new TypeWrapper(this.signature.getReturnType(), this.context);
            }
        }]);

        return SignatureWrapper;
    }();

    var SignatureResultOverride = function () {
        function SignatureResultOverride(signature, resultType) {
            _classCallCheck(this, SignatureResultOverride);

            this.signature = signature;
            this.resultType = resultType;
        }

        _createClass(SignatureResultOverride, [{
            key: 'arguments',
            get: function get() {
                return this.signature.arguments;
            }
        }, {
            key: 'result',
            get: function get() {
                return this.resultType;
            }
        }]);

        return SignatureResultOverride;
    }();

    var SymbolTableWrapper = function () {
        function SymbolTableWrapper(symbols, context, filter) {
            _classCallCheck(this, SymbolTableWrapper);

            this.context = context;
            if (Array.isArray(symbols)) {
                this.symbols = filter ? symbols.filter(filter) : symbols;
                this.symbolTable = toSymbolTable(symbols);
            } else {
                this.symbols = toSymbols(symbols, filter);
                this.symbolTable = filter ? toSymbolTable(this.symbols) : symbols;
            }
        }

        _createClass(SymbolTableWrapper, [{
            key: 'get',
            value: function get(key) {
                var symbol = this.symbolTable[key];
                return symbol ? new SymbolWrapper(symbol, this.context) : undefined;
            }
        }, {
            key: 'has',
            value: function has(key) {
                return this.symbolTable[key] != null;
            }
        }, {
            key: 'values',
            value: function values() {
                var _this29 = this;

                return this.symbols.map(function (s) {
                    return new SymbolWrapper(s, _this29.context);
                });
            }
        }, {
            key: 'size',
            get: function get() {
                return this.symbols.length;
            }
        }]);

        return SymbolTableWrapper;
    }();

    var MapSymbolTable = function () {
        function MapSymbolTable() {
            _classCallCheck(this, MapSymbolTable);

            this.map = new Map();
            this._values = [];
        }

        _createClass(MapSymbolTable, [{
            key: 'get',
            value: function get(key) {
                return this.map.get(key);
            }
        }, {
            key: 'add',
            value: function add(symbol) {
                if (this.map.has(symbol.name)) {
                    var previous = this.map.get(symbol.name);
                    this._values[this._values.indexOf(previous)] = symbol;
                }
                this.map.set(symbol.name, symbol);
                this._values.push(symbol);
            }
        }, {
            key: 'addAll',
            value: function addAll(symbols) {
                var _iteratorNormalCompletion21 = true;
                var _didIteratorError21 = false;
                var _iteratorError21 = undefined;

                try {
                    for (var _iterator21 = symbols[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                        var symbol = _step21.value;

                        this.add(symbol);
                    }
                } catch (err) {
                    _didIteratorError21 = true;
                    _iteratorError21 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion21 && _iterator21.return) {
                            _iterator21.return();
                        }
                    } finally {
                        if (_didIteratorError21) {
                            throw _iteratorError21;
                        }
                    }
                }
            }
        }, {
            key: 'has',
            value: function has(key) {
                return this.map.has(key);
            }
        }, {
            key: 'values',
            value: function values() {
                // Switch to this.map.values once iterables are supported by the target language.
                return this._values;
            }
        }, {
            key: 'size',
            get: function get() {
                return this.map.size;
            }
        }]);

        return MapSymbolTable;
    }();

    var PipesTable = function () {
        function PipesTable(pipes, context) {
            _classCallCheck(this, PipesTable);

            this.pipes = pipes;
            this.context = context;
        }

        _createClass(PipesTable, [{
            key: 'get',
            value: function get(key) {
                var pipe = this.pipes.find(function (pipe) {
                    return pipe.name == key;
                });
                if (pipe) {
                    return new PipeSymbol(pipe, this.context);
                }
            }
        }, {
            key: 'has',
            value: function has(key) {
                return this.pipes.find(function (pipe) {
                    return pipe.name == key;
                }) != null;
            }
        }, {
            key: 'values',
            value: function values() {
                var _this30 = this;

                return this.pipes.map(function (pipe) {
                    return new PipeSymbol(pipe, _this30.context);
                });
            }
        }, {
            key: 'size',
            get: function get() {
                return this.pipes.length;
            }
        }]);

        return PipesTable;
    }();

    var PipeSymbol = function () {
        function PipeSymbol(pipe, context) {
            _classCallCheck(this, PipeSymbol);

            this.pipe = pipe;
            this.context = context;
        }

        _createClass(PipeSymbol, [{
            key: 'members',
            value: function members() {
                return EmptyTable.instance;
            }
        }, {
            key: 'signatures',
            value: function signatures() {
                return signaturesOf(this.tsType, this.context);
            }
        }, {
            key: 'selectSignature',
            value: function selectSignature(types) {
                var signature = _selectSignature(this.tsType, this.context, types);
                if (types.length == 1) {
                    var parameterType = types[0];
                    if (parameterType instanceof TypeWrapper) {
                        var resultType = undefined;
                        switch (this.name) {
                            case 'async':
                                switch (parameterType.name) {
                                    case 'Observable':
                                    case 'Promise':
                                    case 'EventEmitter':
                                        resultType = getTypeParameterOf(parameterType.tsType, parameterType.name);
                                        break;
                                }
                                break;
                            case 'slice':
                                resultType = getTypeParameterOf(parameterType.tsType, 'Array');
                                break;
                        }
                        if (resultType) {
                            signature = new SignatureResultOverride(signature, new TypeWrapper(resultType, parameterType.context));
                        }
                    }
                }
                return signature;
            }
        }, {
            key: 'indexed',
            value: function indexed(argument) {
                return undefined;
            }
        }, {
            key: 'findClassSymbol',
            value: function findClassSymbol(type) {
                return findClassSymbolInContext(type, this.context);
            }
        }, {
            key: 'findTransformMethodType',
            value: function findTransformMethodType(classSymbol) {
                var transform = classSymbol.members['transform'];
                if (transform) {
                    return this.context.checker.getTypeOfSymbolAtLocation(transform, this.context.node);
                }
            }
        }, {
            key: 'name',
            get: function get() {
                return this.pipe.name;
            }
        }, {
            key: 'kind',
            get: function get() {
                return 'pipe';
            }
        }, {
            key: 'language',
            get: function get() {
                return 'typescript';
            }
        }, {
            key: 'type',
            get: function get() {
                return new TypeWrapper(this.tsType, this.context);
            }
        }, {
            key: 'container',
            get: function get() {
                return undefined;
            }
        }, {
            key: 'callable',
            get: function get() {
                return true;
            }
        }, {
            key: 'public',
            get: function get() {
                return true;
            }
        }, {
            key: 'definition',
            get: function get() {
                return definitionFromTsSymbol(this.tsType.getSymbol());
            }
        }, {
            key: 'tsType',
            get: function get() {
                var type = this._tsType;
                if (!type) {
                    var classSymbol = this.findClassSymbol(this.pipe.symbol);
                    if (classSymbol) {
                        type = this._tsType = this.findTransformMethodType(classSymbol);
                    }
                    if (!type) {
                        type = this._tsType = getBuiltinTypeFromTs(BuiltinType.Any, this.context);
                    }
                }
                return type;
            }
        }]);

        return PipeSymbol;
    }();

    function findClassSymbolInContext(type, context) {
        var sourceFile = context.program.getSourceFile(type.filePath);
        if (sourceFile) {
            var moduleSymbol = sourceFile.module || sourceFile.symbol;
            var exports = context.checker.getExportsOfModule(moduleSymbol);
            return (exports || []).find(function (symbol) {
                return symbol.name == type.name;
            });
        }
    }

    var EmptyTable = function () {
        function EmptyTable() {
            _classCallCheck(this, EmptyTable);
        }

        _createClass(EmptyTable, [{
            key: 'get',
            value: function get(key) {
                return undefined;
            }
        }, {
            key: 'has',
            value: function has(key) {
                return false;
            }
        }, {
            key: 'values',
            value: function values() {
                return [];
            }
        }, {
            key: 'size',
            get: function get() {
                return 0;
            }
        }]);

        return EmptyTable;
    }();

    EmptyTable.instance = new EmptyTable();
    function findTsConfig(fileName) {
        var dir = path.dirname(fileName);
        while (fs.existsSync(dir)) {
            var candidate = path.join(dir, 'tsconfig.json');
            if (fs.existsSync(candidate)) return candidate;
            dir = path.dirname(dir);
        }
    }
    function isSymbolPrivate(s) {
        return s.valueDeclaration && isPrivate(s.valueDeclaration);
    }
    function getBuiltinTypeFromTs(kind, context) {
        var type = void 0;
        var checker = context.checker;
        var node = context.node;
        switch (kind) {
            case BuiltinType.Any:
                type = checker.getTypeAtLocation(setParents({
                    kind: ts.SyntaxKind.AsExpression,
                    expression: { kind: ts.SyntaxKind.TrueKeyword },
                    type: { kind: ts.SyntaxKind.AnyKeyword }
                }, node));
                break;
            case BuiltinType.Boolean:
                type = checker.getTypeAtLocation(setParents({ kind: ts.SyntaxKind.TrueKeyword }, node));
                break;
            case BuiltinType.Null:
                type = checker.getTypeAtLocation(setParents({ kind: ts.SyntaxKind.NullKeyword }, node));
                break;
            case BuiltinType.Number:
                var numeric = { kind: ts.SyntaxKind.NumericLiteral };
                setParents({ kind: ts.SyntaxKind.ExpressionStatement, expression: numeric }, node);
                type = checker.getTypeAtLocation(numeric);
                break;
            case BuiltinType.String:
                type = checker.getTypeAtLocation(setParents({ kind: ts.SyntaxKind.NoSubstitutionTemplateLiteral }, node));
                break;
            case BuiltinType.Undefined:
                type = checker.getTypeAtLocation(setParents({
                    kind: ts.SyntaxKind.VoidExpression,
                    expression: { kind: ts.SyntaxKind.NumericLiteral }
                }, node));
                break;
            default:
                throw new Error('Internal error, unhandled literal kind ' + kind + ':' + BuiltinType[kind]);
        }
        return type;
    }
    function setParents(node, parent) {
        node.parent = parent;
        ts.forEachChild(node, function (child) {
            return setParents(child, node);
        });
        return node;
    }
    function spanOf$1(node) {
        return { start: node.getStart(), end: node.getEnd() };
    }
    function shrink(span, offset) {
        if (offset == null) offset = 1;
        return { start: span.start + offset, end: span.end - offset };
    }
    function spanAt(sourceFile, line, column) {
        if (line != null && column != null) {
            var position = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
            var findChild = function findChild(node) {
                if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position && node.end > position) {
                    var betterNode = ts.forEachChild(node, findChild);
                    return betterNode || node;
                }
            };
            var node = ts.forEachChild(sourceFile, findChild);
            if (node) {
                return { start: node.getStart(), end: node.getEnd() };
            }
        }
    }
    function definitionFromTsSymbol(symbol) {
        var declarations = symbol.declarations;
        if (declarations) {
            return declarations.map(function (declaration) {
                var sourceFile = declaration.getSourceFile();
                return {
                    fileName: sourceFile.fileName,
                    span: { start: declaration.getStart(), end: declaration.getEnd() }
                };
            });
        }
    }
    function parentDeclarationOf(node) {
        while (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    return node;
                case ts.SyntaxKind.SourceFile:
                    return null;
            }
            node = node.parent;
        }
    }
    function getContainerOf(symbol, context) {
        if (symbol.getFlags() & ts.SymbolFlags.ClassMember && symbol.declarations) {
            var _iteratorNormalCompletion22 = true;
            var _didIteratorError22 = false;
            var _iteratorError22 = undefined;

            try {
                for (var _iterator22 = symbol.declarations[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                    var _declaration2 = _step22.value;

                    var parent = parentDeclarationOf(_declaration2);
                    if (parent) {
                        var _type4 = context.checker.getTypeAtLocation(parent);
                        if (_type4) {
                            return new TypeWrapper(_type4, context);
                        }
                    }
                }
            } catch (err) {
                _didIteratorError22 = true;
                _iteratorError22 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion22 && _iterator22.return) {
                        _iterator22.return();
                    }
                } finally {
                    if (_didIteratorError22) {
                        throw _iteratorError22;
                    }
                }
            }
        }
    }
    function getTypeParameterOf(type, name) {
        if (type && type.symbol && type.symbol.name == name) {
            var typeArguments = type.typeArguments;
            if (typeArguments && typeArguments.length <= 1) {
                return typeArguments[0];
            }
        }
    }
    function typeKindOf(type) {
        if (type) {
            if (type.flags & ts.TypeFlags.Any) {
                return BuiltinType.Any;
            } else if (type.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral)) {
                return BuiltinType.String;
            } else if (type.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike)) {
                return BuiltinType.Number;
            } else if (type.flags & ts.TypeFlags.Undefined) {
                return BuiltinType.Undefined;
            } else if (type.flags & ts.TypeFlags.Null) {
                return BuiltinType.Null;
            } else if (type.flags & ts.TypeFlags.Union) {
                // If all the constituent types of a union are the same kind, it is also that kind.
                var candidate = void 0;
                var unionType = type;
                if (unionType.types.length > 0) {
                    candidate = typeKindOf(unionType.types[0]);
                    var _iteratorNormalCompletion23 = true;
                    var _didIteratorError23 = false;
                    var _iteratorError23 = undefined;

                    try {
                        for (var _iterator23 = unionType.types[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                            var subType = _step23.value;

                            if (candidate != typeKindOf(subType)) {
                                return BuiltinType.Other;
                            }
                        }
                    } catch (err) {
                        _didIteratorError23 = true;
                        _iteratorError23 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion23 && _iterator23.return) {
                                _iterator23.return();
                            }
                        } finally {
                            if (_didIteratorError23) {
                                throw _iteratorError23;
                            }
                        }
                    }
                }
                return candidate;
            } else if (type.flags & ts.TypeFlags.TypeParameter) {
                return BuiltinType.Unbound;
            }
        }
        return BuiltinType.Other;
    }

    function create(info /* ts.server.PluginCreateInfo */) {
        // Create the proxy
        var proxy = Object.create(null);
        var oldLS = info.languageService;

        var _loop5 = function _loop5(k) {
            proxy[k] = function () {
                return oldLS[k].apply(oldLS, arguments);
            };
        };

        for (var k in oldLS) {
            _loop5(k);
        }
        function completionToEntry(c) {
            return { kind: c.kind, name: c.name, sortText: c.sort, kindModifiers: '' };
        }
        function diagnosticToDiagnostic(d, file) {
            return {
                file: file,
                start: d.span.start,
                length: d.span.end - d.span.start,
                messageText: d.message,
                category: ts.DiagnosticCategory.Error,
                code: 0
            };
        }
        function tryOperation(attempting, callback) {
            try {
                callback();
            } catch (e) {
                info.project.projectService.logger.info('Failed to ' + attempting + ': ' + e.toString());
                info.project.projectService.logger.info('Stack trace: ' + e.stack);
            }
        }
        var serviceHost = new TypeScriptServiceHost(info.languageServiceHost, info.languageService);
        var ls = createLanguageService(serviceHost);
        serviceHost.setSite(ls);
        proxy.getCompletionsAtPosition = function (fileName, position) {
            var base = oldLS.getCompletionsAtPosition(fileName, position);
            tryOperation('get completions', function () {
                var results = ls.getCompletionsAt(fileName, position);
                if (results && results.length) {
                    if (base === undefined) {
                        base = {
                            isGlobalCompletion: false,
                            isMemberCompletion: false,
                            isNewIdentifierLocation: false,
                            entries: []
                        };
                    }
                    var _iteratorNormalCompletion24 = true;
                    var _didIteratorError24 = false;
                    var _iteratorError24 = undefined;

                    try {
                        for (var _iterator24 = results[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                            var entry = _step24.value;

                            base.entries.push(completionToEntry(entry));
                        }
                    } catch (err) {
                        _didIteratorError24 = true;
                        _iteratorError24 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion24 && _iterator24.return) {
                                _iterator24.return();
                            }
                        } finally {
                            if (_didIteratorError24) {
                                throw _iteratorError24;
                            }
                        }
                    }
                }
            });
            return base;
        };
        proxy.getQuickInfoAtPosition = function (fileName, position) {
            var base = oldLS.getQuickInfoAtPosition(fileName, position);
            tryOperation('get quick info', function () {
                var ours = ls.getHoverAt(fileName, position);
                if (ours) {
                    var displayParts = [];
                    var _iteratorNormalCompletion25 = true;
                    var _didIteratorError25 = false;
                    var _iteratorError25 = undefined;

                    try {
                        for (var _iterator25 = ours.text[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
                            var part = _step25.value;

                            displayParts.push({ kind: part.language, text: part.text });
                        }
                    } catch (err) {
                        _didIteratorError25 = true;
                        _iteratorError25 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion25 && _iterator25.return) {
                                _iterator25.return();
                            }
                        } finally {
                            if (_didIteratorError25) {
                                throw _iteratorError25;
                            }
                        }
                    }

                    base = {
                        displayParts: displayParts,
                        documentation: [],
                        kind: 'angular',
                        kindModifiers: 'what does this do?',
                        textSpan: { start: ours.span.start, length: ours.span.end - ours.span.start },
                        tags: []
                    };
                }
            });
            return base;
        };
        proxy.getSemanticDiagnostics = function (fileName) {
            var base = oldLS.getSemanticDiagnostics(fileName);
            if (base === undefined) {
                base = [];
            }
            tryOperation('get diagnostics', function () {
                info.project.projectService.logger.info('Computing Angular semantic diagnostics...');
                var ours = ls.getDiagnostics(fileName);
                if (ours && ours.length) {
                    var file = oldLS.getProgram().getSourceFile(fileName);
                    base.push.apply(base, ours.map(function (d) {
                        return diagnosticToDiagnostic(d, file);
                    }));
                }
            });
            return base;
        };
        proxy.getDefinitionAtPosition = function (fileName, position) {
            var base = oldLS.getDefinitionAtPosition(fileName, position);
            if (base && base.length) {
                return base;
            }
            tryOperation('get definition', function () {
                var ours = ls.getDefinitionAt(fileName, position);
                if (ours && ours.length) {
                    base = base || [];
                    var _iteratorNormalCompletion26 = true;
                    var _didIteratorError26 = false;
                    var _iteratorError26 = undefined;

                    try {
                        for (var _iterator26 = ours[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
                            var loc = _step26.value;

                            base.push({
                                fileName: loc.fileName,
                                textSpan: { start: loc.span.start, length: loc.span.end - loc.span.start },
                                name: '',
                                kind: 'definition',
                                containerName: loc.fileName,
                                containerKind: 'file'
                            });
                        }
                    } catch (err) {
                        _didIteratorError26 = true;
                        _iteratorError26 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion26 && _iterator26.return) {
                                _iterator26.return();
                            }
                        } finally {
                            if (_didIteratorError26) {
                                throw _iteratorError26;
                            }
                        }
                    }
                }
            });
            return base;
        };
        return proxy;
    }

    /**
     * @stable
     */
    var VERSION = new _core.Version('4.0.0-beta.8-c53621b');

    exports.createLanguageService = createLanguageService;
    exports.create = create;
    exports.TypeScriptServiceHost = TypeScriptServiceHost;
    exports.createLanguageServiceFromTypescript = createLanguageServiceFromTypescript;
    exports.VERSION = VERSION;
});
