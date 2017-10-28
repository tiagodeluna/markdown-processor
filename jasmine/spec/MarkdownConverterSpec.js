
describe('Markdown to HTML Converter library', function () {
    var instance = window.MarkdownConverter;

    it('is correctly defined', function () {
        expect(instance).toBeDefined();
        expect(instance.convert).toBeDefined();
    });

    it('converts a single line unmarked text into a paragraph', function () {
        expect(instance.convert("Test")).toEqual("<p>Test</p>");
    });

    it('converts multiple line unmarked text into two paragraphs', function () {
        expect(instance.convert("Line 1\nLine 2")).toEqual("<p>Line 1</p><p>Line 2</p>");
    });

    describe('converts Headers', function () {
        it('of levels 1 to 6', function () {
            expect(instance.convert("# Test")).toEqual("<h1>Test</h1>");
            expect(instance.convert("## Test")).toEqual("<h2>Test</h2>");
            expect(instance.convert("### Test")).toEqual("<h3>Test</h3>");
            expect(instance.convert("#### Test")).toEqual("<h4>Test</h4>");
            expect(instance.convert("##### Test")).toEqual("<h5>Test</h5>");
            expect(instance.convert("###### Test")).toEqual("<h6>Test</h6>");
        });


        it('only up to 6th level', function () {
            expect(instance.convert("######## Test")).toEqual("<h6>## Test</h6>");
        });

    });

    describe('converts emphases', function () {
        it('of the italic type', function () {
            //In a paragraph
            expect(instance.convert("*Test*")).toEqual("<p><em>Test</em></p>");
            expect(instance.convert("_Test_")).toEqual("<p><em>Test</em></p>");
            //In a header
            expect(instance.convert("## *Test*")).toEqual("<h2><em>Test</em></h2>");
            //With multiple occurrences using both '*' and '_'
            expect(instance.convert("It's a *clever* test, _very, very_ clever!"))
                .toEqual("<p>It's a <em>clever</em> test, <em>very, very</em> clever!</p>");
        });

        it('of the bold type', function () {
            //In a paragraph
            expect(instance.convert("Unit **test**")).toEqual("<p>Unit <strong>test</strong></p>");
            //In a header
            expect(instance.convert("## **Test**")).toEqual("<h2><strong>Test</strong></h2>");
            //With multiple occurrences using both '**' and '__'
            expect(instance.convert("It's a **clever** test, __very, very__ clever**!"))
                .toEqual("<p>It's a <strong>clever</strong> test, <strong>very, very</strong> clever**!</p>");
        });

        it('of mixed types', function () {
            //Case 1
            expect(instance.convert("I want to **mark** the *following* text with **bold *and italic***"))
                .toEqual("<p>I want to <strong>mark</strong> the <em>following</em> text with <strong>bold <em>and italic</em></strong></p>");
            //Case 2
            expect(instance.convert("I want to mark with **bold** and __*italic*, **bold *and italic***__"))
                .toEqual("<p>I want to mark with <strong>bold</strong> and <strong><em>italic</em>, <strong>bold <em>and italic</em></strong></strong></p>");
        });

        it('but ignores sequences of the same markdown empasis char', function () {
            //Case 1
            expect(instance.convert("________________")).toEqual("<p>________________</p>");
            //Case 2
            expect(instance.convert("***********************")).toEqual("<p>***********************</p>");
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