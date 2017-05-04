/* global google */
/* global Vue */
/* global $ */

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: 40.730610, lng: -73.935242},
    zoom: 10
  });

  new AutocompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'BICYCLING';
  var originInput = document.getElementById('origin-input');
  var destinationInput = document.getElementById('destination-input');
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplay = new google.maps.DirectionsRenderer;
  this.directionsDisplay.setMap(map);

  var originAutocomplete = new google.maps.places.Autocomplete(originInput, {placeIdOnly: true});
  var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {placeIdOnly: true});

  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
}

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });
};


AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route({
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    travelMode: this.travelMode
  }, function(response, status) {
    if (status === 'OK') {
      displayMiles(response);
      getWeather(getOriginLat(response), getOriginLng(response));
      console.log(response);
      me.directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

function displayMiles(response) {
  var meters = response.routes[0].legs[0].distance.value;
  var miles = getMiles(meters);
  document.getElementById('rideMiles').innerHTML = miles;
}

function getMiles(meters) {
  return (meters * 0.00062137).toFixed(2);
}

function getInstructions(stepsArray) {
  var stepArray = [];
  for (var i = 0; i < stepsArray.length; i++) {
    stepArray.push(stepsArray[i]['instructions']);
  }
}

function getOriginLat(response) {
  return response.routes[0].legs[0].start_location.lat().toFixed(6);
}

function getOriginLng(response) {
  return response.routes[0].legs[0].start_location.lng().toFixed(6);
}

function getWeather(lat, lng) {
  $.get("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text='(" + lat + "," + lng + ")')&format=json", function(response) {
    var forecast = response.query.results.channel.item.forecast[0];
    document.getElementById('weather_box').innerHTML = '<p>' + forecast.date + '</p>' + '<p>' + "High: " + forecast.high + '</p>' + '<p>' + "Low: " + forecast.low + '</p>' + '<p>' + forecast.text + '</p>';
    console.log(response);
  });
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      inProgressRides: []
    },
    methods: {
      createRide: function() {
        var parameters = {
          starting_location: this.newOrigin,
          ending_location: this.newDestination,
          miles: parseFloat(document.querySelector('#rideMiles').innerHTML),
          in_progress: true,
          finished: false,
          user_id: parseInt(document.querySelector('#user-id').innerHTML),
          top_five: false
        };
        $.post('api/v1/rides', parameters, function(response) {
          console.log(response);
          this.inProgressRides.push(response);
        }.bind(this));
      },
      finishRide: function() {
        console.log("Change ride from in progress to completed");
        $.ajax({
          url: 'api/v1/rides/' + this.inProgressRides[0].id, 
          method: "PUT",
          success: function(data) {
            alert('Load was performed.');
          }
        });
      }
    },
    mounted: function() {
      console.log("populate rides array with inprogress rides");
    }

  });
});



