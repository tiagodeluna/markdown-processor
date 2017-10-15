
var convertToHtml = (function(text) {
    var REGEX_HEADERS = /^#{1,6}/;
    var REGEX_ORDERED_LIST = null;
    var REGEX_UNORDERED_LIST = null;
    var REGEX_ITALICS = /_\B(.+?)\B_/;
    var REGEX_BOLD = /__\B(.+?)\B__/;
    var REGEX_STRIKE = null;

    var LineType = {
        EMPTY: 1,
        HEADER: 2,
        PARAGRAPH: 3,
        UNORDERED_LIST: 4,
        ORDERED_LIST: 5,
        QUOTE: 6,
        ITALICS: 7,
        BOLD: 8
    };

    var ListPosition = {
        FIRST: 1,
        MIDDLE: 2,
        LAST: 3
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
                    if (this.position === ListPosition.FIRST) {
                        opening = "<ul>";
                    }
                    opening += "<li>";
                    closing = "</li>";
                    if (this.position === ListPosition.LAST) {
                        closing += "</ul>";
                    }
                    break;
                case LineType.ORDERED_LIST:
                    if (this.position === ListPosition.FIRST) {
                        opening = "<ol>";
                    }
                    opening += "<li>";
                    closing = "</li>";
                    if (this.position === ListPosition.LAST) {
                        closing += "</ol>";
                    }
                    break;
                case LineType.QUOTE:
                    opening = "<quote>";
                    closing = "</quote>";
                    break;
                case LineType.ITALICS:
                    opening = "<em>";
                    closing = "</em>";
                    break;
                case LineType.BOLD:
                    opening = "<strong>";
                    closing = "</strong>";
                    break;
                default:
                    break;
            }
            return opening + this.applyEmphasys(this.content) + closing;
        },

        applyEmphasys: function(text) {
            if (text != null && text.length > 0) {
                var occur = REGEX_BOLD.exec(text);
                if (occur != null && occur.length > 0) {
                    //Instantiate a new "BOLD" element
                    var element = Object.create(MarkdownElement);
                    element.type = LineType.BOLD;
                    element.content = occur[1];
                    //Get the text before and after the emphasys content
                    var before = text.substr(0,occur.index);
                    var after = text.substr(occur.index+occur[0].length);

                    return before + element + this.applyEmphasys(after);
                }
            }

            return text;
        }
    };

    return function (text) {
        var lines = text == null ? [] : text.split("\n");
        var output = [];
        var emptyLnCounter = 0;
        
        var len = lines.length;
        for (var i = 0; i < len; i += 1) {
            //Create a new line and identify its type using Regex
            var line = Object.create(MarkdownElement);

            if (lines[i].trim().length == 0) {
                /* JUMP LINE */
                emptyLnCounter += 1;
                if (emptyLnCounter > 1) {
                    line.type = LineType.EMPTY;
                    output.push(line);
                }
            } else {
                emptyLnCounter = 0;

                /* FIND HEADERS */
                var occur = REGEX_HEADERS.exec(lines[i]);
                if (occur != null && occur.length > 0) {
                    line.type = LineType.HEADER;
                    line.level = occur[0].length;
                    line.content = lines[i].substr(line.level).trim();
                    output.push(line);
                } else {
                    // TODO: Other rules!
                    line.type = LineType.PARAGRAPH;
                    line.content = lines[i];
                    output.push(line);
                }

            }
        }

        //Join the output array into a single string, implicitly
        // calling the toString() method of each line
        return output.join("");
    }
})();


/*
MARKDOWN ELEMENTS TO PARSE

Headers:
    # (H1) to ###### (H6)
        RegEx: /^#+/
        Becames: <h1></h1>, <h2></h2>, <h3></h3>, <h4></h4>, <h5></h5>, <h6></h6>

Emphasys:
    *asterisks*
    _underscores_
        RegEx:
        Becames: <em></em>
    **asterisks**
    __underscores__
        Regex:
        /
        /__[.]+__/
        Becames: <strong></strong>
        Obs: match combined emphasis. e.g: **asterisks and _underscores_**
    ~~Scratch this.~~
        Regex:
        Becames:
            in CSS: .strike {text-decoration: line-through;}
            in HTML: <span class="strike"></span>

Lists:
    * Item
    - Item
    + Item
        RegEx: 
        Becames: <ul><li></li></ul>
        Obs: To create a sublist, the "child" element must have 3 more spaces than its parent
    1. Item
        RegEx: 
        Becames: <ol><li></li></ol>
        Obs: The number sequence doesn't matter, but the first element defines the starting number.

Links:
    [link](https:...)
    [link]<https:...>
        RegEx:
        Becames: <a href="http://...">link</a>

Links with reference:
    [link]
    AND
    [link]: (https:...) OR [link]: <https:...>
        RegEx:
        Becames: <a href="http://...">link</a>

Html special characters:
    <
    >
    /
        RegEx:
        Becames: 

Comments:
    [//]: # ()


References:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    https://www.w3schools.com/jsref/jsref_obj_regexp.asp
    https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
    https://guides.github.com/features/mastering-markdown/
    https://dillinger.io/
*/