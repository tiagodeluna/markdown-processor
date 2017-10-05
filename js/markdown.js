var REGEX_HEADERS = /^#+/,
	REGEX_ORDERED_LIST = null,
	REGEX_UNORDERED_LIST = null,
	REGEX_ITALICS = null,
	REGEX_BOLD = null,
	REGEX_STRIKE = null;

var Line = function() {

};

function convertToHtml(text) {
	var lines = text == undefined ? [] : text.split('\n');
	var output = '';
	var emptyLnCounter = 0;
	
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var trimLine = line.trim();

		if (trimLine.length == 0) {
			/* JUMP LINE */
			emptyLnCounter++;
			if (emptyLnCounter > 1) {
				output += '<br />';
			}
		} else {
			emptyLnCounter = 0;
			var starting, content, ending;

			/* FIND HEADERS */
			var occur = REGEX_HEADERS.exec(line);
			if (occur != null && occur.length > 0) {
				var level = occur[0].length >= 6 ? 6 : occur[0].length;
				starting = '<h'+level+'>';
				content = line.substr(level);
				ending = '</h'+level+'>';
			} else {
				// TODO: Other rules!
				starting = '<p>';
				content = line;
				ending = '</p>';
			}

			output += starting + content + ending;
		}
	}
	
	return output;
}

/*
MARKDOWN ELEMENTS TO PARSE

Headers:
	# H1
	## H2
	### H3
	#### H4
	##### H5
	###### H6
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
		Obs: To create a sublist, the 'child' element must have 3 more spaces than its parent
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