# TODO

## General

* **(done)** Turn markdownConverter into a library
* Solve failed emphasis test cases
* Implement test cases for all elements
* Implement the conversion of the rest of the elements below

## Markdown Elements to Parse

* **(done)** Headers: `#` ... `######` to `<h1></h1>` ... `<h6></h6>`
* **(done)** Italic: `*asterisks*` to `<em></em>`
* **(done)** Strong: `**asterisks**` to `<strong></strong>`
* Scratch: `~~Scratch this.~~` to:
    - in CSS: `.strike {text-decoration: line-through;}`
    - in HTML: `<span class="strike"></span>`
* **(done)** Unordered list: `* Item`, `- Item` or `+ Item` to `<ul><li></li></ul>`
    - *Obs: To create a sublist, the "child" element must have 3 more spaces than its parent*
* **(done)** Ordered list: `1. Item` to `<ol><li></li></ol>`
    - *Obs: The number sequence doesn't matter, but the first element defines the starting number*
* Links: `[link](https:...)` or `[link]<https:...>` to `<a href="http://...">link</a>`
* Links with reference: `[link]` **and** `[link]: (https:...)` **or** `[link]: <https:...>` to `<a href="http://...">link</a>`
* Handle HTML special characters: `<`, `>`, `/`
* Handle markdown comments: `[//]: # ()`

------------------------------------------------------------

## Emphasis test cases:
```
Eu __sou__ muito __esperto, hahahah__ Teste**!
Eu quero **marcar** e *italicar*, **marcar *e italicar***
Eu quero **marcar** e __*italicar*, **marcar *e italicar***__
__
________________
***********************
```

------------------------------------------------------------

## References:
* REGEX:
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
    - https://www.w3schools.com/jsref/jsref_obj_regexp.asp
* MARKDOWN:
    - https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
    - https://guides.github.com/features/mastering-markdown/
    - https://dillinger.io/
* REGEX -> MARKDOWN:
    - https://gist.github.com/jbroadway/2836900
* Javascript Library:
    - https://code.tutsplus.com/tutorials/build-your-first-javascript-library--net-26796
* Unit testing Javascript:
    - https://code.tutsplus.com/tutorials/testing-your-javascript-with-jasmine--net-21229