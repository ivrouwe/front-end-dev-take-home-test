(function($) {
	function populateElement(selector, content) {
		var element = $(selector),
			placeholderContent = element.children().not('#' + element.attr('aria-labelledby') + ', #' + element.attr('aria-describedby'));
			
			if (placeholderContent.length) {
				placeholderContent.replaceWith(content);
			} else {
				element.append(content);
			}
	}

	function templateContent(template, data) {
		return $.parseHTML(Handlebars.compile(template)(data));
	}

	$.get('assets/data/terms.json', function(terms) {
		$.get('templates/terms-list.handlebars', function(termsList) {
			populateElement('#photo-gallery', templateContent(termsList, terms));
		});
	});

	$.get('assets/data/maps.json', function(data) {
		var element = $('#maps'),
			maps = data.maps,
			defaultZoom = 10;

		if(!element.children('.maps-list').length) {
			populateElement('#maps', '<ul class="maps-list"></ul>');
		}

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

	$.get('assets/data/maps-preformatted.json', function(data) {
		var element = $('#maps'),
			maps = data.resto,
			defaultZoom = 11;

		if(!element.children('.maps-list').length) {
			populateElement('#maps', '<ul class="maps-list"></ul>');
		}

		maps.forEach(function(map) {
			var output,
				name = 'Untitled Map';

			if(map.location.title && map.location.title !== '') {
				name = "A map of " + map.location.title;

				if(map.nearby_restaurants) {
					name = "A map of restaurants near " + map.location.title;
				}

				if(map.location.city_name && map.location.city_name !== '') {
					name += ' in ' + map.location.city_name;
				}

				if(map.location.country_name && map.location.country_name !== '') {
					name += ' (' + map.location.country_name + ')';
				}

			}

			if (!map.location.zoom) {
				map.location.zoom = defaultZoom;
			}

			element.children('ul').append('<li data-contains="' + name + '"><dl class="map" data-name="' + name + '"><dt class="map-name">' + name + '</dt><dd class="map-content"></dd></dl></li>');
			
			output = new google.maps.Map(element.find('[data-name="' + name + '"] .map-content')[0], {
				zoom: map.location.zoom,
				center: {
					lat: parseFloat(map.location.latitude),
					lng: parseFloat(map.location.longitude)
				}
			});
		});
	});

	$('html').attr('data-js', 'true');
})(jQuery);