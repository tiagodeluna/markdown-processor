
describe('Markdown to HTML Converter library', function () {

    it('is correctly defined', function () {
        var instance = window.MarkdownConverter;

        expect(instance).toBeDefined();
        expect(instance.convert).toBeDefined();
    });



/*
    it('converts a Header lv 1', function () {
    	var text = "# Test";
    	var expected = "<h1>Test</h1>";

        expect(convertToHtml(text)).toEqual(expected);
    });
*/
/*
    it("throws an error when passed a null text", function () {
        var testFn = function () {
            convertToHtml(null);
        }
        expect(testFn).toThrow(new Error("unrecognized from-unit"));
    });
*/
});