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
			defaultZoom = 13;

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

			element.children('ul').append('<li data-contains="' + name + '"><dl class="map" data-name="' + name + '" aria-live="polite"><dt class="map-name">' + name + '</dt><dd class="map-content"></dd></dl></li>');
			
			output = new google.maps.Map(element.find('[data-name="' + name + '"] .map-content')[0], {
				zoom: map.location.zoom,
				center: {
					lat: parseFloat(map.location.latitude),
					lng: parseFloat(map.location.longitude)
				}
			});

			if(map.nearby_restaurants) {
				map.nearby_restaurants.forEach(function(object) {
					var restaurant = object.restaurant,
						marker,
						infoWindow,
						infoWindowContent;

					// Create a Marker for each Restaurant in the array
					marker = new google.maps.Marker({
						position: new google.maps.LatLng(parseFloat(restaurant.location.latitude), parseFloat(restaurant.location.longitude)),
						icon: 'https://maps.google.com/mapfiles/kml/pal2/icon40.png',
						map: output
					});

					marker.addListener('click', function() {
						var restaurantData,
							cuisines,
							priceRange,
							index;

						// Build an infowindow and display the Restaurant's data
						if(restaurant.name && restaurant.id && restaurant.name !== '' && restaurant.id !== null) {
							infoWindowContent = $(document.createElement('article'));
							infoWindowContent.addClass('info-window');
							infoWindowContent.addClass('restaurant');
							infoWindowContent.attr('id', 'restaurant-' + restaurant.id.trim());
							infoWindowContent.attr('aria-labelledby', 'restaurant-' + restaurant.id.trim() + '-heading');

							if(restaurant.thumb && restaurant.thumb !== '') {
								infoWindowContent.append('<header><h1 id="' + 'restaurant-' + restaurant.id.trim() + '-heading">' + restaurant.name + '</h1></header>');

								if(restaurant.featured_image && restaurant.featured_image !== '') {
									infoWindowContent.children('header').append('<a href="' + restaurant.featured_image.trim() + '"><img src="' + restaurant.thumb.trim() + '" alt="View Featured Image"></a>');
								} else {
									infoWindowContent.children('header').append('<div class="restaurant-thumbnail"><img src="' + restaurant.thumb.trim() + '" alt="" role="presentation"</div>');
								}
							} else {
								infoWindowContent.append('<h1 id="' + 'restaurant-' + restaurant.id.trim() + '-heading">' + restaurant.name + '</h1>');
							}

							infoWindowContent.append('<dl class="restaurant-data"></dl>');
							
							restaurantData = infoWindowContent.children('.restaurant-data');

							if (restaurant.location.address && restaurant.location.address !== '') {
								restaurantData.append('<dt>Address</dt>');
								restaurantData.append('<dd>' + restaurant.location.address.trim() + '</dd>');
							}

							if(restaurant.cuisines && restaurant.cuisines !== '') {
								cuisines = restaurant.cuisines.split(',');

								restaurantData.append('<dt>Cuisines</dt>');

								for(index = 0; index < cuisines.length; index++) {
									restaurantData.append('<dd>' + cuisines[index].trim() + '</dd>');
								}
							}

							if(restaurant.average_cost_for_two && restaurant.currency && restaurant.average_cost_for_two !== null && restaurant.currency !== '') {
								restaurantData.append('<dt>Average Cost (For Two)</dt>');
								restaurantData.append('<dd>' + restaurant.currency.trim() + parseFloat(restaurant.average_cost_for_two) + '</dd>');
							}

							if(restaurant.price_range && restaurant.price_range !== null) {
								if(restaurant.currency && restaurant.currency !== '') {
									priceRange = '';
									
									for (index = 0; index < parseInt(restaurant.price_range); index++) {
										priceRange += restaurant.currency.trim();
									}

									restaurantData.append('<dt>Price Range</dt>');
									restaurantData.append('<dd>' + priceRange + '</dd>');
								}
							}

							if(restaurant.offers && restaurant.offers.length) {
								restaurantData.append('<dt>Offers</dt>');

								for(index = 0; index < restaurant.offers.length; index++) {
									restaurantData.append('<dd>' + restaurant.offers[index].trim() + '</dd>');
								}
							}

							if(restaurant.user_rating
								 && restaurant.user_rating.aggregate_rating
								 && restaurant.user_rating.rating_text
								 && restaurant.user_rating.rating_color
								 && restaurant.user_rating.votes
								 && restaurant.user_rating.aggregate_rating !== ''
								 && restaurant.user_rating.rating_text !== ''
								 && restaurant.user_rating.rating_color !== ''
								 && restaurant.user_rating.votes !== '') {
								
								restaurantData.append('<dt>User Rating</dt>');
								restaurantData.append('<dd style="color: #' + restaurant.user_rating.rating_color.trim() + '">' + restaurant.user_rating.rating_text.trim() + '</dd>');
								restaurantData.append('<dd class="restaurant-data-user-rating-additional contains-dl"><dl></dl></dd>');
								restaurantData.children('.restaurant-data-user-rating-additional').children('dl').append('<dt>Aggregate Rating</dt>');
								restaurantData.children('.restaurant-data-user-rating-additional').children('dl').append('<dd>' + restaurant.user_rating.aggregate_rating.trim() + '</dd>');
								restaurantData.children('.restaurant-data-user-rating-additional').children('dl').append('<dt>Votes</dt>');
								restaurantData.children('.restaurant-data-user-rating-additional').children('dl').append('<dd>' + restaurant.user_rating.votes.trim() + '</dd>');
							}

							if((restaurant.url && restaurant.url !== '')
								 || (restaurant.menu_url && restaurant.menu_url !== '')
								 || (restaurant.photos_url && restaurant.photos_url !== '')
								 || (restaurant.events_url && restaurant.events_url !== '') ) {
								infoWindowContent.append('<aside class="restaurant-options"><ul></ul></aside>');
								infoWindowContent.children('.restaurant-options').attr('id', 'restaurant-' + restaurant.id.trim() + '-options');
								infoWindowContent.children('.restaurant-options').attr('aria-labelledby', 'restaurant-' + restaurant.id.trim() + '-options-heading');
								infoWindowContent.children('.restaurant-options').prepend('<h2 id="' + 'restaurant-' + restaurant.id.trim() + '-options-heading">Options For Further Action</h2>');
								
								if(restaurant.url && restaurant.url !== '') {
									infoWindowContent.children('.restaurant-options').children('ul').append('<li><a href="' + restaurant.url.trim() + '">View This Restaurant\'s Page On Zomato</a></li>');
								}

								if(restaurant.menu_url && restaurant.menu_url !== '') {
									infoWindowContent.children('.restaurant-options').children('ul').append('<li><a href="' + restaurant.menu_url.trim() + '">View This Restaurant\'s Menu On Zomato</a></li>');
								}

								if(restaurant.photos_url && restaurant.photos_url !== '') {
									infoWindowContent.children('.restaurant-options').children('ul').append('<li><a href="' + restaurant.photos_url.trim() + '">View This Restaurant\'s Photos On Zomato</a></li>');
								}

								if(restaurant.events_url && restaurant.events_url !== '') {
									infoWindowContent.children('.restaurant-options').children('ul').append('<li><a href="' + restaurant.events_url.trim() + '">View This Restaurant\'s Events On Zomato</a></li>');
								}

							}

							infoWindow = new google.maps.InfoWindow({
								content: infoWindowContent[0],
							});

							infoWindow.setOptions({maxWidth: 200});
							infoWindow.open(output, marker);
						}
					});
				});
			}
		});
	});

	$('html').attr('data-js', 'true');
})(jQuery);