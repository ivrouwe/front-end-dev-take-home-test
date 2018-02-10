(function($) {
	function populateElement(selector, template, data) {
		var element = $(selector),
			placeholderContent = element.children().not('#' + element.attr('aria-labelledby') + ', #' + element.attr('aria-describedby')),
			content = $.parseHTML(Handlebars.compile(template)(data));

		placeholderContent.replaceWith(content);
	}

	$.get('assets/data/terms.json', function(terms) {
		$.get('templates/terms-list.handlebars', function(termsList) {
			populateElement('#photo-gallery', termsList, terms);
		});
	});

	$('html').attr('data-js', 'true');
})(jQuery);