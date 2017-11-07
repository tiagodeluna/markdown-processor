(function(window){
    /* Advantages of "strict mode":
        - Eeliminates some JavaScript silent errors by changing them to throw errors
        - Fixes mistakes that make it difficult for JavaScript engines to perform optimizations
        - Third, strict mode prohibits some syntax likely to be defined in future versions of ECMAScript */
    "use strict";

    // AUXILIARY CLASSES
    //The regular expressions for markdown elements
    var REGEX_HEADERS = /^#{1,6}/;
    var REGEX_ORDERED_LIST = /^(\s*)\d+\.\s+(.+?)/;
    var REGEX_UNORDERED_LIST = /^(\s*aosijdoas)/;
    var REGEX_ITALIC_UNDERLINE = /_(?=\S)(.*?)(\S)_/g;
    var REGEX_ITALIC_ASTERISK = /\*(?=\S)(.*?)(\S)\*/g;
    var REGEX_BOLD_UNDERLINE = /__(?=\S)(.*?)(\S)__/g;
    var REGEX_BOLD_ASTERISK = /\*\*(?=\S)(.*?)(\S)\*\*/g;
// Alternatives:
//    /__\B(.+?)\B__/g;
//    /__(.*?)(?=__)__/g;
//    /__(\S.+?\S)__/g;
//    /__(.+?)__/g;
    var REGEX_NOT_EMPHASIS_MARKS = /[^ _\*]/;
    var REGEX_STRIKE = null;

    //------------------------------------------------------------
    // Enum with the different types of elements
    //------------------------------------------------------------
    var LineType = {
        EMPTY: 1,
        HEADER: 2,
        PARAGRAPH: 3,
        UNORDERED_LIST: 4,
        ORDERED_LIST: 5,
        QUOTE: 6,
        LIST_ITEM: 7
    };

    //------------------------------------------------------------
    // MarkdownElement - Class that represents a markdown line
    //------------------------------------------------------------
    function MarkdownElement(type, level, content, parent) {
        this.type = type;
        this.level = level != undefined ? level : 1;
        this.content = content;
        this.parent = parent;
    };

    MarkdownElement.prototype.toString = function() {
        var opening = "",
            closing = "";

        switch(this.type) {
            case LineType.EMPTY:
                this.content = "<br />";
                break;
            case LineType.HEADER:
                opening = "<h"+this.level+">";
                closing = "</h"+this.level+">";
                break;
            case LineType.PARAGRAPH:
                opening = "<p>";
                closing = "</p>";
                break;
            case LineType.LIST_ITEM:
                opening = "<li>";
                closing = "</li>";
                break;
            case LineType.QUOTE:
                opening = "<quote>";
                closing = "</quote>";
                break;
            default:
                break;
        }
        return opening + this.applyEmphasis(this.content) + closing;
    };

    MarkdownElement.prototype.applyEmphasis = function(text) {
        if (text != null && text.length > 0) {
            // REPLACE BOLD AND ITALIC OCCURRENCES
            return text.replace(REGEX_BOLD_UNDERLINE, boldReplacer)
                    .replace(REGEX_BOLD_ASTERISK, boldReplacer)
                    .replace(REGEX_ITALIC_UNDERLINE, italicReplacer)
                    .replace(REGEX_ITALIC_ASTERISK, italicReplacer);
        }

        return text;
    };

    //------------------------------------------------------------
    // MarkdownList - Class that represents a list of elements
    //------------------------------------------------------------
    function MarkdownList(type, level, content) {
        MarkdownElement.call(this, type, level, content);
    };

    MarkdownList.prototype = Object.create(MarkdownElement.prototype);
    MarkdownList.prototype.constructor = MarkdownList;

    MarkdownList.prototype.toString = function() {
        var opening = "",
            closing = "",
            elements = "";

        switch(this.type) {
            case LineType.UNORDERED_LIST:
                opening = "<ul>";
                closing = "</ul>";
                break;
            case LineType.ORDERED_LIST:
                opening = "<ol>";
                closing = "</ol>";
                break;
            default:
                break;
        }

        var len = this.content.size;
        for(var i = 0; i < len; i += 1) {
            elements += this.content[i];
        }
        return opening + elements + closing;
    }

    //------------------------------------------------------------
    // Auxiliary functions
    //------------------------------------------------------------
    //TODO: Relocate these functions to a more appropriate location
    /* The auxiliary replacer functions receive the following REGEX attributes:
        - match: The full matched string
        - p1: The first parenthesized substring match
        - p2: The second parenthesized substring match
        - offset: The 0-based index of the match in the string (Omitted. Not necessary here)
        - text: The original string (Omitted. Not necessary here)
    */
    function boldReplacer(match, p1, p2) {
        return emphasisReplacer(match, p1, p2, "strong");
    }

    function italicReplacer(match, p1, p2) {
        return emphasisReplacer(match, p1, p2, "em");
    }

    function emphasisReplacer(match, p1, p2, element) {
        if (REGEX_NOT_EMPHASIS_MARKS.test(p1) || REGEX_NOT_EMPHASIS_MARKS.test(p2)) {
            return "<" + element + ">" + p1 + p2 + "</" + element + ">";
        }
        return match;
    }

    function calculateLevel(spaces) {
        return Math.trunc(spaces / 3) + 1;
    }

    //Creates an instance of the library
    function define_converter() {
        var Converter = {};
        var emptyLnCounter = 0;

        function createLine(text, parent) {
            //Create a new line and identify its type using Regex
            //var line = Object.create(MarkdownElement);
            var line;

            /* JUMP LINE */
            if (text.trim().length == 0) {
                //line.type = LineType.EMPTY;
                line = new MarkdownElement(LineType.EMPTY);
                return line;
            }

            /* FIND HEADERS */
            var occur = REGEX_HEADERS.exec(text);
            if (occur != null) {
                var level = occur[0].length;
                line = new MarkdownElement(LineType.HEADER,
                    level,
                    text.substr(level).trim()
                );
                return line;
            } 

            /* FIND ORDERED LIST */
            occur = REGEX_ORDERED_LIST.exec(text);
            if (occur != null) {
                //Get item level based on the number of white spaces before
                var level = calculateLevel(occur[1].length);

                if (parent == null) {
                    parent = new MarkdownList(line.type, level, []);
                } 

                if (parent.level === level) {
                    line = new MarkdownElement(LineType.ORDERED_LIST, level, occur[2], parent);
                    parent.content.push(line);
                } else if (parent.level < level) {
                    var newParent = new MarkdownList(LineType.ORDERED_LIST, level, [], parent);
                    line = new MarkdownElement(LineType.ORDERED_LIST, level, occur[2], newParent);
                    newParent.content.push(line);
                    parent.content.push(newParent);
                } else if (parent.level > level) {
                    //Get parent's parent
                    var grandParent = parent.parent;
                    line = new MarkdownElement(LineType.ORDERED_LIST, level, occur[2], grandParent);
                    //Add line to it
                    grandParent.content.push(line);
                    return grandParent;
                }

                /*
                if (parent.type != line.type) {

                }
                parent.content.push(line);
                */
                return parent;
            }

/*
1. Teste 1
2. ...

1. Teste 2
   1. ...
2. ...

* Teste 3
   1. ...
*/

            /* FIND UNORDERED LIST */
            occur = REGEX_UNORDERED_LIST.exec(text);
            if (occur != null) {
                line = new MarkdownElement(LineType.UNORDERED_LIST);
                //TODO...
                return line;
            }

            // If the line does not belong to any specific type, it is returned as a new paragraph
            line = new MarkdownElement(LineType.PARAGRAPH, null, text);
            return line;
        }

        Converter.convert = function(text) {
            var lines = text == null ? [] : text.split("\n");
            var output = [];
            var current, list;
            
            var len = lines.length;
            for (var i = 0; i < len; i += 1) {
                current = createLine(lines[i], list);

                //Tá um lixo... muita complexidade sob responsabilidade do método externo
                if (current.type === LineType.ORDERED_LIST || current.type === LineType.UNORDERED_LIST) {
                    //if (current.)
                    list = current;
                } else {
                    output.push(current);
                }

                if (current.type != LineType.ORDERED_LIST && current.type != LineType.UNORDERED_LIST) {
                    if (list != null) {
                        output.
                    }
                    output.push(current);
                }
                //output.push(current);
            }

            console.log(output.join(""));

            //Join the output array into a single string, implicitly
            // calling the toString() method of each line
            return output.join("");
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
