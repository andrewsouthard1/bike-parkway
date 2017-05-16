/* global google */
/* global Vue */
/* global $ */

function initMap() {
  var styles = [
    {
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "landscape",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {}]

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: 40.7829, lng: -73.9654},
    styles: styles,
    zoom: 15
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
      displayStartButton();
      displayMiles(response);
      // getWeather(getOriginLat(response), getOriginLng(response));
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
  document.getElementById('milesBox').style.display = 'block';
}

function displayStartButton() {
  document.getElementById('save-ride').style.display = 'block';
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
    document.getElementById('weather-box').innerHTML = 
    '<p>' + forecast.date + " High: " + forecast.high + " Low: " + forecast.low + " " + forecast.text + '</p>';
    document.getElementById('weather-box').style.display = 'block';
    console.log(response);
  });
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      inProgressRides: [],
      rankings: [],
      startRideButton: '',
      miles: 0
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
        console.log(parameters);
        $.post('api/v1/rides', parameters, function(response) {
          console.log(response);
          this.inProgressRides.push(response);
        }.bind(this));
      },
      finishRide: function(ride) {
        console.log(ride.id);
        var testData = {'miles': ride.miles};
        $.ajax({
          url: '/api/v1/rides/' + ride.id, 
          method: "PUT",
          data: testData
        });
        var index = this.inProgressRides.indexOf(ride);
        this.inProgressRides.splice(index, 1);
        var displayMiles = parseFloat(this.miles) + parseFloat(ride.miles);
        console.log(displayMiles);
        this.miles = displayMiles.toFixed(2);
        for (var i = 0; i < this.rankings.length; i++) {
          if (this.rankings[i].userId !== undefined) {
            this.rankings[i].miles = displayMiles.toFixed(2);
          }
        }
      },
      showRide: function(ride) {
        return ride.in_progress === true;
      },
      firstPlace: function(index) {
        return index === 0;
      },

      makeMilesBoxWeekly: function() {
        var userId = document.getElementById("userId").innerHTML;
        var weekMiles = 0;
        $.get('/api/v1/rides/', function(response) {
          var todayMS = Date.now();
          for (var i = 0; i < response.length; i++) {
            if (response[i].user_id === parseInt(userId) && response[i]) {
              var rideMS = Date.parse(response[i].updated_at);
              if ((todayMS - rideMS) <= 604800000) {
                weekMiles += response[i].miles;
              }
            }
          }
          this.miles = weekMiles;
          this.rankings = [];
          $.get('/api/v1/users/' + userId, function(response){
              this.rankings.push({
                userId: response.id,
                firstName: response.firstName,
                miles: weekMiles,
              });
          }.bind(this));
        }.bind(this));
      },

      makeRankingsWeekly: function() {
        var userId = document.getElementById("userId").innerHTML;
        $.get("/api/v1/friendships", function(response) {
          for (var i = 0; i < response.length; i++) {
            if (response[i].user_id.toString() === userId) {
              var friendId = response[i].friend_id;
              var weeklyMiles = 0;
              // convert lifetimeMiles to weeklyMiles
              $.get("/api/v1/rides", function(response) {

                var todayMS = Date.now();
                var nameTracker = new Object();
                for (var i = 0; i < response.length; i++) {
                  if (response[i].user_id === parseInt(friendId) && response[i]) {
                    var rideMS = Date.parse(response[i].updated_at);
                    if ((todayMS - rideMS) <= 604800000) {
                      weeklyMiles += response[i].miles;
                      nameTracker[response[i].user_id] = response[i].first_name;
                    }
                  }


                }
                console.log(nameTracker);
                  // this.rankings.push({
                  //   userId: userId,
                  //   firstName: firstName,
                  //   miles: weeklyMiles.toFixed(2),
                  // });
              }.bind(this));
              
            }
          }
        }.bind(this));        

      }
    },

    mounted: function() {
      var userId = document.getElementById("userId").innerHTML;
      $.get("/api/v1/rides", function(response) {
        for (var i = 0; i < response.length; i++) {
          if (response[i].in_progress === true && response[i].user_id.toString() === userId) {
            this.inProgressRides.push(response[i]);
          }
        }
      }.bind(this));

      console.log("Running");
      if (!document.getElementById("userId")) {
        console.log("we're in the rides page");
      } else {
        console.log(userId);
        $.get("/api/v1/users/" + userId, function(response) {
          console.log("Miles:" + response['miles']);
          this.miles += response.miles;
        }.bind(this));
      }

      // Add user's own info to Rankings
      $.get("/api/v1/users/" + userId, function(response) {
        this.rankings.push({
          userId: response.id,
          firstName: response.firstName,
          miles: response.miles,
        });
      }.bind(this));

      $.get("/api/v1/friendships", function(response) {
        for (var i = 0; i < response.length; i++) {
          if (response[i].user_id.toString() === userId) {
            var friendId = response[i].friend_id;
            $.get("/api/v1/users/" + friendId, function(response) {
              this.rankings.push({
                firstName: response.firstName,
                miles: response.miles
              });   
            }.bind(this));
            
          }
        }
      }.bind(this));
    },

    computed: {
      sortedFriends: function() {
        return this.rankings.sort(function(friend1, friend2) {
          return friend1.miles < friend2.miles;
        }.bind(this));
      }
    }
  });
});



