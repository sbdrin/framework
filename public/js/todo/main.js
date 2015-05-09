(function (undefined) {    //Closure,Auto run when js loaded.
    'use strict';         //strict model . must have ';' every row end. must have keyword 'var' when declare new variable.
    window.Vision = window.Vision || {};   //define namespace. CreditCenterBond is js file name.

    if (Vision.todo) {
        //to avoid reload.
        return;
    }

    var opts =
    {
        param1: ""
    };

    function _test(testprm) {
        //private method. start with '_',Use by public method of this class.
    }

    var Class = function () {
        //Inner class
    }
    Class.prototype =
    {
        constructor: Class
    }

    var event =
    {
        init: function () {
            event.initPage();
            $(document).on("click", function (evt) {
                var target = evt.target;
                switch (target.id) {
                    case "btn":
                        //
                        break;
                }
            }, false);
        },
        initPage: function () {
            //init page
        }
    }

    Vision.todo =
    {
        init: function (options) {
            $.extend(opts, options);
            event.init();
        }
    };
} ());
