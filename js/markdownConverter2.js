(function(window){
    /* Advantages of "strict mode":
        - Eeliminates some JavaScript silent errors by changing them to throw errors
        - Fixes mistakes that make it difficult for JavaScript engines to perform optimizations
        - Third, strict mode prohibits some syntax likely to be defined in future versions of ECMAScript */
    "use strict";

    // AUXILIARY CLASSES
    //The regular expressions for markdown elements
    var REGEX_HEADERS = /^#{1,6}/;
    var REGEX_LIST_TEST = /^\s*(?:\d+\.|\*)\s+.+?/;
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
        QUOTE: 6
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
            case LineType.ORDERED_LIST:
            case LineType.UNORDERED_LIST:
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

    MarkdownElement.prototype.isSibling = function(element) {
        return this.type === element.type && this.level === element.level;
    };

    //------------------------------------------------------------
    // MarkdownList - Class that represents a list of elements
    //------------------------------------------------------------
    function MarkdownList(type, level) {
        MarkdownElement.call(this, type, level, []);
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

    MarkdownElement.prototype.findCommonAncestor = function(lvl) {
        if (this.parent != null) {
            if (this.parent.Level > lvl) {
                return this.parent.findCommonAncestor(lvl);
            }

            if (this.parent.level == lvl) {
                return this.parent;
            }
        }

        return null;
    };


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
        var index;

        //----------------------------------

        function convertList(lines, previous) {
            //Check if next line is still a list element
            if (index >= lines.length || !REGEX_LIST_TEST.test(lines[index])) {
                return previous;
            }

            var current = null;
            var text = lines[index];

            function createElement(regex, type, text) {
                var occur = regex.exec(text);
                if (occur != null) {
                    return new MarkdownElement(
                        type,
                        calculateLevel(occur[1].length),
                        occur[2]);
                }
            }

            //Create new element
            var elem = createElement(REGEX_ORDERED_LIST, LineType.ORDERED_LIST, text);
            if (elem == null) {
                elem = createElement(REGEX_UNORDERED_LIST, LineType.UNORDERED_LIST, text);
            }

            //A new list is starting
            if (previous === null) {
                current = new MarkdownList(elem.type, elem.level);
                current.parent = null;
                elem.parent = current;
                current.content.push(elem);
            }
            //The elements are siblings
            else if (previous.level == elem.level) {
                current = previous;
                elem.parent = current;
                current.content.push(elem);
            }
            //There is a new level on the list
            else if (previous.level < elem.level) {
                current = new MarkdownList(elem.type, elem.level);
                elem.parent = current;
                current.content.push(elem);
                
                previous.content.push(current);
                current.parent = previous;
            }
            //The element is from a lower level
            else if (previous.level > elem.level) {
                current = previous.findCommonAncestor(elem.level);
                
                // There is no sibling for this element. This is another list.
                if (current == null) {
                    index -= 1;
                    return previous;
                }
                //The sibling isn't from the same type. So, this is another list. 
                if (!elem.type.equals(current.type)) {
                    index -= 1;
                    return current;
                }
                elem.parent = current;
                current.content.push(elem);
            }

            index += 1;
            return convertList(lines, current);
        }

        function convertElement(text) {
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

            // If the line does not belong to any specific type, it is returned as a new paragraph
            line.type = LineType.PARAGRAPH;
            line.content = text;
            return line;
        }

        //----------------------------------

        Converter.convert = function(text) {
            var lines = text == null ? [] : text.split("\n");
            var length = lines.length;
            var output = [];
            index = 0;
            
            while(index < length) {
                if (REGEX_LIST_TEST.test(lines[index])) {
                    output.push(convertList(lines, null));
                }
                
                //console.log("lines["+index+"]="+lines[index]);
                if(!REGEX_LIST_TEST.test(lines[index])) {
                    output.push(convertElement(lines[index]));
                }
                index += 1;
            }

            //TEMP
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
