(function($) {

	function populateElement(selector, rawTemplate, rawData) {
		var element = $(selector),
			placeholderChildren = element.children().not('#' + element.attr('aria-labelledby')),
			template = Handlebars.compile(rawTemplate),
			content = $.parseHTML(template(rawData));

		placeholderChildren.remove();
		element.append(content);
	}

	$.get('assets/data/photos.json', function(data) {
		var photoData = data;

		$.get('assets/templates/photo-gallery-list.handlebars', function(data) {
			populateElement('#photo-gallery', data, photoData);
		});
	});
})(jQuery);