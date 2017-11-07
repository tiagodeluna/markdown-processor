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

    var LineType = {
        EMPTY: 1,
        HEADER: 2,
        PARAGRAPH: 3,
        UNORDERED_LIST: 4,
        ORDERED_LIST: 5,
        QUOTE: 6
    };

    var ListPosition = {
        FIRST: 1,
        MIDDLE: 2,
        LAST: 3,
        FIRST_AND_LAST: 4
    };

    var MarkdownElement = {
        level: 1,
        content: "",
        type: undefined,
        position: undefined,

        toString: function() {
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
                case LineType.UNORDERED_LIST:
                    if (this.position === ListPosition.FIRST || this.position === ListPosition.FIRST_AND_LAST) {
                        opening = "<ul>";
                    }
                    opening += "<li>";
                    closing = "</li>";
                    if (this.position === ListPosition.LAST || this.position === ListPosition.FIRST_AND_LAST) {
                        closing += "</ul>";
                    }
                    break;
                case LineType.ORDERED_LIST:
                    if (this.position === ListPosition.FIRST || this.position === ListPosition.FIRST_AND_LAST) {
                        opening = "<ol>";
                    }
                    opening += "<li>";
                    closing = "</li>";
                    if (this.position === ListPosition.LAST || this.position === ListPosition.FIRST_AND_LAST) {
                        closing += "</ol>";
                    }
                    break;
                case LineType.QUOTE:
                    opening = "<quote>";
                    closing = "</quote>";
                    break;
                default:
                    break;
            }
            return opening + this.applyEmphasis(this.content) + closing;
        },

        applyEmphasis: function(text) {
            if (text != null && text.length > 0) {
                // REPLACE BOLD AND ITALIC OCCURRENCES
                return text.replace(REGEX_BOLD_UNDERLINE, boldReplacer)
                        .replace(REGEX_BOLD_ASTERISK, boldReplacer)
                        .replace(REGEX_ITALIC_UNDERLINE, italicReplacer)
                        .replace(REGEX_ITALIC_ASTERISK, italicReplacer);
            }

            return text;
        }
    };

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

        function createLine(text, prev) {
            //Create a new line and identify its type using Regex
            var line = Object.create(MarkdownElement);

            /* JUMP LINE */
            if (text.trim().length == 0) {
                line.type = LineType.EMPTY;
                return line;
            }

            /* FIND HEADERS */
            var occur = REGEX_HEADERS.exec(text);
            if (occur != null) {
                line.type = LineType.HEADER;
                line.level = occur[0].length;
                line.content = text.substr(line.level).trim();
                return line;
            } 

            /* FIND ORDERED LIST */
            occur = REGEX_ORDERED_LIST.exec(text);
            if (occur != null) {
                line.type = LineType.ORDERED_LIST;
                //Get list level based on the number of white spaces
                line.level = calculateLevel(occur[1].length);
                line.content = occur[2];
                //TODO: Check if its first
                //IF previous element doesn't exist
                    //OR previous element is from a different type
                    //OR previous element is from a lower level
                if (prev == null || prev.type !== line.type
                    || prev.level < line.level) {
                    line.position = ListPosition.FIRST_AND_LAST;
                } else {
                    line.position = ListPosition.LAST;
                }

                //IF previous element exist
                    //AND Its type is a list
                        //SO...
                        //IF previous element is LAST
                            //SO previous is now MIDDLE
                if (prev != null && (prev.type === LineType.ORDERED_LIST || prev.type === LineType.UNORDERED_LIST)) {
                    if (prev.position === ListPosition.FIRST_AND_LAST) {
                        prev.position = ListPosition.FIRST;
                    } else {
                        prev.position = ListPosition.MIDDLE;
                    }
                }

                return line;
            } 

            /* FIND UNORDERED LIST */
            occur = REGEX_UNORDERED_LIST.exec(text);
            if (occur != null) {
                line.type = LineType.UNORDERED_LIST;
                //TODO...
                return line;
            }

            // TODO: Handle when a list ends
            /*
            if (line.type != LineType.ORDERED_LIST && line.type != LineType.UNORDERED_LIST) {
                if (prev != null && (prev.type == LineType.ORDERED_LIST || prev.type == LineType.UNORDERED_LIST)) {
                    prev.position = ListPosition.LAST;
                }
            }*/

            // If the line does not belong to any specific type, it is returned as a new paragraph
            line.type = LineType.PARAGRAPH;
            line.content = text;
            return line;
        }

        Converter.convert = function(text) {
            var lines = text == null ? [] : text.split("\n");
            var output = [];
            var current, previous;
            
            var len = lines.length;
            for (var i = 0; i < len; i += 1) {
                current = createLine(lines[i], previous);
                previous = current;
                output.push(current);
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
