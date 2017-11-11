(function(window){
    /* Advantages of "strict mode":
        - Eeliminates some JavaScript silent errors by changing them to throw errors
        - Fixes mistakes that make it difficult for JavaScript engines to perform optimizations
        - Third, strict mode prohibits some syntax likely to be defined in future versions of ECMAScript */
    "use strict";

    // AUXILIARY CLASSES
    //The regular expressions for markdown elements
    var REGEX_HEADERS = /^#{1,6}/;
    var REGEX_LIST_TEST = /^\s*(?:(\d+\.)|\*|\+|\-)\s+.+/;
    var REGEX_ORDERED_LIST = /^(\s*)\d+\.\s+(.+)/;
    var REGEX_UNORDERED_LIST = /^(\s*)(?:\*|\+|\-)\s+(.+)/;
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
    //var REGEX_LINK = /\[(.+)\](?:\(|\<)(.+)(?:\)|\>)/;
    var REGEX_LINK = /\[(.+?)(?=\])\](?:\(|\<)(.+?)(?:\)|\>)/;
    var REGEX_BLOCK = /\[(.+?)(?=\])(.+)/;
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
                return "<br />";
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

        return opening + this.inlineConversion(this.content) + closing;
    };

    MarkdownElement.prototype.inlineConversion = function(content, index = 0) {
        var text = content.substr(index);
        var p1 = "",
            p2,
            p3 = "";

        /* FIND LINK */
        var occur = REGEX_LINK.exec(text);
        if (occur != null) {
            /* FIND EMPHASIS */
            p1 = this.applyEmphasis(text.substr(0, occur.index));
            //Create an HTML link with the URL and Description found
            p2 = "<a href=\"" + encodeURL(occur[2].trim()) + "\">" + this.applyEmphasis(occur[1]) + "</a>";
            console.log(p2);
            //Look for new links in the line
            p3 = this.inlineConversion(text, occur.index + occur[0].length);
        }
        else {
            p2 = text;
        }

        /* FIND EMPHASIS */
        return this.applyEmphasis(p1 + p2 + p3);
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
    function MarkdownList(type, level) {
        MarkdownElement.call(this, type, level, [], null);
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

        var len = this.content.length;
        for(var i = 0; i < len; i += 1) {
            elements += this.content[i];
        }
        return opening + elements + closing;
    };

    MarkdownList.prototype.findCommonAncestor = function(lvl) {
        if (this.parent != null) {
            if (this.parent.level > lvl) {
                return this.parent.findCommonAncestor(lvl);
            }

            if (this.parent.level == lvl) {
                return this.parent;
            }
        }

        return null;
    };

    MarkdownList.prototype.calculateLevel = function(spaces) {
        return Math.trunc(spaces / 3) + 1;
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

    //Encodes URI special characters (except: , / ? : @ & = + $ # _ *)
    // and characters that can be mistaken for Markdown notation
    function encodeURL(url) {
        //URI encoding
        var newURI = encodeURI(url);
        //Markdown characters encoding
        return newURI.replace(/\_/g, "%5F")
            .replace(/\*/g, "%2A");
    }

    //Creates an instance of the library
    function define_converter() {
        //The Converter object
        var Converter = {};
        var index;

        function convertList(lines, previous) {
            //Check if next line is still a list element
            if (index >= lines.length || !REGEX_LIST_TEST.test(lines[index])) {
                return previous;
            }

            //Try to create a list element based on the regex execution results
            function createElementFromRegex(regex, type, text) {
                var occur = regex.exec(text);
                if (occur != null) {
                    return new MarkdownElement(
                        type,
                        MarkdownList.prototype.calculateLevel(occur[1].length),
                        occur[2]);
                }
            }

            var currentList;

            //Create new element
            var data = createElementFromRegex(REGEX_ORDERED_LIST, LineType.ORDERED_LIST, lines[index]);
            if (data == null) {
                data = createElementFromRegex(REGEX_UNORDERED_LIST, LineType.UNORDERED_LIST, lines[index]);
            }

            //A new list is starting
            if (previous === null) {
                currentList = new MarkdownList(data.type, data.level);
                currentList.parent = null;
                data.parent = currentList;
                currentList.content.push(data);
            }
            //The new element and the previous are siblings
            else if (previous.level === data.level) {
                //The sibling isn't from the same type. So we need to get out and start a new list.
                if (previous.type !== data.type) {
                    index -= 1;
                    return previous;
                }

                currentList = previous;
                data.parent = currentList;
                currentList.content.push(data);
            }
            //There is a new level on the list
            else if (previous.level < data.level) {
                currentList = new MarkdownList(data.type, data.level);
                data.parent = currentList;
                currentList.content.push(data);
                
                currentList.parent = previous;
                previous.content.push(currentList);
            }
            //The element is from a lower level
            else if (previous.level > data.level) {
                currentList = previous.findCommonAncestor(data.level);
                
                // There is no sibling for this element. So we need to get out and start a new list.
                if (currentList == null) {
                    index -= 1;
                    return previous;
                }
                //The ancestor isn't from the same type. So we need to get out and start a new list.
                if (data.type !== currentList.type) {
                    index -= 1;
                    return currentList;
                }
                data.parent = currentList;
                currentList.content.push(data);
            }

            //Convert next line passing the current element as a reference
            index += 1;
            currentList = convertList(lines, currentList);
            //Return the list's basis, the element with the lowest level
            var rootElement = currentList.findCommonAncestor(1);
            return rootElement != null ? rootElement : currentList;
        }

        //Create a new line and identify its type using Regex
        function convertElement(text) {

            /* JUMP LINE */
            if (text.trim().length == 0) {
                return new MarkdownElement(LineType.EMPTY);
            }

            /* FIND HEADERS */
            var occur = REGEX_HEADERS.exec(text);
            if (occur != null) {
                var level = occur[0].length;
                return new MarkdownElement(
                    LineType.HEADER,
                    level,
                    text.substr(level).trim());
            } 

            // If the line does not belong to any specific type, it is returned as a new paragraph
            return new MarkdownElement(LineType.PARAGRAPH, 1, text);
        }

        Converter.convert = function(text) {
            var lines = text == null ? [] : text.split("\n");
            var length = lines.length;
            var output = [];
            index = 0;
            
            while(index < length) {
                //Convert list elements
                if (REGEX_LIST_TEST.test(lines[index])) {
                    output.push(convertList(lines, null));
                }
                //Convert all other types of elements
                if(index < length && !REGEX_LIST_TEST.test(lines[index])) {
                    output.push(convertElement(lines[index]));
                }
                index += 1;
            }

            //TEMP: Remove it
            //console.log(output.join(""));

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
