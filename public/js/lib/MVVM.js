(function (DOC) {
     var prefix = "ct-";
     var expose = new Date - 0
     var subscribers = "$" + expose
     var W3C = window.dispatchEvent;
     var ap = Array.prototype
     var aslice = ap.slice
     var Registry = {}
     var rword = /[^, ]+/g
     var root = DOC.documentElement;
     var head = DOC.getElementsByTagName("head")[0];
     var openTag = "{{";
     var closeTag = "}}";
     var _splice = ap.splice;
     var o = escapeRegExp(openTag), c = escapeRegExp(closeTag);
     var rexpr = new RegExp(o + "(.*?)" + c)
     var rbind = new RegExp(o + ".*?" + c + "|\\sct-");
     var rcomplexType = /^(?:object|array)$/;
     var hyperspace = DOC.createDocumentFragment()
     var rregexp = /[-.*+?^${}()|[\]\/\\]/g
     var oproto = Object.prototype
     var ohasOwn = oproto.hasOwnProperty
     var serialize = oproto.toString
     var class2type = {};
     "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
         class2type["[object " + name + "]"] = name.toLowerCase()
     })
     /*********************************************************************
     *                               Tools                            *
     **********************************************************************/
     function escapeRegExp(target) {
         return (target + "").replace(rregexp, "\\$&")
     };

     function noop() { }

     function log(a) {
         if (window.console && avalon.config.debug) {
             console.log(W3C ? a : a + "")
         }
     }

     function getType(obj) {
         if (obj == null) {
             return String(obj)
         }
         return typeof obj === "object" || typeof obj === "function" ? class2type[serialize.call(obj)] || "object" : typeof obj
     }

     //===================repair Object.defineProperties in IE==============
     var defineProperty = Object.defineProperty
     try {
         defineProperty({}, "_",
            {
                value: "x"
            })
         var defineProperties = Object.defineProperties
     }
     catch (e) {
         if ("__defineGetter__"
            in cvvm) {
             defineProperty = function (obj, prop, desc) {
                 if ('value'
                    in desc) {
                     obj[prop] = desc.value
                 }
                 if ("get"
                    in desc) {
                     obj.__defineGetter__(prop, desc.get)
                 }
                 if ('set'
                    in desc) {
                     obj.__defineSetter__(prop, desc.set)
                 }
                 return obj
             }
             defineProperties = function (obj, descs) {
                 for (var prop in descs) {
                     if (descs.hasOwnProperty(prop)) {
                         defineProperty(obj, prop, descs[prop])
                     }
                 }
                 return obj
             }
         }
     }
     if (!defineProperties && window.VBArray) {
         window.execScript(["Function parseVB(code)", "\tExecuteGlobal(code)", "End Function", "Dim VBClassBodies", "Set VBClassBodies=CreateObject(\"Scripting.Dictionary\")", "Function findOrDefineVBClass(name,body)", "\tDim found", "\tfound=\"\"", "\tFor Each key in VBClassBodies", "\t\tIf body=VBClassBodies.Item(key) Then", "\t\t\tfound=key", "\t\t\tExit For", "\t\tEnd If", "\tnext", "\tIf found=\"\" Then", "\t\tparseVB(\"Class \" + name + body)", "\t\tVBClassBodies.Add name, body", "\t\tfound=name", "\tEnd If", "\tfindOrDefineVBClass=found", "End Function"].join("\n"), "VBScript")
         function VBMediator(accessingProperties, name, value) {
             var accessor = accessingProperties[name]
             if (typeof accessor == "function") {
                 if (arguments.length === 3) {
                     accessor(value)
                 }
                 else {
                     return accessor()
                 }
             }
         }
         defineProperties = function (name, accessingProperties, normalProperties) {
             var className = "VBClass" + setTimeout("1"), buffer = []
             buffer.push("\r\n\tPrivate [__data__], [__proxy__]", "\tPublic Default Function [__const__](d, p)", "\t\tSet [__data__] = d: set [__proxy__] = p", "\t\tSet [__const__] = Me",
                "\tEnd Function")
             for (name in normalProperties) {
                 buffer.push("\tPublic [" + name + "]")
             }
             buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
             for (name in accessingProperties) {
                 if (!(name in normalProperties)) {
                     buffer.push(
                        "\tPublic Property Let [" + name + "](val" + expose + ")",
                     //setter
                        "\t\tCall [__proxy__]([__data__], \"" + name + "\", val" + expose + ")", "\tEnd Property", "\tPublic Property Set [" + name + "](val" + expose + ")",
                     //setter
                        "\t\tCall [__proxy__]([__data__], \"" + name + "\", val" + expose + ")", "\tEnd Property", "\tPublic Property Get [" + name + "]",
                     //getter
                        "\tOn Error Resume Next",
                        "\t\tSet[" + name + "] = [__proxy__]([__data__],\"" + name + "\")", "\tIf Err.Number <> 0 Then", "\t\t[" + name + "] = [__proxy__]([__data__],\"" + name + "\")", "\tEnd If", "\tOn Error Goto 0", "\tEnd Property")
                 }
             }
             buffer.push("End Class")
             var code = buffer.join("\r\n"), realClassName = window['findOrDefineVBClass'](className, code) 
             if (realClassName == className) {
                 window.parseVB(["Function " + className + "Factory(a, b)",
                    "\tDim o", "\tSet o = (New " + className + ")(a, b)", "\tSet " + className + "Factory = o", "End Function"].join("\r\n"))
             }
             var ret = window[realClassName + "Factory"](accessingProperties, VBMediator) 
             return ret
         }
     }

     /*********************************************************************
     *                               MVVM                            *
     **********************************************************************/

     cvvm = function (el) {
         return new cvvm.init(el)
     }
     $.extend(cvvm,
        {
            version: 1.0,
            ui: {},
            type: getType,
            init: function (el) {
                this[0] = this.element = el
            },
            fn: cvvm.prototype,
            scan: function (elem, vmodel) {
                elem = elem || root
                var vmodels = vmodel ? [].concat(vmodel) : []
                scanTag(elem, vmodels)
            },
            bind: function (el, type, fn, phase) {
                var callback = W3C ? fn : function (e) {
                    return fn.call(el, fixEvent(e))
                }
                if (W3C) {
                    el.addEventListener(type, callback, !!phase)
                }
                else {
                    el.attachEvent("on" + type, callback)
                }
                return callback
            },
            unbind: W3C ? function (el, type, fn, phase) {
                el.removeEventListener(eventMap[type] || type, fn || noop, !!phase)
            } : function (el, type, fn) {
                el.detachEvent("on" + type, fn || noop)
            },
            Array:
            {
                ensure: function (target, item) {
                    if (target.indexOf(item) === -1) {
                        target.push(item)
                    }
                    return target
                },
                removeAt: function (target, index) {
                    return !!target.splice(index, 1).length
                },
                remove: function (target, item) {
                    var index = target.indexOf(item)
                    if (~index)
                        return cvvm.Array.removeAt(target, index)
                    return false
                }
            }
        });

     /*********************************************************************
     *          Listening Array（ct-each, ct-repeat）                     *
     **********************************************************************/

     function Collection(model) {
         var array = []
         array.$id = generateID()
         array[subscribers] = []
         array.$model = model
         // model.concat()
         array.$events = {}
         array._ = modelFactory({
             length: model.length
         })
         array._.$watch("length", function (a, b) {
             array.$fire("length", a, b)
         })
         for (var i in Observable) {
             array[i] = Observable[i]
         }
         $.extend(array, CollectionPrototype)
         return array
     }

     var CollectionPrototype =
        {
            _splice: ap.splice,
            _add: function (arr, pos) {
                var oldLength = this.length
                pos = typeof pos === "number" ? pos : oldLength
                var added = []
                for (var i = 0, n = arr.length; i < n; i++) {
                    added[i] = convert(arr[i])
                }
                _splice.apply(this, [pos, 0].concat(added))
                notifySubscribers(this, "add", pos, added)
                if (!this._stopFireLength) {
                    return this._.length = this.length
                }
            },
            _del: function (pos, n) {
                var ret = this._splice(pos, n)
                if (ret.length) {
                    notifySubscribers(this, "del", pos, n)
                    if (!this._stopFireLength) {
                        this._.length = this.length
                    }
                }
                return ret
            },
            push: function () {
                ap.push.apply(this.$model, arguments)
                var n = this._add(arguments)
                notifySubscribers(this, "index", n > 2 ? n - 2 : 0)
                return n
            },
            pushArray: function (array) {
                return this.push.apply(this, array)
            },
            unshift: function () {
                ap.unshift.apply(this.$model, arguments)
                var ret = this._add(arguments, 0) 
                notifySubscribers(this, "index", arguments.length)
                return ret
            },
            shift: function () {
                var el = this.$model.shift()
                this._del(0, 1)
                notifySubscribers(this, "index", 0)
                return el
            },
            pop: function () {
                var el = this.$model.pop()
                this._del(this.length - 1, 1)
                return el
            },
            splice: function (a, b) {
                a = resetNumber(a, this.length)
                var removed = _splice.apply(this.$model, arguments), ret = []
                this._stopFireLength = true
                if (removed.length) {
                    ret = this._del(a, removed.length)
                    if (arguments.length <= 2) {
                        notifySubscribers(this, "index", 0)
                    }
                }
                if (arguments.length > 2) {
                    this._add(aslice.call(arguments, 2), a)
                }
                this._stopFireLength = false
                this._.length = this.length
                return ret
            },
            contains: function (el) {
                return this.indexOf(el) !== -1
            },
            size: function () {
                return this._.length
            },
            remove: function (el) {
                return this.removeAt(this.indexOf(el))
            },
            removeAt: function (index) {
                return index >= 0 ? this.splice(index, 1) : []
            },
            clear: function () {
                this.$model.length = this.length = this._.length = 0
                notifySubscribers(this, "clear", 0)
                return this
            },
            removeAll: function (all) {
                if (Array.isArray(all)) {
                    all.forEach(function (el) {
                        this.remove(el)
                    }, this)
                }
                else if (typeof all === "function") {
                    for (var i = this.length - 1; i >= 0; i--) {
                        var el = this[i]
                        if (all(el, i)) {
                            this.splice(i, 1)
                        }
                    }
                }
                else {
                    this.clear()
                }
            },
            ensure: function (el) {
                if (!this.contains(el)) {
                    this.push(el)
                }
                return this
            },
            set: function (index, val) {
                if (index >= 0) {
                    var valueType = getType(val)
                    if (val && val.$model) {
                        val = val.$model
                    }
                    var target = this[index]
                    if (valueType === "object") {
                        for (var i in val) {
                            if (target.hasOwnProperty(i)) {
                                target[i] = val[i]
                            }
                        }
                    }
                    else if (valueType === "array") {
                        target.clear().push.apply(target, val)
                    }
                    else if (target !== val) {
                        this[index] = val
                        this.$model[index] = val
                        notifySubscribers(this, "set", index, val)
                    }
                }
                return this
            }
        };

     function convert(val) {
         if (rcomplexType.test(cvvm.type(val))) {
             val = val.$id ? val : modelFactory(val, val)
         }
         return val
     }
     /*********************************************************************
     *                           Observable                              *
     **********************************************************************/
     var Observable =
        {
            $watch: function (type, callback) {
                if (typeof callback === "function") {
                    var callbacks = this.$events[type]
                    if (callbacks) {
                        callbacks.push(callback)
                    }
                    else {
                        this.$events[type] = [callback]
                    }
                }
                else {
                    this.$events = this.$watch.backup
                }
                return this
            },
            $unwatch: function (type, callback) {
                var n = arguments.length
                if (n === 0) {
                    this.$watch.backup = this.$events
                    this.$events = {}
                }
                else if (n === 1) {
                    this.$events[type] = []
                }
                else {
                    var callbacks = this.$events[type] || []
                    var i = callbacks.length
                    while (~ --i < 0) {
                        if (callbacks[i] === callback) {
                            return callbacks.splice(i, 1)
                        }
                    }
                }
                return this
            },
            $fire: function (type) {
                var callbacks = this.$events[type] || []
                var all = this.$events.$all || []
                var args = aslice.call(arguments, 1)
                for (var i = 0, callback; callback = callbacks[i++]; ) {
                    callback.apply(this, args)
                }
                for (var i = 0, callback; callback = all[i++]; ) {
                    callback.apply(this, arguments)
                }
            }
        }

     function registerSubscriber(data, val) {
         Registry[expose] = data
         cvvm.openComputedCollect = true
         var fn = data.evaluator
         if (fn) {
             if (data.type === "duplex") {
                 data.handler()
             }
             else {
                 try {
                     data.handler(fn.apply(0, data.args), data.element, data)
                 }
                 catch (e) {
                     delete data.evaluator
                     if (data.nodeType === 3) {
                         data.node.data = openTag + data.value + closeTag
                     }
                 }
             }
         }
         else {
             data()
         }
         cvvm.openComputedCollect = false
         delete Registry[expose]
     }

     function collectSubscribers(accessor) {
         if (Registry[expose]) {
             var list = accessor[subscribers]
             list && list.push(Registry[expose]);
         }
     }

     function notifySubscribers(accessor) {
         var list = accessor[subscribers]
         if (list && list.length) {
             var args = aslice.call(arguments, 1)
             for (var i = list.length, fn; fn = list[--i]; ) {
                 var el = fn.element, remove
                 if (el && !cvvm.contains(ifSanctuary, el)) {
                     if (typeof el.sourceIndex == "number") {
                         //IE6-IE11
                         remove = el.sourceIndex === 0
                     }
                     else {
                         remove = !cvvm.contains(root, el)
                     }
                 }
                 if (remove) {
                     list.splice(i, 1)
                     log("debug: remove " + fn.name)
                 }
                 else if (typeof fn === "function") {
                     fn.apply(0, args);
                 }
                 else if (fn.getter) {
                     fn.handler.apply(fn, args);
                 }
                 else {
                     fn.handler(fn.evaluator.apply(0, fn.args || []), el, fn)
                 }
             }
         }
     }


     /*********************************************************************
     *                           modelFactory                             *
     **********************************************************************/
     function generateID() {
         return "cvvm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
     }

     var VMODELS = cvvm.vmodels = {}
     cvvm.define = function (id, factory) {
         if (VMODELS[id]) {
             log("warning: " + id + "cvvm.vmodels has exist! ")
         }
         var scope =
            {
                $watch: noop
            }
         factory(scope)
         var model = modelFactory(scope)
         stopRepeatAssign = true
         factory(model)
         stopRepeatAssign = false
         model.$id = id
         return VMODELS[id] = model
     }

     function modelFactory(scope, model) {
         if (Array.isArray(scope)) {
             var arr = scope.concat()
             scope.length = 0
             var collection = Collection(scope)
             collection.push.apply(collection, arr)
             return collection
         }
         if (typeof scope.nodeType === "number") {
             return scope
         }
         var vmodel = {}
         model = model || {}
         var accessingProperties = {}
         var normalProperties = {}
         var computedProperties = []
         var watchProperties = arguments[2] || {}
         var skipArray = scope.$skipArray
         for (var i = 0, name; name = skipProperties[i++]; ) {
             if (typeof name !== "string") {
                 log("warning:$skipArray[" + name + "] must be a string")
             }
             delete scope[name]
             normalProperties[name] = true
         }
         if (Array.isArray(skipArray)) {
             for (var i = 0, name; name = skipArray[i++]; ) {
                 normalProperties[name] = true
             }
         }
         for (var i in scope) {
             loopModel(i, scope[i], model, normalProperties, accessingProperties, computedProperties, watchProperties)
         }
         vmodel = defineProperties(vmodel, descriptorFactory(accessingProperties), normalProperties)
         for (var name in normalProperties) {
             vmodel[name] = normalProperties[name]
         }
         watchProperties.vmodel = vmodel
         vmodel.$model = model
         vmodel.$events = {}
         vmodel.$id = generateID()
         vmodel.$accessors = accessingProperties
         vmodel[subscribers] = []
         for (var i in Observable) {
             var fn = Observable[i]
             if (!W3C) {
                 fn = fn.bind(vmodel)
             }
             vmodel[i] = fn
         }
         vmodel.hasOwnProperty = function (name) {
             return name in vmodel.$model
         }
         for (var i = 0, fn; fn = computedProperties[i++]; ) {
             Registry[expose] = fn
             fn()
             collectSubscribers(fn)
             delete Registry[expose]
         }
         return vmodel
     }

     var skipProperties = ""
     //String("$id,$watch,$unwatch,$fire,$events,$model,$skipArray,$accessors," + subscribers).match(rword)
     var isEqual = Object.is || function (v1, v2) {
         if (v1 === 0 && v2 === 0) {
             return 1 / v1 === 1 / v2
         }
         else if (v1 !== v1) {
             return v2 !== v2
         }
         else {
             return v1 === v2
         }
     }

     function safeFire(a, b, c, d) {
         if (a.$events) {
             Observable.$fire.call(a, b, c, d)
         }
     }
     var descriptorFactory = W3C ? function (obj) {
         var descriptors = {}
         for (var i in obj) {
             descriptors[i] =
                {
                    get: obj[i],
                    set: obj[i],
                    enumerable: true,
                    configurable: true
                }
         }
         return descriptors
     } : function (a) {
         return a
     }

     function loopModel(name, val, model, normalProperties, accessingProperties, computedProperties, watchProperties) {
         model[name] = val
         if (normalProperties[name] || (val && val.nodeType)) {
             return normalProperties[name] = val
         }
         if (name.charAt(0) === "$" && !watchProperties[name]) {
             return normalProperties[name] = val
         }
         var valueType = getType(val)
         if (valueType === "function") {
             return normalProperties[name] = val
         }
         var accessor,
            oldArgs
         if (valueType === "object" && typeof val.get === "function" && Object.keys(val).length <= 2) {
             var setter = val.set, getter = val.get
             accessor = function (newValue) {
                 var vmodel = watchProperties.vmodel
                 var value = model[name], preValue = value
                 if (arguments.length) {
                     if (stopRepeatAssign) {
                         return
                     }
                     if (typeof setter === "function") {
                         var backup = vmodel.$events[name]
                         vmodel.$events[name] = [];
                         setter.call(vmodel, newValue)
                         vmodel.$events[name] = backup
                     }
                     if (!isEqual(oldArgs, newValue)) {
                         oldArgs = newValue
                         newValue = model[name] = getter.call(vmodel) 
                         withProxyCount && updateWithProxy(vmodel.$id, name, newValue) 
                         notifySubscribers(accessor) 
                         safeFire(vmodel, name, newValue, preValue) 
                     }
                 }
                 else {
                     if (cvvm.openComputedCollect) {
                         collectSubscribers(accessor)
                     }
                     newValue = model[name] = getter.call(vmodel)
                     if (!isEqual(value, newValue)) {
                         oldArgs = void 0
                         safeFire(vmodel, name, newValue, preValue)
                     }
                     return newValue
                 }
             }
             computedProperties.push(accessor)
         }
         else if (rcomplexType.test(valueType)) {
             accessor = function (newValue) {
                 var realAccessor = accessor.$vmodel, preValue = realAccessor.$model
                 if (arguments.length) {
                     if (stopRepeatAssign) {
                         return
                     }
                     if (!isEqual(preValue, newValue)) {
                         newValue = accessor.$vmodel = updateVModel(realAccessor, newValue, valueType)
                         var fn = rebindings[newValue.$id]
                         fn && fn() 
                         var parent = watchProperties.vmodel
                         model[name] = newValue.$model
                         notifySubscribers(realAccessor) 
                         safeFire(parent, name, model[name], preValue) 
                     }
                 }
                 else {
                     collectSubscribers(realAccessor) 
                     return realAccessor
                 }
             }
             accessor.$vmodel = val.$model ? val : modelFactory(val, val)
             model[name] = accessor.$vmodel.$model
         }
         else {
             accessor = function (newValue) {
                 var preValue = model[name]
                 if (arguments.length) {
                     if (!isEqual(preValue, newValue)) {
                         model[name] = newValue
                         var vmodel = watchProperties.vmodel
                         withProxyCount && updateWithProxy(vmodel.$id, name, newValue) 
                         notifySubscribers(accessor) 
                         safeFire(vmodel, name, newValue, preValue) 
                     }
                 }
                 else {
                     collectSubscribers(accessor) 
                     return preValue
                 }
             }
             model[name] = val
         }
         accessor[subscribers] = [] 
         accessingProperties[name] = accessor
     }
     var withProxyPool = {}
     var withProxyCount = 0
     var rebindings = {}

     function updateWithProxy($id, name, val) {
         var pool = withProxyPool[$id]
         if (pool && pool[name]) {
             pool[name].$val = val
         }
     }

     function updateVModel(a, b, valueType) {
         if (valueType === "array") {
             if (!Array.isArray(b)) {
                 return a
             }
             var bb = b.concat()
             a.clear()
             a.push.apply(a, bb)
             return a
         }
         else {
             var iterators = a[subscribers] || []
             if (withProxyPool[a.$id]) {
                 withProxyCount--;
                 delete withProxyPool[a.$id]
             }
             var ret = modelFactory(b)
             rebindings[ret.$id] = function (data) {
                 while (data = iterators.shift()) {
                     (function (el) {
                         if (el.type) {
                             cvvm.nextTick(function () {
                                 el.rollback && el.rollback()//reduction ct-with ct-on
                                 bindingHandlers[el.type](el, el.vmodels)
                             })
                         }
                     })(data)
                 }
                 delete rebindings[ret.$id]
             }
             return ret
         }
     }

     /////////////////////////////////////////////////////////
     var keywords = "break,case,catch,continue,debugger,default,delete,do,else,false" + ",finally,for,function,if,in,instanceof,new,null,return,switch,this" + ",throw,true,try,typeof,var,void,while,with" + ",abstract,boolean,byte,char,class,const,double,enum,export,extends" + ",final,float,goto,implements,import,int,interface,long,native" + ",package,private,protected,public,short,static,super,synchronized" + ",throws,transient,volatile"
     // ECMA 5 - use strict
         + ",arguments,let,yield" + ",undefined"
     var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
     var rsplit = /[^\w$]+/g
     var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
     var rnumber = /\b\d[^,]*/g
     var rcomma = /^,+|,+$/g
     var cacheVars = createCache(512)
     var getVariables = function (code) {
         code = "," + code.trim()
         if (cacheVars[code]) {
             return cacheVars[code]
         }
         var match = code.replace(rrexpstr, "").replace(rsplit, ",").replace(rkeywords, "").replace(rnumber, "").replace(rcomma, "").split(/^$|,+/)
         var vars = [], unique = {}
         for (var i = 0; i < match.length; ++i) {
             var variable = match[i]
             if (!unique[variable]) {
                 unique[variable] = vars.push(variable)
             }
         }
         return cacheVars(code, vars)
     }

     var cacheExpr = createCache(256)
     function createCache(maxLength) {
         var keys = []
         function cache(key, value) {
             if (keys.push(key) > maxLength) {
                 delete cache[keys.shift()]
             }
             return cache[key] = value;
         }
         return cache;
     }

     function uniqVmodels(arr) {
         var uniq = {}
         return arr.filter(function (el) {
             if (!uniq[el.$id]) {
                 uniq[el.$id] = 1
                 return true
             }
         })
     }

     function addAssign(vars, scope, name, duplex) {
         var ret = [], prefix = " = " + name + "."
         for (var i = vars.length, prop; prop = vars[--i]; ) {
             if (scope.hasOwnProperty && scope.hasOwnProperty(prop)) {
                 //no hasOwnProperty in IE6
                 ret.push(prop + prefix + prop)
                 if (duplex === "duplex") {
                     vars.get = name + "." + prop
                 }
                 vars.splice(i, 1)
             }
         }
         return ret
     }

     var rduplex = /\w\[.*\]|\w\.\w/;
     var rproxy = /(\$proxy\$[a-z]+)\d+$/;
     function parseExpr(code, scopes, data, four) {
         var dataType = data.type
         var filters = dataType == "html" || dataType === "text" ? data.filters : ""
         var exprId = scopes.map(function (el) {
             return el.$id.replace(rproxy, "$1")
         }) + code + dataType + filters
         var vars = getVariables(code).concat(), assigns = [], names = [], args = [], prefix = ""
         scopes = uniqVmodels(scopes)
         for (var i = 0, sn = scopes.length; i < sn; i++) {
             if (vars.length) {
                 var name = "vm" + expose + "_" + i
                 names.push(name)
                 args.push(scopes[i])
                 assigns.push.apply(assigns, addAssign(vars, scopes[i], name, four))
             }
         }
         if (!assigns.length && four === "duplex") {
             return
         }
         //---------------args----------------
         if (filters) {
             args.push(cvvm.filters)
         }
         data.args = args
         //---------------cache----------------
         var fn = cacheExpr[exprId] 
         if (fn) {
             data.evaluator = fn
             return
         }
         var prefix = assigns.join(", ")
         if (prefix) {
             prefix = "var " + prefix
         }
         if (filters) {
             code = "\nvar ret" + expose + " = " + code
             var textBuffer = [], fargs
             textBuffer.push(code, "\r\n")
             for (var i = 0, fname; fname = data.filters[i++]; ) {
                 var start = fname.indexOf("(")
                 if (start !== -1) {
                     fargs = fname.slice(start + 1, fname.lastIndexOf(")")).trim()
                     fargs = "," + fargs
                     fname = fname.slice(0, start).trim()
                 }
                 else {
                     fargs = ""
                 }
                 textBuffer.push(" if(filters", expose, ".", fname, "){\n\ttry{\nret", expose, " = filters", expose, ".", fname, "(ret", expose, fargs, ")\n\t}catch(e){} \n}\n")
             }
             code = textBuffer.join("")
             code += "\nreturn ret" + expose
             names.push("filters" + expose)
         }
         else if (dataType === "duplex") {
             var _body = "'use strict';\nreturn function(vvv){\n\t" + prefix + ";\n\tif(!arguments.length){\n\t\treturn " + code + "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) + "= vvv;\n} "
             try {
                 fn = Function.apply(noop, names.concat(_body))
                 data.evaluator = cacheExpr(exprId, fn)
             }
             catch (e) {
                 log("debug: parse error," + e.message)
             }
             return
         }
         else if (dataType === "on") {
             code = code.replace("(", ".call(this,")
             if (four === "$event") {
                 names.push(four)
             }
             code = "\nreturn " + code + ";"
             var lastIndex = code.lastIndexOf("\nreturn")
             var header = code.slice(0, lastIndex)
             var footer = code.slice(lastIndex)
             code = header + "\nif(cvvm.openComputedCollect) return ;" + footer
         }
         else {
             code = "\nreturn " + code + ";"
         }
         try {
             fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
             data.evaluator = cacheExpr(exprId, fn)
         }
         catch (e) {
             log("debug: parse error," + e.message)
         }
         finally {
             vars = textBuffer = names = null
         }
     }

     function parseExprProxy(code, scopes, data, tokens) {
         if (Array.isArray(tokens)) {
             var array = tokens.map(function (token) {
                 var tmpl = {}
                 return token.expr ? parseExpr(token.value, scopes, tmpl) || tmpl : token.value
             })
             data.evaluator = function () {
                 var ret = ""
                 for (var i = 0, el; el = array[i++]; ) {
                     ret += typeof el === "string" ? el : el.evaluator.apply(0, el.args)
                 }
                 return ret
             }
             data.args = []
         }
         else {
             parseExpr(code, scopes, data, tokens)
         }
         if (data.evaluator) {
             data.handler = bindingExecutors[data.handlerName || data.type]
             data.evaluator.toString = function () {
                 return data.type + " binding to eval(" + code + ")"
             }
             registerSubscriber(data)
         }
     }

     //============ each/repeat/with binding Tools ======================
     var queryComments = DOC.createTreeWalker ? function (parent) {
         var tw = DOC.createTreeWalker(parent, NodeFilter.SHOW_COMMENT, null, null), comment,
            ret = []
         while (comment = tw.nextNode()) {
             ret.push(comment)
         }
         return ret
     } : function (parent) {
         return parent.getElementsByTagName("!")
     }

     function expelFromSanctuary(parent) {
         var comments = queryComments(parent)
         for (var i = 0, comment; comment = comments[i++]; ) {
             if (comment.nodeValue == "ct-if") {
                 cinerator.appendChild(comment.elem)
             }
         }
         while (comment = parent.firstChild) {
             cinerator.appendChild(comment)
         }
         cinerator.innerHTML = ""
     }

     function iteratorCallback(args) {
         var callback = getBindingCallback(this.callbackElement, this.callbackName, this.vmodels)
         if (callback) {
             var parent = this.parent
             checkScan(parent, function () {
                 callback.apply(parent, args)
             })
         }
     }

     function shimController(data, transation, spans, proxy) {
         var tview = data.template.cloneNode(true)
         var id = proxy.$id
         var span = tview.firstChild
         if (!data.fastRepeat) {
             span = DOC.createElement("msloop")
             span.style.display = "none"
             span.appendChild(tview)
         }
         span.setAttribute("ct-controller", id)
         spans.push(span)
         transation.appendChild(span)
         proxy.$outer = data.$outer
         VMODELS[id] = proxy
         function fn() {
             delete VMODELS[id]
             data.group = 1
             if (!data.fastRepeat) {
                 data.group = span.childNodes.length
                 span.parentNode.removeChild(span)
                 while (span.firstChild) {
                     transation.appendChild(span.firstChild)
                 }
                 if (fn.node !== void 0) {
                     fn.parent.insertBefore(transation, fn.node)
                 }
             }
         }
         return span.patchRepeat = fn
     }


     function getLocatedNode(parent, data, pos) {
         if (data.startRepeat) {
             var ret = data.startRepeat, end = data.endRepeat
             pos += 1
             for (var i = 0; i < pos; i++) {
                 ret = ret.nextSibling
                 if (ret == end)
                     return end
             }
             return ret
         }
         else {
             return parent.childNodes[data.group * pos] || null
         }
     }

     function removeView(node, group, n) {
         var length = group * (n || 1)
         var view = hyperspace
         //.cloneNode(false)//???
         while (--length >= 0) {
             var nextSibling = node.nextSibling
             view.appendChild(node)
             node = nextSibling
             if (!node) {
                 break
             }
         }
         return view
     }
     // create proxy（$index,$first,$last,$remove,$key,$val,$outer） for ct-each, ct-repeat
     var watchEachOne = oneObject("$index,$first,$last")
     function createWithProxy(key, val, $outer) {
         var proxy = modelFactory({
             $key: key,
             $outer: $outer,
             $val: val
         }, 0,
            {
                $val: 1,
                $key: 1
            })
         proxy.$id = "$proxy$with" + Math.random()
         return proxy
     }
     var eachProxyPool = []
     function getEachProxy(index, item, data, last) {
         var param = data.param || "el", proxy
         var source =
            {
                $remove: function () {
                    return data.getter().removeAt(proxy.$index)
                },
                $itemName: param,
                $index: index,
                $outer: data.$outer,
                $first: index === 0,
                $last: index === last
            }
         source[param] = item
         for (var i = 0, n = eachProxyPool.length; i < n; i++) {
             var proxy = eachProxyPool[i]
             if (proxy.hasOwnProperty(param)) {
                 for (var i in source) {
                     proxy[i] = source[i]
                 }
                 eachProxyPool.splice(i, 1)
                 return proxy
             }
         }
         if (rcomplexType.test(cvvm.type(item))) {
             source.$skipArray = [param]
         }
         proxy = modelFactory(source, 0, watchEachOne)
         proxy.$id = "$proxy$" + data.type + Math.random()
         return proxy
     }
     function recycleEachProxy(proxy) {
         var obj = proxy.$accessors, name = proxy.$itemName; ["$index", "$last", "$first"].forEach(function (prop) {
             obj[prop][subscribers].length = 0
         })
         if (proxy[name][subscribers]) {
             proxy[name][subscribers].length = 0;
         }
     }

     /*********************************************************************
     *                           scan                                 *
     **********************************************************************/
     var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea".toUpperCase())
     var interval = W3C ? 15 : 50
     function checkScan(elem, callback) {
         var innerHTML = NaN, id = setInterval(function () {
             var currHTML = elem.innerHTML
             if (currHTML === innerHTML) {
                 clearInterval(id)
                 callback()
             }
             else {
                 innerHTML = currHTML
             }
         }, interval)
     }

     function scanTag(elem, vmodels, node) {
         // ct-skip(0) --> ct-important(1) --> ct-controller(2) --> ct-if(10) --> ct-repeat(100) 
         //--> ct-if-loop(110) --> ct-attr(970) ...--> ct-each(1400)-->ct-with(1500)--〉ct-duplex(2000)
         var a = elem.getAttribute(prefix + "skip")
         if (!elem.getAttributeNode) {
             return log("warning " + elem.tagName + " no getAttributeNode method")
         }
         var b = elem.getAttributeNode(prefix + "important")
         var c = elem.getAttributeNode(prefix + "controller")
         if (typeof a === "string") {
             return
         }
         else if (node = b || c) {
             var newVmodel = VMODELS[node.value]
             if (!newVmodel) {
                 return
             }
             vmodels = node === b ? [newVmodel] : [newVmodel].concat(vmodels)
             elem.removeAttribute(node.name)
             $(elem).removeClass(node.name)
         }
         scanAttr(elem, vmodels)
     }

     function scanNodes(parent, vmodels) {
         var node = parent.firstChild
         while (node) {
             var nextNode = node.nextSibling
             var nodeType = node.nodeType
             if (nodeType === 1) {
                 scanTag(node, vmodels) 
             }
             else if (nodeType === 3 && rexpr.test(node.data)) {
                 scanText(node, vmodels) 
             }
             node = nextNode
         }
     }

     function scanText(textNode, vmodels) {
         var bindings = []
         if (textNode.nodeType === 8) {
             var leach = []
             var value = trimFilter(textNode.nodeValue, leach)
             var token =
                {
                    expr: true,
                    value: value
                }
             if (leach.length) {
                 token.filters = leach
             }
             var tokens = [token]
         }
         else {
             tokens = scanExpr(textNode.data)
         }
         if (tokens.length) {
             for (var i = 0, token; token = tokens[i++]; ) {
                 var node = DOC.createTextNode(token.value) 
                 if (token.expr) {
                     var filters = token.filters
                     var binding =
                        {
                            type: "text",
                            node: node,
                            nodeType: 3,
                            value: token.value,
                            filters: filters
                        }
                     if (filters && filters.indexOf("html") !== -1) {
                         cvvm.Array.remove(filters, "html")
                         binding.type = "html"
                         binding.replaceNodes = [node]
                         if (!filters.length) {
                             delete bindings.filters
                         }
                     }
                     bindings.push(binding) 
                 }
                 hyperspace.appendChild(node)
             }
             textNode.parentNode.replaceChild(hyperspace, textNode)
             if (bindings.length)
                 executeBindings(bindings, vmodels)
         }
     }

     var rmsAttr = /ct-(\w+)-?(.*)/;
     var priorityMap =
        {
            "if": 10,
            "repeat": 90,
            "widget": 110,
            "each": 1400,
            "with": 1500,
            "duplex": 2000,
            "on": 3000
        }

     function resetNumber(a, n, end) {
         if ((a === +a) && !(a % 1)) {
             if (a < 0) {
                 a = a * -1 >= n ? 0 : a + n
             }
             else {
                 a = a > n ? n : a
             }
         }
         else {
             a = end ? n : 0
         }
         return a
     }

     function oneObject(array, val) {
         if (typeof array === "string") {
             array = array.match(rword) || []
         }
         var result = {}, value = val !== void 0 ? val : 1
         for (var i = 0, n = array.length; i < n; i++) {
             result[array[i]] = value
         }
         return result
     }

     var ons = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scroll")
     function scanAttr(elem, vmodels) {
         var attributes = getAttributes ? getAttributes(elem) : elem.attributes
         var bindings = [], msData = {}, match
         for (var i = 0, attr; attr = attributes[i++]; ) {
             if (attr.specified) {
                 if (match = attr.name.match(rmsAttr)) {
                     var type = match[1]
                     var param = match[2] || ""
                     msData[attr.name] = attr.value
                     if (ons[type]) {
                         param = type
                         type = "on"
                     }
                     if (typeof bindingHandlers[type] === "function") {
                         var binding =
                            {
                                type: type,
                                param: param,
                                element: elem,
                                name: match[0],
                                value: attr.value,
                                priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
                            }
                         if (type === "if" && param.indexOf("loop") > -1) {
                             binding.priority += 100
                         }
                         if (vmodels.length) {
                             bindings.push(binding)
                             if (type === "widget") {
                                 elem.msData = elem.msData || msData
                             }
                         }
                     }
                 }
             }
         }
         bindings.sort(function (a, b) {
             return a.priority - b.priority
         })
         if (msData["ct-checked"] && msData["ct-duplex"]) {
             log("warning: ct-checked and ct-duplex could't exist together !")
         }
         var firstBinding = bindings[0] || {}
         switch (firstBinding.type) {
             case "if":
             case "repeat":
             case "widget":
                 executeBindings([firstBinding], vmodels)
                 break
             default:
                 executeBindings(bindings, vmodels)
                 if (!stopScan[elem.tagName] && rbind.test(elem.innerHTML.replace(rlt, "<").replace(rgt, ">"))) {
                     scanNodes(elem, vmodels) 
                 }
                 break;
         }

         if (elem.patchRepeat) {
             elem.patchRepeat()
             elem.patchRepeat = null
         }

     }
     if (!"1"[0]) {
         var cacheAttr = createCache(512)
         var rattrs = /\s+(ct-[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g, rquote = /^['"]/, rtag = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/i, ramp = /&/g
         var getAttributes = function (elem) {
             if (elem.outerHTML.slice(0, 2) === "</") {
                 return []
             }
             var str = elem.outerHTML.match(rtag)[0]
             var attributes = [], match,
                k,
                v;
             if (cacheAttr[str]) {
                 return cacheAttr[str]
             }
             while (k = rattrs.exec(str)) {
                 v = k[2]
                 if (v) {
                     v = (rquote.test(v) ? v.slice(1, -1) : v).replace(ramp, "&")
                 }
                 var name = k[1].toLowerCase()
                 match = name.match(rmsAttr)
                 var binding =
                    {
                        name: name,
                        specified: true,
                        value: v || ""
                    }
                 attributes.push(binding)
             }
             return cacheAttr(str, attributes)
         }
     }

     function executeBindings(bindings, vmodels) {
         for (var i = 0, data; data = bindings[i++]; ) {
             data.vmodels = vmodels
             bindingHandlers[data.type](data, vmodels)
             if (data.evaluator && data.name) {
                 data.element.removeAttribute(data.name)
             }
         }
         bindings.length = 0
     }


     var rfilters = /\|\s*(\w+)\s*(\([^)]*\))?/g, r11a = /\|\|/g, r11b = /U2hvcnRDaXJjdWl0/g, rlt = /</g, rgt = />/g
     function trimFilter(value, leach) {
         if (value.indexOf("|") > 0) {
             value = value.replace(r11a, "U2hvcnRDaXJjdWl0")//btoa("ShortCircuit")
             value = value.replace(rfilters, function (c, d, e) {
                 leach.push(d + (e || ""))
                 return ""
             })
             value = value.replace(r11b, "||") 
         }
         return value
     }

     function scanExpr(str) {
         var tokens = [], value,
            start = 0, stop
         do {
             stop = str.indexOf(openTag, start)
             if (stop === -1) {
                 break
             }
             value = str.slice(start, stop)
             if (value) {
                 // {{  
                 tokens.push({
                     value: value,
                     expr: false
                 })
             }
             start = stop + openTag.length
             stop = str.indexOf(closeTag, start)
             if (stop === -1) {
                 break
             }
             value = str.slice(start, stop)
             if (value) {
                 //{{ }}
                 var leach = []
                 value = trimFilter(value, leach)
                 tokens.push({
                     value: value,
                     expr: true,
                     filters: leach.length ? leach : void 0
                 })
             }
             start = stop + closeTag.length
         }
         while (1)
         value = str.slice(start)
         if (value) {
             //}}  
             tokens.push({
                 value: value,
                 expr: false
             })
         }

         return tokens
     }

     /*********************************************************************
     *                      binding Model               *                                 *
     **********************************************************************/
     var cacheDisplay = oneObject("a,abbr,b,span,strong,em,font,i,kbd", "inline")
     $.extend(cacheDisplay, oneObject("div,h1,h2,h3,h4,h5,h6,section,p", "block"))
     function parseDisplay(nodeName, val) {
         nodeName = nodeName.toLowerCase()
         if (!cacheDisplay[nodeName]) {
             var node = DOC.createElement(nodeName)
             root.appendChild(node)
             if (W3C) {
                 val = getComputedStyle(node, null).display
             }
             else {
                 val = node.currentStyle.display
             }
             root.removeChild(node)
             cacheDisplay[nodeName] = val
         }
         return cacheDisplay[nodeName]
     }
     cvvm.parseDisplay = parseDisplay
     var supportDisplay = (function (td) {
         return W3C ? getComputedStyle(td, null).display === "table-cell" : true
     })(DOC.createElement("td"))
     var propMap =
        {
            "accept-charset": "acceptCharset",
            "char": "ch",
            "charoff": "chOff",
            "class": "className",
            "for": "htmlFor",
            "http-equiv": "httpEquiv"
        }
     var anomaly = "accessKey,allowTransparency,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan,contentEditable," + "dateTime,defaultChecked,defaultSelected,defaultValue,frameBorder,isMap,longDesc,maxLength,marginWidth,marginHeight," + "noHref,noResize,noShade,readOnly,rowSpan,tabIndex,useMap,vSpace,valueType,vAlign"
     anomaly.replace(rword, function (name) {
         propMap[name.toLowerCase()] = name
     })
     var rdash = /\(([^)]*)\)/;
     var cssText = "<style id='avalonStyle'>.avalonHide{ display: none!important }</style>"
     var rnoscripts = /<noscript.*?>(?:[\s\S]+?)<\/noscript>/img
     var rnoscriptText = /<noscript.*?>([\s\S]+?)<\/noscript>/im
     var getXHR = function () {
         return new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP")
     }
     var getBindingCallback = function (elem, name, vmodels) {
         var callback = elem.getAttribute(name)
         if (callback) {
             for (var i = 0, vm; vm = vmodels[i++]; ) {
                 if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                     return vm[callback]
                 }
             }
         }
     }
     var includeContents = {}
     var ifSanctuary = DOC.createElement("div")
     ifSanctuary.innerHTML = "a"
     try {
         ifSanctuary.contains(ifSanctuary.firstChild)
         cvvm.contains = function (a, b) {
             return a.contains(b)
         }
     }
     catch (e) {
         cvvm.contains = fixContains
     }

     var bindingExecutors = cvvm.bindingExecutors =
        {
            "attr": function (val, elem, data) {
                var method = data.type, attrName = data.param
                if (method === "css") {
                    cvvm(elem).css(attrName, val)
                }
                else if (method === "attr") {
                    var toRemove = (val === false) || (val === null) || (val === void 0)
                    if (toRemove) {
                        elem.removeAttribute(attrName)
                    }
                    else if (!W3C) {
                        attrName = propMap[attrName] || attrName
                        if (toRemove) {
                            elem.removeAttribute(attrName)
                        }
                        else {
                            elem[attrName] = val
                        }
                    }
                    else if (!toRemove) {
                        elem.setAttribute(attrName, val)
                    }
                }
                else if (method === "include" && val) {
                    var vmodels = data.vmodels
                    var rendered = getBindingCallback(elem, "data-include-rendered", vmodels)
                    var loaded = getBindingCallback(elem, "data-include-loaded", vmodels)
                    function scanTemplate(text) {
                        if (loaded) {
                            text = loaded.apply(elem, [text].concat(vmodels))
                        }
                        cvvm.innerHTML(elem, text)
                        scanNodes(elem, vmodels)
                        rendered && checkScan(elem, function () {
                            rendered.call(elem)
                        })
                    }
                    if (data.param === "src") {
                        if (includeContents[val]) {
                            scanTemplate(includeContents[val])
                        }
                        else {
                            var xhr = getXHR()
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4) {
                                    var s = xhr.status
                                    if (s >= 200 && s < 300 || s === 304 || s === 1223) {
                                        scanTemplate(includeContents[val] = xhr.responseText)
                                    }
                                }
                            }
                            xhr.open("GET", val, true)
                            if ("withCredentials"
                            in xhr) {
                                xhr.withCredentials = true
                            }
                            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                            xhr.send(null)
                        }
                    }
                    else {
                        var el = val && val.nodeType == 1 ? val : DOC.getElementById(val)
                        if (el) {
                            if (el.tagName === "NOSCRIPT" && !(el.innerHTML || el.fixIE78)) {
                                var xhr = getXHR() 
                                xhr.open("GET", location, false) 
                                xhr.send(null)
                                var noscripts = DOC.getElementsByTagName("noscript")
                                var array = (xhr.responseText || "").match(rnoscripts) || []
                                var n = array.length
                                for (var i = 0; i < n; i++) {
                                    var tag = noscripts[i]
                                    if (tag) {
                                        tag.style.display = "none"
                                        tag.fixIE78 = (array[i].match(rnoscriptText) || ["", " "])[1]
                                    }
                                }
                            }
                            cvvm.nextTick(function () {
                                scanTemplate(el.fixIE78 || el.innerText || el.innerHTML)
                            })
                        }
                    }
                }
                else {
                    if (!root.hasAttribute && typeof val === "string" && (method === "src" || method === "href")) {
                        val = val.replace(/&/g, "&") 
                    }
                    elem[method] = val
                }
            },
            "class": function (val, elem, data) {
                var $elem = cvvm(elem), method = data.type
                if (method === "class" && data.param) {
                    $elem.toggleClass(data.param, !!val)
                }
                else {
                    var toggle = data._evaluator ? !!data._evaluator.apply(elem, data._args) : true
                    var className = data._class || val
                    switch (method) {
                        case "class":
                            if (toggle && data.oldClass) {
                                $elem.removeClass(data.oldClass)
                            }
                            $elem.toggleClass(className, toggle)
                            data.oldClass = className
                            break;
                        case "hover":
                        case "active":
                            if (!data.init) {
                                if (method === "hover") {
                                    var event1 = "mouseenter", event2 = "mouseleave"
                                }
                                else {
                                    elem.tabIndex = elem.tabIndex || -1
                                    event1 = "mousedown", event2 = "mouseup"
                                    $elem.bind("mouseleave", function () {
                                        toggle && $elem.removeClass(className)
                                    })
                                }
                                $elem.bind(event1, function () {
                                    toggle && $elem.addClass(className)
                                })
                                $elem.bind(event2, function () {
                                    toggle && $elem.removeClass(className)
                                })
                                data.init = 1
                            }
                            break;
                    }
                }
            },
            "data": function (val, elem, data) {
                var key = "data-" + data.param
                if (val && typeof val === "object") {
                    elem[key] = val
                }
                else {
                    elem.setAttribute(key, String(val))
                }
            },
            "checked": function (val, elem, data) {
                var name = data.type;
                if (name === "enabled") {
                    elem.disabled = !val
                }
                else {
                    var propName = name === "readonly" ? "readOnly" : name
                    elem[propName] = !!val
                }
            },
            "repeat": function (method, pos, el) {
                if (method) {
                    var data = this
                    var group = data.group
                    var pp = data.startRepeat && data.startRepeat.parentNode
                    if (pp) {
                        //fix  #300 #307
                        data.parent = pp
                    }
                    var parent = data.parent
                    var proxies = data.proxies
                    var transation = hyperspace.cloneNode(false)
                    if (method === "del" || method === "move") {
                        var locatedNode = getLocatedNode(parent, data, pos)
                    }
                    switch (method) {
                        case "add":
                            var arr = el
                            var last = data.getter().length - 1
                            var spans = []
                            var lastFn = {}
                            for (var i = 0, n = arr.length; i < n; i++) {
                                var ii = i + pos
                                var proxy = getEachProxy(ii, arr[i], data, last)
                                proxies.splice(ii, 0, proxy)
                                lastFn = shimController(data, transation, spans, proxy)
                            }
                            locatedNode = getLocatedNode(parent, data, pos)
                            lastFn.node = locatedNode
                            lastFn.parent = parent
                            parent.insertBefore(transation, locatedNode)
                            for (var i = 0, node; node = spans[i++]; ) {
                                scanTag(node, data.vmodels)
                            }
                            spans = null
                            break
                        case "del":
                            var removed = proxies.splice(pos, el)
                            for (var i = 0, proxy; proxy = removed[i++]; ) {
                                recycleEachProxy(proxy)
                            }
                            expelFromSanctuary(removeView(locatedNode, group, el))
                            break
                        case "index":
                            var last = proxies.length - 1
                            for (; el = proxies[pos]; pos++) {
                                el.$index = pos
                                el.$first = pos === 0
                                el.$last = pos === last
                            }
                            break
                        case "clear":
                            if (data.startRepeat) {
                                while (true) {
                                    var node = data.startRepeat.nextSibling
                                    if (node && node !== data.endRepeat) {
                                        transation.appendChild(node)
                                    }
                                    else {
                                        break
                                    }
                                }
                            }
                            else {
                                transation = parent
                            }
                            expelFromSanctuary(transation)
                            proxies.length = 0
                            break
                        case "move":
                            var t = proxies.splice(pos, 1)[0]
                            if (t) {
                                proxies.splice(el, 0, t)
                                transation = removeView(locatedNode, group)
                                locatedNode = getLocatedNode(parent, data, el)
                                parent.insertBefore(transation, locatedNode)
                            }
                            break
                        case "set":
                            var proxy = proxies[pos]
                            if (proxy) {
                                proxy[proxy.$itemName] = el
                            }
                            break
                        case "append":
                            var pool = el
                            var callback = getBindingCallback(data.callbackElement, "data-with-sorted", data.vmodels)
                            var keys = []
                            var spans = []
                            var lastFn = {}
                            for (var key in pos) {
                                if (pos.hasOwnProperty(key) && key !== "hasOwnProperty") {
                                    keys.push(key)
                                }
                            }
                            if (callback) {
                                var keys2 = callback.call(parent, keys)
                                if (keys2 && Array.isArray(keys2) && keys2.length) {
                                    keys = keys2
                                }
                            }
                            for (var i = 0, key; key = keys[i++]; ) {
                                if (key !== "hasOwnProperty") {
                                    lastFn = shimController(data, transation, spans, pool[key])
                                }
                            }
                            lastFn.parent = parent
                            lastFn.node = data.endRepeat || null
                            parent.insertBefore(transation, lastFn.node)
                            for (var i = 0, el; el = spans[i++]; ) {
                                scanTag(el, data.vmodels)
                            }
                            spans = null
                            break
                    }
                    iteratorCallback.call(data, arguments)
                }
            },
            "html": function (val, elem, data) {
                val = val == null ? "" : val
                if (!elem) {
                    elem = data.element = data.node.parentNode
                }
                if (data.replaceNodes) {
                    var fragment,
                    nodes
                    if (val.nodeType === 11) {
                        fragment = val
                    }
                    else if (val.nodeType === 1 || val.item) {
                        nodes = val.nodeType === 1 ? val.childNodes : val.item ? val : []
                        fragment = hyperspace.cloneNode(true)
                        while (nodes[0]) {
                            fragment.appendChild(nodes[0])
                        }
                    }
                    else {
                        fragment = cvvm.parseHTML(val)
                    }
                    var replaceNodes = cvvm.slice(fragment.childNodes)
                    elem.insertBefore(fragment, data.replaceNodes[0] || null)//fix IE6-8 insertBefore 
                    for (var i = 0, node; node = data.replaceNodes[i++]; ) {
                        elem.removeChild(node)
                    }
                    data.replaceNodes = replaceNodes
                }
                else {
                    cvvm.innerHTML(elem, val)
                }
                cvvm.nextTick(function () {
                    scanNodes(elem, data.vmodels)
                })
            },
            "if": function (val, elem, data) {
                var placehoder = data.placehoder
                if (val) {
                    if (!data.msInDocument) {
                        data.msInDocument = true
                        try {
                            placehoder.parentNode.replaceChild(elem, placehoder)
                        }
                        catch (e) {
                            log("debug: ct-if  " + e.message)
                        }
                    }
                    if (rbind.test(elem.outerHTML.replace(rlt, "<").replace(rgt, ">"))) {
                        scanAttr(elem, data.vmodels)
                    }
                }
                else {
                    if (data.msInDocument) {
                        data.msInDocument = false
                        elem.parentNode.replaceChild(placehoder, elem)
                        placehoder.elem = elem
                        ifSanctuary.appendChild(elem)
                    }
                }
            },
            "on": function (callback, elem, data) {
                var fn = data.evaluator
                var args = data.args
                var vmodels = data.vmodels
                if (!data.hasArgs) {
                    callback = function (e) {
                        return fn.apply(0, args).call(this, e)
                    }
                }
                else {
                    callback = function (e) {
                        return fn.apply(this, args.concat(e))
                    }
                }
                elem.$vmodel = vmodels[0]
                elem.$vmodels = vmodels
                data.param = data.param.replace(/-\d+$/, "")// ct-on-mousemove-10
                if (typeof data.specialBind === "function") {
                    data.specialBind(elem, callback)
                }
                else {
                    var removeFn = cvvm.bind(elem, data.param, callback)
                }
                data.rollback = function () {
                    if (typeof data.specialUnbind === "function") {
                        data.specialUnbind()
                    }
                    else {
                        cvvm.unbind(elem, data.param, removeFn)
                    }
                }
                data.evaluator = data.handler = noop
            },
            "text": function (val, elem, data) {
                val = val == null ? "" : val
                var node = data.node
                if (data.nodeType === 3) {
                    if (node && node.parentNode) {
                        node.data = val
                    }
                }
                else {
                    if (!elem) {
                        elem = data.element = node.parentNode
                    }
                    if ("textContent"
                    in elem) {
                        elem.textContent = val
                    }
                    else {
                        elem.innerText = val
                    }
                }
            },
            "visible": function (val, elem, data) {
                elem.style.display = val ? data.display : "none"
            },
            "widget": noop
        }
     var rwhitespace = /^\s+$/
     var bindingHandlers = cvvm.bindingHandlers =
        {
            "attr": function (data, vmodels) {
                var text = data.value.trim(), simple = true
                if (text.indexOf(openTag) > -1 && text.indexOf(closeTag) > 2) {
                    simple = false
                    if (rexpr.test(text) && RegExp.rightContext === "" && RegExp.leftContext === "") {
                        simple = true
                        text = RegExp.$1
                    }
                }
                data.handlerName = "attr"
                parseExprProxy(text, vmodels, data, (simple ? null : scanExpr(data.value)))
            },
            "checked": function (data, vmodels) {
                data.handlerName = "checked"
                parseExprProxy(data.value, vmodels, data)
            },
            "class": function (data, vmodels) {
                var oldStyle = data.param, text = data.value, rightExpr
                data.handlerName = "class"
                if (!oldStyle || isFinite(oldStyle)) {
                    data.param = ""
                    var noExpr = text.replace(rexprg, function (a) {
                        return Math.pow(10, a.length - 1) 
                    })
                    var colonIndex = noExpr.indexOf(":") 
                    if (colonIndex === -1) {
                        //  
                        var className = text
                    }
                    else {
                        //  
                        className = text.slice(0, colonIndex)
                        rightExpr = text.slice(colonIndex + 1)
                        parseExpr(rightExpr, vmodels, data) 
                        if (!data.evaluator) {
                            log("debug: ct-class '" + (rightExpr || "").trim() + "' doesn't exist in VM")
                            return false
                        }
                        else {
                            data._evaluator = data.evaluator
                            data._args = data.args
                        }
                    }
                    var hasExpr = rexpr.test(className) 
                    if (!hasExpr) {
                        data._class = className
                    }
                    parseExprProxy("", vmodels, data, (hasExpr ? scanExpr(className) : null))
                }
                else if (data.type === "class") {
                    parseExprProxy(text, vmodels, data)
                }
            },
            "duplex": function (data, vmodels) {
                var elem = data.element, tagName = elem.tagName
                if (typeof duplexBinding[tagName] === "function") {
                    data.changed = getBindingCallback(elem, "data-duplex-changed", vmodels) || noop
                    parseExpr(data.value, vmodels, data, "duplex")
                    if (data.evaluator && data.args) {
                        var form = elem.form
                        if (form && form.msValidate) {
                            form.msValidate(elem)
                        }
                        data.bound = function (type, callback) {
                            if (elem.addEventListener) {
                                elem.addEventListener(type, callback, false)
                            }
                            else {
                                elem.attachEvent("on" + type, callback)
                            }
                            var old = data.rollback
                            data.rollback = function () {
                                cvvm.unbind(elem, type, callback)
                                old && old()
                            }
                        }
                        duplexBinding[elem.tagName](elem, data.evaluator.apply(null, data.args), data)
                    }
                }
            },
            "repeat": function (data, vmodels) {
                var type = data.type, list
                parseExpr(data.value, vmodels, data)
                var elem = data.callbackElement = data.parent = data.element
                data.getter = function () {
                    return this.evaluator.apply(0, this.args || [])
                }
                data.proxies = []
                var freturn = true
                try {
                    list = data.getter()
                    var xtype = getType(list)
                    if (xtype == "object" || xtype == "array") {
                        freturn = false
                    }
                }
                catch (e) { }
                var template = hyperspace.cloneNode(false)
                if (type === "repeat") {
                    var startRepeat = DOC.createComment("ct-repeat-start")
                    var endRepeat = DOC.createComment("ct-repeat-end")
                    data.element = data.parent = elem.parentNode
                    data.startRepeat = startRepeat
                    data.endRepeat = endRepeat
                    elem.removeAttribute(data.name)
                    data.parent.replaceChild(endRepeat, elem)
                    data.parent.insertBefore(startRepeat, endRepeat)
                    template.appendChild(elem)
                }
                else {
                    var node
                    while (node = elem.firstChild) {
                        if (node.nodeType === 3 && rwhitespace.test(node.data)) {
                            elem.removeChild(node)
                        }
                        else {
                            template.appendChild(node)
                        }
                    }
                }
                data.template = template
                data.rollback = function () {
                    bindingExecutors.repeat.call(data, "clear")
                    var endRepeat = data.endRepeat
                    var parent = data.parent
                    parent.insertBefore(data.template, endRepeat || null)
                    if (endRepeat) {
                        parent.removeChild(endRepeat)
                        parent.removeChild(data.startRepeat)
                        data.element = data.callbackElement
                    }
                }
                var arr = data.value.split(".") || []
                if (arr.length > 1) {
                    arr.pop()
                    var n = arr[0]
                    for (var i = 0, v; v = vmodels[i++]; ) {
                        if (v && v.hasOwnProperty(n) && v[n][subscribers]) {
                            v[n][subscribers].push(data)
                            break
                        }
                    }
                }
                if (freturn) {
                    return
                }
                data.callbackName = "data-" + type + "-rendered"
                data.handler = bindingExecutors.repeat
                data.$outer = {}
                var check0 = "$key", check1 = "$val"
                if (Array.isArray(list)) {
                    check0 = "$first"
                    check1 = "$last"
                }
                for (var i = 0, p; p = vmodels[i++]; ) {
                    if (p.hasOwnProperty(check0) && p.hasOwnProperty(check1)) {
                        data.$outer = p
                        break
                    }
                }
                node = template.firstChild
                data.fastRepeat = !!node && node.nodeType === 1 && template.lastChild === node && !node.attributes["ct-controller"] && !node.attributes["ct-important"]
                list[subscribers] && list[subscribers].push(data)
                if (!Array.isArray(list) && type !== "each") {
                    var pool = withProxyPool[list.$id]
                    if (!pool) {
                        withProxyCount++;
                        pool = withProxyPool[list.$id] = {}
                        for (var key in list) {
                            if (list.hasOwnProperty(key) && key !== "hasOwnProperty") {
                                (function (k, v) {
                                    pool[k] = createWithProxy(k, v, {})
                                    pool[k].$watch("$val", function (val) {
                                        list[k] = val
                                        //#303
                                    })
                                })(key, list[key])
                            }
                        }
                    }
                    data.handler("append", list, pool)
                }
                else {
                    data.handler("add", 0, list)
                }
            },
            "html": function (data, vmodels) {
                parseExprProxy(data.value, vmodels, data)
            },
            "if": function (data, vmodels) {
                var elem = data.element
                elem.removeAttribute(data.name)
                if (!data.placehoder) {
                    data.msInDocument = data.placehoder = DOC.createComment("ct-if")
                }
                data.vmodels = vmodels
                parseExprProxy(data.value, vmodels, data)
            },
            "on": function (data, vmodels) {
                var value = data.value, four = "$event"
                if (value.indexOf("(") > 0 && value.indexOf(")") > -1) {
                    var matched = (value.match(rdash) || ["", ""])[1].trim()
                    if (matched === "" || matched === "$event") {
                        four = void 0
                        value = value.replace(rdash, "")
                    }
                }
                else {
                    four = void 0
                }
                data.hasArgs = four
                parseExprProxy(value, vmodels, data, four)
            },
            "visible": function (data, vmodels) {
                var elem = data.element
                if (!supportDisplay && !root.contains(elem)) {
                    //fuck firfox 全家！
                    var display = parseDisplay(elem.tagName)
                }
                display = display || cvvm(elem).css("display")
                data.display = display === "none" ? parseDisplay(elem.tagName) : display
                parseExprProxy(data.value, vmodels, data)
            },
            "widget": function (data, vmodels) {
                var args = data.value.match(rword)
                var elem = data.element
                var widget = args[0]
                if (args[1] === "$" || !args[1]) {
                    args[1] = widget + setTimeout("1")
                }
                data.value = args.join(",")
                var constructor = cvvm.ui[widget]
                if (typeof constructor === "function") {
                    //ct-widget="tabs,tabsAAA,optname"
                    vmodels = elem.vmodels || vmodels
                    var optName = args[2] || widget
                    for (var i = 0, v; v = vmodels[i++]; ) {
                        if (v.hasOwnProperty(optName) && typeof v[optName] === "object") {
                            var nearestVM = v
                            break
                        }
                    }
                    if (nearestVM) {
                        var vmOptions = nearestVM[optName]
                        vmOptions = vmOptions.$model || vmOptions
                        var id = vmOptions[widget + "Id"]
                        if (typeof id === "string") {
                            args[1] = id
                        }
                    }
                    var widgetData = cvvm.getWidgetData(elem, args[0]) 
                    data[widget + "Id"] = args[1]
                    data[widget + "Options"] = $.each({}, constructor.defaults, vmOptions || {}, widgetData)
                    elem.removeAttribute("ct-widget")
                    var vmodel = constructor(elem, data, vmodels) || {}
                    data.evaluator = noop
                    elem.msData["ct-widget-id"] = vmodel.$id || ""
                    if (vmodel.hasOwnProperty("$init")) {
                        vmodel.$init()
                    }
                    if (vmodel.hasOwnProperty("$remove")) {
                        var offTree = function () {
                            vmodel.$remove()
                            elem.msData = {}
                            delete VMODELS[vmodel.$id]
                        }
                        if (supportMutationEvents) {
                            elem.addEventListener("DOMNodeRemoved", function (e) {
                                if (e.target === this && !this.msRetain) {
                                    offTree()
                                }
                            })
                        }
                        else {
                            elem.offTree = offTree
                            launchImpl(elem)
                        }
                    }
                }
                else if (vmodels.length) {
                    elem.vmodels = vmodels
                }
            }
        }

     var supportMutationEvents = W3C && DOC.implementation.hasFeature("MutationEvents", "2.0")
     //============================ class preperty binding  =======================
     "hover,active".replace(rword, function (method) {
         bindingHandlers[method] = bindingHandlers["class"]
     });
     "with,each".replace(rword, function (name) {
         bindingHandlers[name] = bindingHandlers.repeat
     })
     //============================= boolean preperty binding =======================
     "disabled,enabled,readonly,selected".replace(rword, function (name) {
         bindingHandlers[name] = bindingHandlers.checked
     })
     bindingHandlers.data = bindingHandlers.text = bindingHandlers.html
     //============================= string preperty binding =======================
     "title,alt,src,value,css,include,href".replace(rword, function (name) {
         bindingHandlers[name] = bindingHandlers.attr
     })
     //============================= model binding =======================
     var duplexBinding = bindingHandlers.duplex
     duplexBinding.INPUT = function (element, evaluator, data) {
         var fixType = data.param, type = element.type, bound = data.bound, $elem = $(element), firstTigger = false, composing = false, callback = function (value) {
             firstTigger = true
             data.changed.call(this, value)
         },
            compositionStart = function () {
                composing = true
            },
            compositionEnd = function () {
                composing = false
            },
            updateVModel = function () {
                if (composing)
                    return
                var val = element.oldValue = element.value
                if ($elem.data("duplex-observe") !== false) {
                    evaluator(val)
                    callback.call(element, val)
                }
            }

         data.handler = function () {
             var val = evaluator()
             if (val !== element.value) {
                 element.value = val + ""
             }
         }

         if (type === "checkbox" && fixType === "radio") {
             type = "radio"
         }
         if (type === "radio") {
             data.handler = function () {
                 element.defaultChecked = (element.checked = /bool|text/.test(fixType) ? evaluator() + "" === element.value : !!evaluator())
             }
             updateVModel = function () {
                 if ($elem.data("duplex-observe") !== false) {
                     var val = element.value
                     if (fixType === "text") {
                         evaluator(val)
                     }
                     else if (fixType === "bool") {
                         val = val === "true"
                         evaluator(val)
                     }
                     else {
                         val = !element.defaultChecked
                         evaluator(val)
                         element.checked = val
                     }
                     callback.call(element, val)
                 }
             }
             bound(fixType ? "click" : "mousedown", updateVModel)
         }
         else if (type === "checkbox") {
             updateVModel = function () {
                 if ($elem.data("duplex-observe") !== false) {
                     var method = element.checked ? "ensure" : "remove"
                     var array = evaluator()
                     if (Array.isArray(array)) {
                         cvvm.Array[method](array, element.value)
                     }
                     else {
                         cvvm.error("ct-duplex位于checkbox时要求对应一个数组")
                     }
                     callback.call(element, array)
                 }
             }
             data.handler = function () {
                 var array = [].concat(evaluator())
                 element.checked = array.indexOf(element.value) >= 0
             }

             bound(W3C ? "change" : "click", updateVModel)
         }
         else {
             var event = element.attributes["data-duplex-event"] || element.attributes["data-event"] || {}
             event = event.value
             if (event === "change") {
                 bound("change", updateVModel)
             }
             else {
                 if (W3C && DOC.documentMode !== 9) {
                     //IE10+, W3C
                     bound("input", updateVModel)
                     bound("compositionstart", compositionStart)
                     bound("compositionend", compositionEnd)
                 }
                 else {
                     var events = ["keyup", "paste", "cut", "change"]
                     function removeFn(e) {
                         var key = e.keyCode
                         //    command            modifiers                   arrows
                         if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40))
                             return
                         if (e.type === "cut") {
                             cvvm.nextTick(updateVModel)
                         }
                         else {
                             updateVModel()
                         }
                     }

                     events.forEach(function (type) {
                         element.attachEvent("on" + type, removeFn)
                     })
                     data.rollback = function () {
                         events.forEach(function (type) {
                             element.detachEvent("on" + type, removeFn)
                         })
                     }
                 }

             }
         }
         element.onTree = onTree
         launch(element)
         element.oldValue = element.value
         registerSubscriber(data)
         var timer = setTimeout(function () {
             if (!firstTigger) {
                 callback.call(element, element.value)
             }
             clearTimeout(timer)
         }, 31)
     }
     var TimerID,
        ribbon = [], launch = noop
     function onTree() {
         if (!this.disabled && this.oldValue !== this.value) {
             var event = DOC.createEvent("Event")
             event.initEvent("input", true, true)
             this.dispatchEvent(event)
         }
     }

     function ticker() {
         for (var n = ribbon.length - 1; n >= 0; n--) {
             var el = ribbon[n]
             if (cvvm.contains(root, el)) {
                 el.onTree && el.onTree()
             }
             else if (!el.msRetain) {
                 el.offTree && el.offTree()
                 ribbon.splice(n, 1)
             }
         }
         if (!ribbon.length) {
             clearInterval(TimerID)
         }
     }
     function launchImpl(el) {
         if (ribbon.push(el) === 1) {
             TimerID = setInterval(ticker, 30)
         }
     }

     function newSetter(newValue) {
         oldSetter.call(this, newValue)
         if (newValue !== this.oldValue) {
             var event = DOC.createEvent("Events")
             event.initEvent("input", true, true)
             this.dispatchEvent(event)
         }
     }
     if (Object.getOwnPropertyNames) {
         //shielding IE8
         try {
             var inputProto = HTMLInputElement.prototype
             var oldSetter = Object.getOwnPropertyDescriptor(inputProto, "value").set
             //shielding chrome, safari,opera
             Object.defineProperty(inputProto, "value",
                {
                    set: newSetter
                })
         }
         catch (e) {
             launch = launchImpl
         }
     }
     duplexBinding.SELECT = function (element, evaluator, data) {
         var $elem = cvvm(element)
         function updateVModel() {
             if ($elem.data("duplex-observe") !== false) {
                 var val = $elem.val() 
                 if (val + "" !== element.oldValue) {
                     evaluator(val)
                     element.oldValue = val + ""
                 }
                 data.changed.call(element, val)
             }
         }
         data.handler = function () {
             var curValue = evaluator()
             curValue = curValue && curValue.$model || curValue
             curValue = Array.isArray(curValue) ? curValue.map(String) : curValue + ""
             if (curValue + "" !== element.oldValue) {
                 $elem.val(curValue)
                 element.oldValue = curValue + ""
             }
         }
         data.bound("change", updateVModel)
         var innerHTML = NaN
         var id = setInterval(function () {
             var currHTML = element.innerHTML
             if (currHTML === innerHTML) {
                 clearInterval(id)
                 registerSubscriber(data)
                 data.changed.call(element, evaluator())
             }
             else {
                 innerHTML = currHTML
             }
         }, 20)
     }
     duplexBinding.TEXTAREA = duplexBinding.INPUT
     //============================= event binding =======================

     function fixEvent(event) {
         var ret = {}
         for (var i in event) {
             ret[i] = event[i]
         }
         var target = ret.target = event.srcElement
         if (event.type.indexOf("key") === 0) {
             ret.which = event.charCode != null ? event.charCode : event.keyCode
         }
         else if (/mouse|click/.test(event.type)) {
             var doc = target.ownerDocument || DOC
             var box = doc.compatMode === "BackCompat" ? doc.body : doc.documentElement
             ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0)
             ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0)
         }
         ret.timeStamp = new Date - 0
         ret.originalEvent = event
         ret.preventDefault = function () {
             event.returnValue = false
         }
         ret.stopPropagation = function () {
             event.cancelBubble = true
         }
         return ret
     }

     var eventHooks = cvvm.eventHooks
     if (!("onmouseenter"
        in root)) {
         $.each({
             mouseenter: "mouseover",
             mouseleave: "mouseout"
         }, function (origType, fixType) {
             eventHooks[origType] =
                {
                    type: fixType,
                    deel: function (elem, fn) {
                        return function (e) {
                            var t = e.relatedTarget
                            if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
                                delete e.type
                                e.type = origType
                                return fn.call(elem, e)
                            }
                        }
                    }
                }
         })
     }
     if (!("oninput"
        in document.createElement("input"))) {
         eventHooks.input =
            {
                type: "propertychange",
                deel: function (elem, fn) {
                    return function (e) {
                        if (e.propertyName === "value") {
                            e.type = "input"
                            return fn.call(elem, e)
                        }
                    }
                }
            }
     }
     if (document.onmousewheel === void 0) {
         eventHooks.mousewheel =
            {
                type: "DOMMouseScroll",
                deel: function (elem, fn) {
                    return function (e) {
                        e.wheelDelta = e.detail > 0 ? -120 : 120
                        if (Object.defineProperty) {
                            Object.defineProperty(e, "type",
                            {
                                value: "mousewheel"
                            })
                        }
                        fn.call(elem, e)
                    }
                }
            }
     }

     window.cvvm = cvvm;

     $(function () {
         window.model = cvvm.define("test", function (vm) {
             vm.firstName = "vision"
             vm.lastName = "li"
             vm.fullName =
                {
                    //一个包含set或get的对象会被当成PropertyDescriptor，
                    set: function (val) {
                        //里面必须用this指向scope，不能使用scope
                        var array = (val || "").split(" ");
                        this.firstName = array[0] || "";
                        this.lastName = array[1] || "";
                    },
                    get: function () {
                        return this.firstName + " " + this.lastName;
                    }
                }
             vm.arr = ["aaa", 'bbb', "ccc", "ddd"]
             vm.selected = ["bbb", "ccc"]
             vm.checkAllbool = vm.arr.length === vm.selected.length
             vm.checkAll = function () {
                 if (this.checked) {
                     vm.selected = vm.arr
                 }
                 else {
                     vm.selected.clear()
                 }
             }
         })
         model.selected.$watch("length", function (n) {
             model.checkAllbool = n === model.arr.size()
         })
         cvvm.scan();

     });
 })(document)



