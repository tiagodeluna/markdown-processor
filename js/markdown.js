
var convertToHtml = (function(text) {
    var REGEX_HEADERS = /^#{1,6}/;
    var REGEX_ORDERED_LIST = null;
    var REGEX_UNORDERED_LIST = null;
    var REGEX_ITALIC_UNDERLINE = /_(?=\S)(.*?)(\S)_/g;
    var REGEX_ITALIC_ASTERISK = /\*(?=\S)(.*?)(\S)\*/g;
    var REGEX_BOLD_UNDERLINE = /__(?=\S)(.*?)(\S)__/g;
    var REGEX_BOLD_ASTERISK = /\*\*(?=\S)(.*?)(\S)\*\*/g;
    var REGEX_NOT_EMPHASYS_MARKS = /[^ _\*]/;
// Alternatives:
//    /__\B(.+?)\B__/g;
//    /__(.*?)(?=__)__/g;
//    /__(\S.+?\S)__/g;
//    /__(.+?)__/g;
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
                default:
                    break;
            }
            return opening + this.applyEmphasys(this.content) + closing;
        },

        applyEmphasys: function(text) {

            if (text != null && text.length > 0) {
                /* REPLACE BOLD AND ITALIC OCCURRENCES */
                return text.replace(REGEX_BOLD_UNDERLINE, boldReplacer)
                        .replace(REGEX_BOLD_ASTERISK, boldReplacer)
                        .replace(REGEX_ITALIC_UNDERLINE, italicReplacer)
                        .replace(REGEX_ITALIC_ASTERISK, italicReplacer);
            }

            return text;
        }
    };

    /* The auxiliary replacer functions receive the following REGEX attributes:
        - match: The full matched string
        - p1: The first parenthesized substring match
        - p2: The second parenthesized substring match
        - offset: The 0-based index of the match in the string (Omitted. Not necessary here)
        - text: The original string (Omitted. Not necessary here)
    */
    function boldReplacer(match, p1, p2) {
        return emphasysReplacer(match, p1, p2, "strong");
    }

    function italicReplacer(match, p1, p2) {
        return emphasysReplacer(match, p1, p2, "em");
    }

    function emphasysReplacer(match, p1, p2, element) {
        if (REGEX_NOT_EMPHASYS_MARKS.test(p1) || REGEX_NOT_EMPHASYS_MARKS.test(p2)) {
            return "<" + element + ">" + p1 + p2 + "</" + element + ">";
        }
        return match;
    }

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
                if (occur != null) {
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
        Becames: <h1></h1>, <h2></h2>, <h3></h3>, <h4></h4>, <h5></h5>, <h6></h6>

Emphasys:
    *asterisks*
    _underscores_
        Becames: <em></em>
    **asterisks**
    __underscores__
        Becames: <strong></strong>
        Obs: match combined emphasis. e.g: **asterisks and _underscores_**
    ~~Scratch this.~~
        Becames:
            in CSS: .strike {text-decoration: line-through;}
            in HTML: <span class="strike"></span>

------------------------------------------------------------

TEST CASE:
Eu __sou__ muito __esperto, hahahah__ Teste**!
Eu quero **marcar** e *italicar*, **marcar *e italicar***
Eu quero **marcar** e __*italicar*, **marcar *e italicar***__
__
________________
***********************

------------------------------------------------------------


Lists:
    * Item
    - Item
    + Item
        Becames: <ul><li></li></ul>
        Obs: To create a sublist, the "child" element must have 3 more spaces than its parent
    1. Item
        Becames: <ol><li></li></ol>
        Obs: The number sequence doesn't matter, but the first element defines the starting number.

Links:
    [link](https:...)
    [link]<https:...>
        Becames: <a href="http://...">link</a>

Links with reference:
    [link]
    AND
    [link]: (https:...) OR [link]: <https:...>
        Becames: <a href="http://...">link</a>

Html special characters:
    <, >, /
        Becames: 

Comments:
    [//]: # ()


References:
    REGEX:
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        https://www.w3schools.com/jsref/jsref_obj_regexp.asp
    MARKDOWN:
        https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
        https://guides.github.com/features/mastering-markdown/
        https://dillinger.io/
*/