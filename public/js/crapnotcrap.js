(function ($) {

	function autoFocusNoResultsForm() {

		if ($(".no-results").length) {
			$("input[name=search]").focus();
		}
	}

	$(function () {
		autoFocusNoResultsForm();

		if (window.console && window.console.log) {
			console.log("Hey there, good looking. If you'd like to " +
					"contribute, visit " +
					"https://github.com/cgravolet/crapnotcrap");
		}
	});

}(jQuery));

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-41933192-1', 'crapnotcrap.com');
ga('send', 'pageview');
