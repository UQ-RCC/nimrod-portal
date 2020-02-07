ace.define("ace/mode/planfile_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";
    
    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    
    var PlanfileHighligtRules = function() {
    
        var keywords = (
            'parameter|task|endtask|onerror|redirect|' +
            'select|anyof|label|range|from|to|step|'+
            'points|random|root'
        );
    
        var builtinConstants = (
            "fail|ignore"
        );
    
        var dataTypes = (
            "interget|float|text|files"
        );
    
        var keywordMapper = this.createKeywordMapper({
            "keyword": keywords,
            "constant.language": builtinConstants,
            "storage.type": dataTypes
        }, "identifier", true);
    
        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "//.*$"
            },  {
                token : "comment",
                start : "/\\*",
                end : "\\*/"
            }, {
                token : "string",           // " string
                regex : '".*?"'
            }, {
                token : "string",           // ' string
                regex : "'.*?'"
            }, {
                token : "string",           // ` string (apache drill)
                regex : "`.*?`"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
            }, {
                token : "paren.lparen",
                regex : "[\\(]"
            }, {
                token : "paren.rparen",
                regex : "[\\)]"
            }, {
                token : "text",
                regex : "\\s+"
            } ]
        };
        this.normalizeRules();
    };
    
    oop.inherits(PlanfileHighligtRules, TextHighlightRules);
    
    exports.PlanfileHighligtRules = PlanfileHighligtRules;
    });
    
    ace.define("ace/mode/planfile",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/planfile_highlight_rules"], function(require, exports, module) {
    "use strict";
    
    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var PlanfileHighligtRules = require("./planfile_highlight_rules").PlanfileHighligtRules;
    
    var Mode = function() {
        this.HighlightRules = PlanfileHighligtRules;
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);
    
    (function() {
    
        this.lineCommentStart = "//";
    
        this.$id = "ace/mode/planfile";
    }).call(Mode.prototype);
    
    exports.Mode = Mode;
    
    });                (function() {
                        ace.require(["ace/mode/planfile"], function(m) {
                            if (typeof module == "object" && typeof exports == "object" && module) {
                                module.exports = m;
                            }
                        });
                    })();
                