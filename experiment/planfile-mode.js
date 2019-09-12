// Hack the ace definition of define and make it global
window.define = window.define || ace.define;

define('ace/mode/example', function(require, exports, module) {
  console.log(require, exports, module);
  var oop = require("ace/lib/oop");
  var TextMode = require("ace/mode/text").Mode;
  var Tokenizer = require("ace/tokenizer").Tokenizer;
  var ExampleHighlightRules = require("ace/mode/example_highlight_rules").ExampleHighlightRules;

  var Mode = function() {
    this.$tokenizer = new Tokenizer(new ExampleHighlightRules().getRules());
  };
  oop.inherits(Mode, TextMode);

  (function() {
    // Extra logic goes here. (see below)
  }).call(Mode.prototype);

  exports.Mode = Mode;
});

define('ace/mode/example_highlight_rules', function(require, exports, module) {

  var oop = require("ace/lib/oop");

  var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
  var CssHighlightRules = require("ace/mode/css_highlight_rules").CssHighlightRules;

  var ExampleHighlightRules = function() {

    this.$rules = {
      start: [{
        token: "keyword",
        regex: "^style\\s*$",
        next: "css-start"
      }]
    };

    this.embedRules(CssHighlightRules, "css-", [{
      token: "keyword",
      regex: "^endstyle\\s*$",
      next: "start"
    }]);

  };

  oop.inherits(ExampleHighlightRules, TextHighlightRules);

  exports.ExampleHighlightRules = ExampleHighlightRules;
});