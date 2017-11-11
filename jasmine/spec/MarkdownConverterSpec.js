
describe("Markdown to HTML Converter library", function () {
    var instance = window.MarkdownConverter;

    it("should be correctly defined", function () {
        expect(instance).toBeDefined();
        expect(instance.convert).toBeDefined();
    });

    it("should convert a single line unmarked text into a paragraph", function () {
        expect(instance.convert("Test")).toEqual("<p>Test</p>");
    });

    it("should convert multiple line unmarked text into two paragraphs", function () {
        expect(instance.convert("Line 1\nLine 2")).toEqual("<p>Line 1</p><p>Line 2</p>");
    });

    describe("when text is marked as a header", function () {
        it("should convert it into an HTML header of level 1 to 6", function () {
            expect(instance.convert("# Test")).toEqual("<h1>Test</h1>");
            expect(instance.convert("## Test")).toEqual("<h2>Test</h2>");
            expect(instance.convert("### Test")).toEqual("<h3>Test</h3>");
            expect(instance.convert("#### Test")).toEqual("<h4>Test</h4>");
            expect(instance.convert("##### Test")).toEqual("<h5>Test</h5>");
            expect(instance.convert("###### Test")).toEqual("<h6>Test</h6>");
        });


        it("should convert it into an HTML header only up to 6th level", function () {
            expect(instance.convert("######## Test")).toEqual("<h6>## Test</h6>");
        });

    });

    describe("when text contains emphases marks", function () {
        it("should convert italic emphasis", function () {
            //In a paragraph
            expect(instance.convert("*Test*")).toEqual("<p><em>Test</em></p>");
            expect(instance.convert("_Test_")).toEqual("<p><em>Test</em></p>");
            //In a header
            expect(instance.convert("## *Test*")).toEqual("<h2><em>Test</em></h2>");
            //With multiple occurrences using both '*' and '_'
            expect(instance.convert("It's a *clever* test, _very, very_ clever!"))
                .toEqual("<p>It's a <em>clever</em> test, <em>very, very</em> clever!</p>");
        });

        it("should convert bold emphasis", function () {
            //In a paragraph
            expect(instance.convert("Unit **test**")).toEqual("<p>Unit <strong>test</strong></p>");
            //In a header
            expect(instance.convert("## **Test**")).toEqual("<h2><strong>Test</strong></h2>");
            //With multiple occurrences using both '**' and '__'
            expect(instance.convert("It's a **clever** test, __very, very__ clever**!"))
                .toEqual("<p>It's a <strong>clever</strong> test, <strong>very, very</strong> clever**!</p>");
        });

        it("should convert mixed type emphases", function () {
            //Case 1
            expect(instance.convert("I want to **mark** the *following* text with **bold *and italic***"))
                .toEqual("<p>I want to <strong>mark</strong> the <em>following</em> text with <strong>bold <em>and italic</em></strong></p>");
            //Case 2
            expect(instance.convert("I want to mark with **bold** and __*italic*, **bold *and italic***__"))
                .toEqual("<p>I want to mark with <strong>bold</strong> and <strong><em>italic</em>, <strong>bold <em>and italic</em></strong></strong></p>");
        });

        it("ignores sequences of the same markdown empasis char", function () {
            //Case 1 - Using '_' marker
            expect(instance.convert("________________")).toEqual("<p>________________</p>");
            //Case 2 - Using '*' marker
            expect(instance.convert("***********************")).toEqual("<p>***********************</p>");
        });

    });

    describe("when text contains elements with list marks", function () {
        it("should convert elements marked as ordered list (i.e. '1. Foo') appropriately", function () {
            //Case 1 - Single level list
            expect(instance.convert("1. test 1\n2. test 2")).toEqual("<ol><li>test 1</li><li>test 2</li></ol>");
            //Case 2 - Multilevel level list
            expect(instance.convert("1. test 1\n   1. test 1.1\n   1. test 1.2")).toEqual("<ol><li>test 1</li><ol><li>test 1.1</li><li>test 1.2</li></ol></ol>");
            expect(instance.convert("1. test 1\n    1. test 1.1\n      1. test 1.1.1")).toEqual("<ol><li>test 1</li><ol><li>test 1.1</li><ol><li>test 1.1.1</li></ol></ol></ol>");
            //Case 3 - With random numeric markers
            expect(instance.convert("99. test 1\n1000. test 2")).toEqual("<ol><li>test 1</li><li>test 2</li></ol>");
            //Case 4 - Multilevel level list w/ last element on first level
            expect(instance.convert("1. test 1\n   1. test 1.1\n1. test 2")).toEqual("<ol><li>test 1</li><ol><li>test 1.1</li></ol><li>test 2</li></ol>");
        });


        it("should convert elements marked as unordered list (i.e. '* Foo') appropriately", function () {
            //Case 1 - Single level list with same marker ('*')
            expect(instance.convert("* test 1\n* test 2")).toEqual("<ul><li>test 1</li><li>test 2</li></ul>");
            //Case 2 - List with mixed markers ('*', '-', '+')
            expect(instance.convert("* test 1\n- test 2\n+ test 3")).toEqual("<ul><li>test 1</li><li>test 2</li><li>test 3</li></ul>");
            //Case 3 - Multilevel level list w/ 2 levels
            expect(instance.convert("- test 1\n   - test 1.1\n   - test 1.2")).toEqual("<ul><li>test 1</li><ul><li>test 1.1</li><li>test 1.2</li></ul></ul>");
            //Case 4 - Multilevel level list w/ 3 levels
            expect(instance.convert("* test 1\n    - test 1.1\n      + test 1.1.1")).toEqual("<ul><li>test 1</li><ul><li>test 1.1</li><ul><li>test 1.1.1</li></ul></ul></ul>");
            //Case 5 - Multilevel level list w/ last element on first level
            expect(instance.convert("* test 1\n   - test 1.1\n* test 2")).toEqual("<ul><li>test 1</li><ul><li>test 1.1</li></ul><li>test 2</li></ul>");
        });

        it("should convert elements marked with both list type marks appropriately", function () {
            //Case 1 - Ordered list with unordered subitems
            expect(instance.convert("1. test 1\n   - test 1.1\n    - test 1.2")).toEqual("<ol><li>test 1</li><ul><li>test 1.1</li><li>test 1.2</li></ul></ol>");
            //Case 2 - Unordered list with ordered subitems
            expect(instance.convert(" * test 1\n   1. test 1.1\n   1. test 1.2")).toEqual("<ul><li>test 1</li><ol><li>test 1.1</li><li>test 1.2</li></ol></ul>");
            //Case 3 - List of mixed types w/ last element on first level
            expect(instance.convert("* test 1\n   9. test 1.1\n* test 2")).toEqual("<ul><li>test 1</li><ol><li>test 1.1</li></ol><li>test 2</li></ul>");
            //Case 4 - Elements in the same level but from different types
            expect(instance.convert("* test 1\n    - test 1.1\n1. test 1")).toEqual("<ul><li>test 1</li><ul><li>test 1.1</li></ul></ul><ol><li>test 1</li></ol>");
        });

    });

    describe("when text contains links to URLs", function () {
        it("should convert it to HTML links", function () {
            //Case 1 - Paragraph with a link
            expect(instance.convert("Please click [here]<http://www.google.com/>"))
                .toEqual("<p>Please click <a href=\"http://www.google.com/\">here</a></p>");
            //Case 2 - Paragraph with two links
            expect(instance.convert("Please click [here]<http://www.google.com/> or [here]<http://www.bing.com/>"))
                .toEqual("<p>Please click <a href=\"http://www.google.com/\">here</a> or <a href=\"http://www.bing.com/\">here</a></p>");
            //Case 3 - Text with link and emphasis
            expect(instance.convert("Please *click [here to go to **Google**]<http://www.google.com/>*"))
                .toEqual("<p>Please <em>click <a href=\"http://www.google.com/\">here to go to <strong>Google</strong></a></em></p>");
            //Case 4 - Links in a list
            expect(instance.convert("* [Google]<http://www.google.com/>\n* The other, [Bing]<http://www.bing.com/>"))
                .toEqual("<ul><li><a href=\"http://www.google.com/\">Google</a></li><li>The other, <a href=\"http://www.bing.com/\">Bing</a></li></ul>");
        });
    });

/*
    it("throws an error when passed a null text", function () {
        var testFn = function () {
            convertToHtml(null);
        }
        expect(testFn).toThrow(new Error("unrecognized from-unit"));
    });
*/
});