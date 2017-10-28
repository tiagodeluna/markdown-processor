(function(window){
    /* Advantages of "strict mode":
        - Eeliminates some JavaScript silent errors by changing them to throw errors
        - Fixes mistakes that make it difficult for JavaScript engines to perform optimizations
        - Third, strict mode prohibits some syntax likely to be defined in future versions of ECMAScript
    */
    "use strict";

    //TODO: Add auxiliary classes and functions

    function define_converter() {
        //The regular expressions for markdown elements
        var REGEX_HEADERS = /^#{1,6}/;
        var REGEX_ORDERED_LIST = null;
        var REGEX_UNORDERED_LIST = null;
        var REGEX_ITALIC_UNDERLINE = /_(?=\S)(.*?)(\S)_/g;
        var REGEX_ITALIC_ASTERISK = /\*(?=\S)(.*?)(\S)\*/g;
        var REGEX_BOLD_UNDERLINE = /__(?=\S)(.*?)(\S)__/g;
        var REGEX_BOLD_ASTERISK = /\*\*(?=\S)(.*?)(\S)\*\*/g;
        var REGEX_NOT_EMPHASIS_MARKS = /[^ _\*]/;
    // Alternatives:
    //    /__\B(.+?)\B__/g;
    //    /__(.*?)(?=__)__/g;
    //    /__(\S.+?\S)__/g;
    //    /__(.+?)__/g;
        var REGEX_STRIKE = null;

        var Converter = {};
        Converter.convert = function(text) {
            //TODO: Add content of the main method here
        }

        return Converter;
    }

    //Define globally if it doesn't already exist
    if(typeof(Converter) === 'undefined'){
        window.MarkdownConverter = define_converter();
    }
    else{
        throw new Error("MarkdownConverter already defined.");
    }
})(window);
