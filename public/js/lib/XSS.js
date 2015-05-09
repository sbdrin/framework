; (function ($, undefined) {
    'use strict';
    var $v = window.$v = window.$v || {};
    if ($v.version) {
        return;
    }

    function Observable() { };
    Observable.prototype =
    {
        constructor: Observable,

        init: function () {
            this._cus_events = {};
        },

        bind: function (eventName, handlers, one) {
            var that = this, idx,
            eventNames = typeof eventName === "string" ? [eventName] : eventName, length,
            original,
            handler,
            handlersIsFunction = typeof handlers === "function", events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];
                handler = handlersIsFunction ? handlers : handlers[eventName];
                if (handler) {
                    if (one) {
                        original = handler;
                        handler = function () {
                            that.unbind(eventName, handler);
                            original.apply(that, arguments);
                        };
                    }
                    events = that._cus_events[eventName] = that._cus_events[eventName] || [];
                    events.push(handler);
                }
            }

            return that;
        },

        one: function (eventNames, handlers) {
            return this.bind(eventNames, handlers, true);
        },

        first: function (eventName, handlers) {
            var that = this, idx,
            eventNames = typeof eventName === "string" ? [eventName] : eventName, length,
            handler,
            handlersIsFunction = typeof handlers === "function", events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    events = that._cus_events[eventName] = that._cus_events[eventName] || [];
                    events.unshift(handler);
                }
            }

            return that;
        },

        trigger: function (eventName, e) {
            var that = this, events = that._cus_events[eventName], idx,
            length,
            isDefaultPrevented = false;
            if (events) {
                e = e || {};

                e.sender = that;

                e.preventDefault = function () {
                    isDefaultPrevented = true;
                };

                e.isDefaultPrevented = function () {
                    return isDefaultPrevented;
                };

                events = events.slice();

                for (idx = 0, length = events.length; idx < length; idx++) {
                    events[idx].call(that, e);
                }
            }

            return isDefaultPrevented;
        },

        unbind: function (eventName, handler) {
            var that = this, events = that._cus_events[eventName], idx,
            length;

            if (events) {
                if (handler) {
                    for (idx = 0, length = events.length; idx < length; idx++) {
                        if (events[idx] === handler) {
                            events.splice(idx, 1);
                        }
                    }
                }
                else {
                    that._cus_events[eventName] = [];
                }
            }

            return that;
        }
    };

    function Widget() { };
    Widget.fn = Widget.prototype = $.extend({}, Observable.prototype,
    {
        constructor: Widget,

        init: function (element, options) {
            var that = this;
            that.options = $.extend(true, {}, that.options, options);
            that.host = $(element);
            Observable.prototype.init.call(that);
            that.bind(that.events, that.options);
        },

        events: [],

        setOptions: function (options) {
            $.extend(this.options, options);

            this.bind(this.events, options);
        }
    });

    $v.ui = {};
    $.extend($v.ui,
    {
        Widget: Widget,
        plugin: function (widget, register, prefix) {
            var name = widget.prototype.name, getter;
            prefix = prefix || "";
            name = "" + prefix + name;
            register = register || $v.ui;
            register[name] = widget;
            //自定义组件前缀
            $.fn[name] = function (options) {
                var value = this, args;

                if (typeof options === "string") {
                    args = Array.prototype.slice.call(arguments, 1);

                    this.each(function () {
                        var widget = $.data(this, name), method,
                        result;

                        if (!widget) {
                            throw new Error("Cannot call method '{0}' of {1} before it is initialized".format(options, name));
                        }

                        method = widget[options];

                        if (typeof method !== "function") {
                            throw new Error("Cannot find method '{0}' of {1}".format(options, name));
                        }

                        result = method.apply(widget, args);

                        if (result !== undefined) {
                            value = result;
                            return false;
                        }
                    });
                }
                else {
                    this.each(function () {
                        var wi = $.data(this, name, new widget());
                        Widget.fn.init.call(wi, this, options);
                        wi.init();
                    });
                }

                return value;
            };
        },
        createPlugin: function (options, register, prefix) {
            function CustomPlugin() { }
            CustomPlugin.prototype = $.extend({
                constructor: CustomPlugin
            }, (register && register.prototype) || this.Widget.fn, options);
            this.plugin(CustomPlugin, register, prefix);
        }
    })
} (jQuery));
; (function ($, undefined) {
    var addCSS = function (cssText){
        var style = document.createElement('style'), 
        head = document.head || document.getElementsByTagName('head')[0];
        style.type = 'text/css';
        if(style.styleSheet){
            var func = function(){
                try{
                    style.styleSheet.cssText = cssText;
                }
                catch(e){}
            }
            if(style.styleSheet.disabled){
                setTimeout(func, 10);
            }
            else{
                func();
            }
        }
        else{
            var textNode = document.createTextNode(cssText);
            style.appendChild(textNode);
        }
        head.appendChild(style);
    };
    addCSS('.xss-error{ border:red 1px solid;padding:2px 1px;}');
    $v.ui.createPlugin({
        name: "XSSValidator",
        init: function () {
            var that = this;
            this.defineInstance();
            this.createInstance();
            this.trigger("click");
        },
        events: [],
        options:
        {
            numOnly:"",
            allowXSSChars:[".","&", "'", "_"," ", ",", "-"],
            allowChars:"",
            allowCharsForNum:"",
            selector:[]
        },
        defineInstance: function () {
            var that =this;
            this.rules = null;
            this.scroll = true;
            this.focus = true;
            this.scrollDuration = 300;
            this.scrollCallback = null;
            this.position = 'right';
            this.arrow = true;
            this.animation = 'fade';
            this.animationDuration = 150;
            this.closeOnClick = true;
            this.onError = null;
            this.onSuccess = null;
            this.ownerElement = null;
            this._events = ['validationError', 'validationSuccess'];
            this.hintPositionOffset = 5;
            this._inputHint = [];
            this.rtl = false;
            this.hintType = "tooltip";
            $.each(this.options,function(i,val){
                that[i] = val;
            });
        },
        createInstance: function () {
            var that = this;
            this._xssFilter(this);
            
            if (this.hintType == "label" && this.animationDuration == 150) {
                this.animationDuration = 0;
            }
            this._configureInputs();
            this._removeEventListeners();
            this._addEventListeners();
        },
        addElement:function(options){
            var _rules = (options.rules || []).concat().concat(this._xssFilter(options,this));
            for (var i = 0; i < _rules.length; i += 1) {
                rule = _rules[i];
                rule['hintRender'] = this._hintRender;
                this._handleRule(rule);
                input = $(rule.input);
                this._addListenerTo(input, rule);
            }
            this.rules = this.rules.concat(_rules);
        },
        _xssFilter : function(that, root){
            that.rules = that.rules || [];
            if(that.numOnly){
                var allowKeyCodeForNum = [];
                var allowCharsForNum = [".", "-"].concat(that.allowCharsForNum || []);
                $.each(allowCharsForNum, function(i, value){
                    allowKeyCodeForNum.push(value.charCodeAt(0));
                });
                allowCharsForNum = allowCharsForNum.join("") || root.allowCharsForNum.concat([".", "-"]).join("");
                $(that.numOnly).each(function(){
                    $(this).data("numOnly", true);
                    $(this).bind("keypress", function(event){
                        var $that = $(this);
                        var code = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
                        if((code == 8) || (code == 9)|| (code >= 48 && code <= 57) || code == 46 || code == 45 || $(allowKeyCodeForNum).index(code) > -1){
                            if(code == 109 || code == 77){
                                $that.val((Number($that.val().replace(/,/g, "")) || 1) * 1000);
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }).bind("paste", function(){
                        var $that = $(this);
                        var oldValue = $that.val();
                        setTimeout(function(){
                            var value = Number($that.val());
                            $that.val(value || oldValue);
                        }, 0);
                    });
                    that.rules.push({
                        input : this,
                        message : 'number',
                        action : 'blur',
                        rule : 'number'
                    });
                    that.rules.push({
                        input : this,
                        message : 'Input contain forbidden characters.Please try again',
                        action : 'blur',
                        rule : 'allowSpecialChars=' + allowCharsForNum
                    });
                    
                });
            }
            if(that.selector){
                var allowKeyCode = [];
                var allowChars = that.allowChars || that.allowXSSChars || root.allowXSSChars;
                $.each(allowChars, function(i, value){
                    allowKeyCode.push(value.charCodeAt(0));
                });
                $(that.selector).each(function(i, value){
                    if($(value).data("numOnly")){
                        return;
                    }
                    $(value).bind("keypress", function(event){
                        var code = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
                        if((code == 8) || (code == 9) || (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || $(allowKeyCode).index(code) > -1){
                            return true;
                        }
                        return false;
                    }).bind("paste", function(){
                        var $that = $(this);
                        setTimeout(function(){
                            $that.val($.trim($that.val().replace(eval("/[^A-Za-z0-9\\" + (allowChars.join("\\")) + "]|select|insert|update|delete|exec|count/g"), "")))
                        }, 0);
                    });
                    that.rules.push({
                        input : value,
                        message : 'Any SQL keywords can not be accepted.',
                        action : 'blur',
                        rule : 'filterSql'
                    });
                    if(allowChars[allowChars.length - 1] == ","){
                        allowChars.splice(1, 0, ",");
                    }
                    that.rules.push({
                        input : value,
                        message : 'Input contain forbidden characters.Please try again',
                        action : 'blur',
                        rule : 'allowSpecialChars=' + allowChars.join("")
                    });
                });
            }
            return that.rules;
        },
        
        _filterSql: function (input, param) {
            return this._validateText(input, function (value) {
                var re = /select|insert|update|delete|exec|count/gi;
                return !re.test(value);
            });
        },
        _allowSpecialChars: function (input, param,param2) {
            param2 && (param = (param || "") + param2 + ",");
            return this._validateText(input, function (value) {
                var valueNum = Number(value.replace(/N\/a|,|%/gi,""));
                value = valueNum || value;
                if (param == "false")
                    return / ^[A - Za - z0 - 9] + $ /.test(value);
                else{
                    param = param.split("");
                }
                if (param.length) {
                    return eval("/^[A-Za-z0-9 " + param.join("\\") + "]+$/").test(value || " ");
                }
                return false;
            });
        },

        addHandler: function (source, event, func, data) {
            switch (event) {
                case 'mousewheel':
                    if (window.addEventListener) {
                        if ($.browser.mozilla) {
                            source[0].addEventListener('DOMMouseScroll', func, false);
                        }
                        else {
                            source[0].addEventListener('mousewheel', func, false);
                        }
                        return false;
                    }
                    break;
                case 'mousemove':
                    if (window.addEventListener && !data) {
                        source[0].addEventListener('mousemove', func, false);
                        return false;
                    }
                    break;
            }

            if (data == undefined || data == null) {
                if (source.on) {
                    source.bind(event, func);
                }
                else {
                    source.bind(event, func);
                }
            }
            else {
                if (source.on) {
                    source.bind(event, data, func);
                }
                else {
                    source.bind(event, data, func);
                }
            }
        },
        removeHandler: function (source, event, func) {
            switch (event) {
                case 'mousewheel':
                    if (window.removeEventListener) {
                        if ($.browser.mozilla) {
                            source[0].removeEventListener('DOMMouseScroll', func, false);
                        }
                        else {
                            source[0].removeEventListener('mousewheel', func, false);
                        }
                        return false;
                    }
                    break;
                case 'mousemove':
                    if (func) {
                        if (window.removeEventListener) {
                            source[0].removeEventListener('mousemove', func, false);
                        }
                    }
                    break;
            }

            if (event == undefined) {
                if (source.off) {
                    source.off();
                }
                else
                    source.unbind();
                return;
            }

            if (func == undefined) {
                if (source.off) {
                    source.off(event);
                }
                else {
                    source.unbind(event);
                }
            }
            else {
                if (source.off) {
                    source.off(event, func);
                }
                else {
                    source.unbind(event, func);
                }
            }

        },
        toThemeProperty: function (propertyName, override) {
            if (this.theme == '')
                return propertyName;

            if (override != null && override) {
                return propertyName + '-' + this.theme;
            }

            return propertyName + ' ' + propertyName + '-' + this.theme;
        },

        _validateRule: function (rule, validate) {
            var input = $(rule.input), hint,
            valid = true;
            if(!input.length){
              return valid;
            }
            var me = this;
            var commit = function (isValid) {
                if (!isValid) {
                    var temp = me.animation;
                    me.animation = null;
                    if (rule.hint) {
                        me._hideHintByRule(rule);
                    }

                    hint = rule.hintRender.apply(me, [rule.message, input]);
                    rule.hint = hint;
                    me._removeLowPriorityHints(rule);
                    if (validate)
                        validate(false, rule);
                    me.animation = temp;
                }
                else {
                    me._hideHintByRule(rule);
                    if (validate)
                        validate(true, rule);
                }
            }

            var ruleResult = false;
            if (typeof rule.rule === 'function') {
                ruleResult = rule.rule.call(this, input, commit);
                if (ruleResult == true && validate)
                    validate(true, rule);
            }

            if (typeof rule.rule === 'function' && ruleResult == false) {
                if (typeof rule.hintRender === 'function' && !rule.hint && !this._higherPriorityActive(rule) && input.is(':visible')) {
                    hint = rule.hintRender.apply(this, [rule.message, input]);

                    rule.hint = hint;
                    this._removeLowPriorityHints(rule);
                }
                valid = false;
                if (validate)
                    validate(false, rule);
            }
            else {
                this._hideHintByRule(rule);
            }
            return valid;
        },

        _hintRender: function (message, input) {
            $(input).addClass("xss-error").attr("title", message);
            return $('<div>');
        },

        _hideHintByRule: function (rule) {
            var input = $(rule.input);

            var self = this, hint;
            var removeErrorClass = function () {
                if (self.hintType != "label") {
                    return;
                }

                var that = self;
                if (that.position == "top" || that.position == "left") {
                    if (input.prev().hasClass('.jqxCus-validator-error-label'))
                        return;
                }
                else {
                    if (input.next().hasClass('.jqxCus-validator-error-label'))
                        return;
                }

                if (input[0].nodeName.toLowerCase() != "input") {
                    if (input.find('input').length > 0) {
                        if (input.find('.jqxCus-input').length > 0) {
                            input.find('.jqxCus-input').removeClass(that.toThemeProperty('jqx-validator-error-element'));
                        }
                        else if (input.is('.jqxCus-checkbox')) {
                            input.find('.jqxCus-checkbox-default').removeClass(that.toThemeProperty('jqx-validator-error-element'));
                        }
                        if (input.is('.jqxCus-radiobutton')) {
                            input.find('.jqxCus-radiobutton-default').removeClass(that.toThemeProperty('jqx-validator-error-element'));
                        }
                        else {
                            input.removeClass(that.toThemeProperty('jqx-validator-error-element'));
                        }
                    }
                }
                else {
                    input.removeClass(that.toThemeProperty('jqx-validator-error-element'));
                }
            }

            if (rule) {
                hint = rule.hint;
                if (hint) {
                    input.removeClass("xss-error").attr("title", "");
                }
                rule.hint = null;
            }
        },
        destroy: function () {
            this._removeEventListeners();
            this.hide();
        },

        validate: function (result) {
            var valid = true,
                temp,
                minTop = Infinity,
                currentTop,
                topElement,
                tempElement,
                invalid = [],
                minTopElement;
            this.updatePosition();
            var me = this;
            var ruleFuncsCount = 0;
            
            for (var i = 0; i < this.rules.length; i += 1) {
                if (typeof this.rules[i].rule === 'function') {
                    ruleFuncsCount++;
                }
            }
            this.positions = new Array();
            for (var i = 0; i < this.rules.length; i += 1) {
                var input = $(this.rules[i].input);
                if (typeof this.rules[i].rule === 'function') {
                    var validate = function (isValid, rule) {
                        temp = isValid;
                        if (false == temp) {
                            valid = false;
                            var input = $(rule.input);
                            tempElement = $(rule.input);
                            invalid.push(tempElement);
                            currentTop = tempElement.offset().top;
                            if (minTop > currentTop) {
                                minTop = currentTop;
                                topElement = tempElement;
                            }
                        }
                        ruleFuncsCount--;
                        if (ruleFuncsCount == 0) {
                            if (typeof result === 'function') {
                                me._handleValidation(valid, minTop, topElement, invalid);
                                if (result) result(valid);
                            }
                        }
                    }
                    this._validateRule(this.rules[i], validate);
                }
                else {
                    temp = this._validateRule(this.rules[i]);
                }
                if (false == temp) {
                    valid = false;
                    tempElement = $(this.rules[i].input);
                    invalid.push(tempElement);
                    currentTop = tempElement.offset().top;
                    if (minTop > currentTop) {
                        minTop = currentTop;
                        topElement = tempElement;
                    }
                }
            }

            if (ruleFuncsCount == 0) {
                this._handleValidation(valid, minTop, topElement, invalid);
                return valid;
            }
            else {
                return undefined;
            }
        },

        validateInput: function (input) {
            var rules = this._getRulesForInput(input),
                valid = true;

            for (var i = 0; i < rules.length; i += 1) {
                if (!this._validateRule(rules[i])) {
                    valid = false;
                }
            }
            return valid;
        },

        hideHint: function (input) {
            var rules = this._getRulesForInput(input);
            for (var i = 0; i < rules.length; i += 1) {
                this._hideHintByRule(rules[i]);
            }
        },

        hide: function () {
            var rule;
            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                this._hideHintByRule(this.rules[i]);
            }
        },

        updatePosition: function () {

        },

        _getRulesForInput: function (input) {
            var rules = [];
            for (var i = 0; i < this.rules.length; i += 1) {
                if (this.rules[i].input === input) {
                    rules.push(this.rules[i]);
                }
            }
            return rules;
        },




        _handleValidation: function (valid, minTop, topElement, invalid) {
            if (!valid) {
                this._scrollHandler(minTop);
                if (this.focus) {
                    topElement.focus()
                }
                this._raiseEvent(0, { invalidInputs: invalid });
                if (typeof this.onError === 'function') {
                    this.onError(invalid);
                }
            } else {
                this._raiseEvent(1);
                if (typeof this.onSuccess === 'function') {
                    this.onSuccess();
                }
            }
        },

        _scrollHandler: function (minTop) {
            if (this.scroll) {
                var self = this;
                $('html,body').animate({ scrollTop: minTop }, this.scrollDuration, function () {
                    if (typeof self.scrollCallback === 'function') {
                        self.scrollCallback.call(self);
                    }
                });
            }
        },

        _higherPriorityActive: function (rule) {
            var reach = false,
                current;
            for (var i = this.rules.length - 1; i >= 0; i -= 1) {
                current = this.rules[i];
                if (reach && current.input === rule.input && current.hint) {
                    return true;
                }
                if (current === rule) {
                    reach = true;
                }
            }
            return false;
        },

        _removeLowPriorityHints: function (rule) {
            var reach = false,
                current;
            for (var i = 0; i < this.rules.length; i += 1) {
                current = this.rules[i];
                if (reach && current.input === rule.input) {
                    this._hideHintByRule(current);
                }
                if (current === rule) {
                    reach = true;
                }
            }
        },

        _getHintRuleByInput: function (input) {
            var current;
            for (var i = 0; i < this.rules.length; i += 1) {
                current = this.rules[i];
                if ($(current.input)[0] === input[0] && current.hint) {
                    return current;
                }
            }
            return null;
        },

        _removeEventListeners: function () {
            var rule,
                input,
                listeners;
            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                listeners = rule.action.split(',');
                input = $(rule.input);
                for (var j = 0; j < listeners.length; j += 1) {
                    this.removeHandler(input, $.trim(listeners[j]) + '.jqxCus-validator');
                }
            }
        },

        _addEventListeners: function () {
            var rule, input;
            if (this.host.parents('.jqxCus-window').length > 0) {
                var self = this;
                var update = function () {
                    self.updatePosition();
                }

                var window = this.host.parents('.jqxCus-window');
                this.addHandler(window, 'closed',
                function () {
                    self.hide()
                });
                this.addHandler(window, 'moved', update);
                this.addHandler(window, 'moving', update);
                this.addHandler(window, 'resized', update);
                this.addHandler(window, 'resizing', update);
                this.addHandler($(document.parentWindow), 'scroll', function () {
                    update();
                });
            }

            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                input = $(rule.input);
                this._addListenerTo(input, rule);
            }
        },

        _addListenerTo: function (input, rule) {
            var self = this,
                listeners = rule.action.split(',');

            var isJQWidget = false;
            if (this._isjQWidget(input)) {
                isJQWidget = true;
            }

            for (var i = 0; i < listeners.length; i += 1) {
                var event = $.trim(listeners[i]);

                if (isJQWidget && (event == 'blur' || event == 'focus')) {
                    input = input.find('input');
                }
                this.addHandler(input, event + '.jqxCus-validator', function (event) {
                    self._validateRule(rule);
                });
            }
        },

        _configureInputs: function () {
            var input,
                count;
            this.rules = this.rules || [];
            for (var i = 0; i < this.rules.length; i += 1) {
                this._handleInput(i);
            }
        },

        _handleInput: function (ruleId) {
            var rule = this.rules[ruleId];
            if (!rule['position']) {
                rule['position'] = this.position;
            }
            if (!rule['message']) {
                rule['message'] = 'Validation Failed!';
            }
            if (!rule['action']) {
                rule['action'] = 'blur';
            }
            if (!rule['hintRender']) {
                rule['hintRender'] = this._hintRender;
            }
            if (!rule['rule']) {
                rule['rule'] = null;
            } else {
                this._handleRule(rule);
            }
        },

        _handleRule: function (rule) {
            var validation = rule.rule,
                func,
                parameters,
                wrongParameter = false;
            if (typeof validation === 'string') {
                if (validation.indexOf('=') >= 0) {
                    validation = validation.split('=');
                    parameters = validation[1].split(',');
                    validation = validation[0];
                }
                func = this['_' + validation];
                if (func) {
                    rule.rule = function (input, commit) {
                        return func.apply(this, [input].concat(parameters));
                    };
                } else {
                    wrongParameter = true;
                }
            } else {
                if (typeof validation !== 'function') {
                    wrongParameter = true;
                } else {
                    rule.rule = validation;
                }
            }
            if (wrongParameter) {
                throw new Error('Wrong parameter!');
            }
        },

        _required: function (input) {
            switch (this._getType(input)) {
                case 'textarea':
                case 'password':
                case 'jqx-input':
                case 'text':
                    var data = $.data(input[0]);
                    if (data.jqxMaskedInput) {
                        var promptChar = input.jqxMaskedInput('promptChar'),
                            value = input.jqxMaskedInput('value');
                        return value && value.indexOf(promptChar) < 0;
                    } else if (data.jqxNumberInput) {
                        return input.jqxNumberInput('inputValue') !== '';
                    } else if (data.jqxDateTimeInput) {
                        return true;
                    } else {
                        return $.trim(input.val()) !== '';
                    }
                case 'checkbox':
                    return input.is(':checked');
                case 'radio':
                    return input.is(':checked');
                case 'div':
                    if (input.is('.jqxCus-checkbox')) {
                        return input.jqxCheckBox('checked');
                    }
                    if (input.is('.jqxCus-radiobutton')) {
                        return input.jqxRadioButton('checked');
                    }
                    return false;
            }
            return false;
        },

        _number: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;
                text = text.split("%")[0];
                var index = text.indexOf("/");
                var value = new Number(text.replace(/N\/a|,|%/gi,""));
                if(index>-1 && value && value!=0){
                  return false;
                }
                return !isNaN(value) && isFinite(value)
            });
        },

        _length: function (input, min, max) {
            return this._minLength(input, min) && this._maxLength(input, max);
        },

        _maxLength: function (input, len) {
            len = parseInt(len, 10);
            return this._validateText(input, function (text) {
                return text.length <= len;
            });
        },

        _minLength: function (input, len) {
            len = parseInt(len, 10);
            return this._validateText(input, function (text) {
                return text.length >= len;
            });
        },

        _validateText: function (input, condition) {
            var value;
            if (this._isTextInput(input)) {
                if (this._isjQWidget(input)) {
                    value = input.find('input').val()
                } else {
                    value = input.val();
                }
                return condition(value);
            }
            return false;
        },

        _isjQWidget: function (input) {
            var data = $.data(input[0]);
            if (data.jqxMaskedInput || data.jqxNumberInput || data.jqxDateTimeInput) {
                return true;
            }
            return false;
        },

        _isTextInput: function (input) {
            var type = this._getType(input);
            return type === 'text' || type === 'textarea' || type === 'password' || input.is('.jqxCus-input');
        },

        _getType: function (input) {
            var tag = input[0].tagName.toLowerCase(),
                type;
            if (tag === 'textarea') {
                return 'textarea';
            } else if (input.is('.jqxCus-input')) {
                return 'jqx-input';
            } else if (tag === 'input') {
                type = $(input).attr('type') ? $(input).attr('type').toLowerCase() : 'text';
                return type;
            }
            return tag;
        },



        _raiseEvent: function (eventId, data) {
            var event = $.Event(this._events[eventId]);
            event.args = data;
            return this.host.trigger(event);
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (key === 'rules') {
                this._configureInputs();
                this._removeEventListeners();
                this._addEventListeners();
            }
        }
    });

    //; (function($, undefined){
    //    $v.ui.createPlugin({
    //        name : "Carousel",
    //        init : function(){
    //        },
    //        events : ["change"],
    //        options : 
    //        {
    //            change : function(e){
    //                debugger
    //            }
    //        }
    //    });
} (jQuery));

