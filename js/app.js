/* globals ko, $, google */

// location details
var initialLocations = [
	{
		name: 'Coffee Day Square',
		lat: 12.971710158360747,
		long: 77.59426295757294
	},
	{
		name: 'Kanteerava Stadium',
		lat: 12.968888073780606,
		long: 77.59305077122657
	},
	{
		name: 'Cubbon Park',
		lat: 12.973826,
		long: 77.590591
	},	
	{
		name: 'JW Marriott Hotel',
		lat: 12.972361772490226,
		long: 77.59505132638924
	},
	{
		name: 'E-zone Club',
		lat: 12.9715987,
		long: 77.5945627
	},
	{
		name: 'UB City',
		lat: 12.971814708809388,
		long: 77.5958776473999
	},
	{
		name: 'Nandhini Hotel',
		lat: 12.971606,
		long: 77.594376
	},
	{
		name: 'The Spa',
		lat: 12.972255391198582,
		long:77.5949981130845
	},
	{
		name: 'Lalbhah Park',
		lat: 12.9507,
		long: 77.5848
	},	
	{
		name: 'Domino Pizza',
		lat: 12.972,
		long: 77.595
	},
	{
		name: 'Spice Terrace',
		lat: 12.972215818586362,
		long: 77.59527790082187
	},
	{
		name: 'JW Fitness',
		lat: 12.972546384278946,
		long: 77.59455604704627
	},
	{
		name: 'Ulsoor Park',
		lat: 12.975418,
		long: 77.617465
	},
	{
		name: 'Shell Fuel Station',
		lat: 12.971199078769294,
		long: 77.59728116076413
	},
	{
		name: 'Freedom Park',
		lat: 12.9775,
		long: 77.5816
	}
];


// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;



var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.street = "";
	this.city = "";

	this.visible = ko.observable(true);
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118';

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.street = results.location.formattedAddress[0];
		self.city = results.location.formattedAddress[1];

	}).fail(function() {
		alert("There was an error with the Foursquare API call.");
	});


	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div></div>";
	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);


	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

        self.infoWindow.setContent(self.contentString);
		self.infoWindow.open(map, this);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 3000);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;
	this.searchTerm = ko.observable("");
	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
				zoom: 15,
				center: {lat: 12.9715987, lng: 77.5945627}
	});

	// Client ID for Fourt Square
	clientID = "VQYIUNH5FOSSQADJMRTMISRCGIK2UJYBQITZD2H3FKW3300B";
	clientSecret = "QUWRFVNB3SRPUIAVFQE4Y1AS2SB1JMIXBIZTHP3HHJYFMCTR";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}


// error handler
function errorHandling() {
	alert("Failed to load the Google maps.");
}


// application start up
function appStart() {
	ko.applyBindings(new AppViewModel());
}
