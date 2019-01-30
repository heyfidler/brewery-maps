var seattle = "seattle";
var breweries = [];
var openBrewery = null;

function initMap() {
	
	
    var map = new google.maps.Map($("#map")[0], {
        zoom: 12,
        center: {
            lat: 0,
            lng: 0
        }
    });
	
	// set center to seattle
	getLocationByAddress(seattle, function(data) {
		map.setCenter(data);
	});
	
	populateBreweries(function(data) {
		data.forEach(function(brewery) {
			if (!brewery.latitude) {
				return;
			}
			var latLng = new google.maps.LatLng(brewery.latitude,brewery.longitude);
			var marker = new google.maps.Marker({
				position: latLng,
				map: map,
				title: brewery.name,
				animation: google.maps.Animation.DROP
			});
			
			var contentString  = '<h3>' + brewery.name + '</h3>' +
				'<a href="' + brewery.website_url + '">' + brewery.website_url + '</a>';
				
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});
			
			google.maps.event.addListener(infowindow,'closeclick',function(){
				brewery.marker.setAnimation(null);
			});

			brewery.infowindow = infowindow;
			
			brewery.openInfoWindow = function() {
				if (openBrewery) {
					openBrewery.infowindow.close();
					openBrewery.marker.setAnimation(null);
				}
				this.infowindow.open(map, marker);
				openBrewery = this;
				this.marker.setAnimation(google.maps.Animation.BOUNCE);
			}
			
			marker.addListener('click', function() {
				brewery.openInfoWindow();
			});
			
			brewery.marker = marker;
			breweries.push(brewery);
		});
		
		ko.applyBindings(new ViewModel());
		
		if (openBrewery) {
			openBrewery.infowindow.close();
			openBrewery.marker.setAnimation(null);
		}
	});
}

function ViewModel() {
	var self = this;
    self.searchInput = ko.observable("");
	
    self.filterList = ko.computed(function () {
		var visibleBreweries = [];
		if (self.searchInput() === '') {
			breweries.forEach(function(brewery) {
				brewery.marker.setVisible(true);
				visibleBreweries.push(brewery);
			});
		} else {
			breweries.forEach(function(brewery) {
				if (brewery.name.toLowerCase().includes(self.searchInput().toLowerCase())) {
					brewery.marker.setVisible(true);
					visibleBreweries.push(brewery);
				} else {
					brewery.marker.setVisible(false);
				}
			});
		}
		return visibleBreweries;
    }, this);
}

function populateBreweries(callback) {
	$.ajax({
		dataType: "json",
		url: "https://api.openbrewerydb.org/breweries?by_city=seattle&per_page=50",
		success: function (data) {
			callback(data);
		},
		error: function (data) {
			alert("Failed to load brewery data.");
		}
	});
}

function googleMapsError() {
	alert("Google Maps failed to load.");
}
		
function getLocationByAddress(address, callback) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({
        'address': address
    }, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			callback(results[0].geometry.location);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}