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

	$.get('assets/data/maps.json', function(data) {
		var element = $('#maps'),
			placeholderContent = element.children().not('#' + element.attr('aria-labelledby') + ', #' + element.attr('aria-describedby')),
			maps,
			defaultZoom = 10;

		maps = data.maps;
		placeholderContent.replaceWith('<ul></ul>');

		maps.forEach(function(map) {
			var output;

			if (!map.zoom) {
				map.zoom = defaultZoom;
			}

			element.children('ul').append('<li data-contains="A map of ' + map.name + '"><dl class="map" data-name="A map of ' + map.name + '"><dt class="map-name">A map of ' + map.name + '</dt><dd class="map-content"></dd></dl></li>');
			
			output = new google.maps.Map(element.find('[data-name="A map of ' + map.name + '"] .map-content')[0], {
				zoom: map.zoom,
				center: map.center
			});

			if(map.polygon) {
				var polygonOutput = new google.maps.Polygon({
					paths: map.polygon,
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35
				});
				polygonOutput.setMap(output);
			}
		});
	});

	$('html').attr('data-js', 'true');
})(jQuery);