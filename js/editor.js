(function () {
    'use strict';

    angular.module('markdownEditor', ['ngSanitize'])
        .controller('MarkdownController', function ($scope, $http) {

        	$scope.markdown = {input: '', output: ''};
        	
        	$scope.update = function() {
        		$scope.markdown.output = window.MarkdownConverter.convert($scope.markdown.input);
        	};
        	
        	$scope.save = function() {
        		//TODO Save text
        	};

        });

})();