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
    {}];

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
      window.alert('Directions service is going through');
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

function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// function getWeather(lat, lng) {
//   $.get("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text='(" + lat + "," + lng + ")')&format=json", function(response) {
//     var forecast = response.query.results.channel.item.forecast[0];
//     document.getElementById('weather-box').innerHTML = 
//     '<p>' + forecast.date + " High: " + forecast.high + " Low: " + forecast.low + " " + forecast.text + '</p>';
//     document.getElementById('weather-box').style.display = 'block';
//     console.log(response);
//   });
// }

document.addEventListener("DOMContentLoaded", function(event) { 
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      inProgressRides: [],
      rankings: [],
      activityRides: [],
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
        $.post('api/v1/rides', parameters, function(response) {
          this.inProgressRides.push(response);
        }.bind(this));
      },
      finishRide: function(ride) {
        var testData = {'miles': ride.miles};
        $.ajax({
          url: '/api/v1/rides/' + ride.id, 
          method: "PUT",
          data: testData
        });
        var index = this.inProgressRides.indexOf(ride);
        this.inProgressRides.splice(index, 1);
        var displayMiles = parseFloat(this.miles) + parseFloat(ride.miles);
        this.miles = displayMiles.toFixed(2);
        var userId = document.getElementById("userId").innerHTML;
        for (var i = 0; i < this.rankings.length; i++) {
          if (this.rankings[i].userId === userId) {
            this.rankings[i].miles = displayMiles.toFixed(2);
          }
        }
        var rideDate = new Date();

        $.get("/api/v1/users/" + userId, function(response) {
          for (var i = response.user_rides.length - 1; i > 0; i--) {    
              if (response.user_rides[i].id === ride.id) {
                var rideDate = new Date(response.user_rides[i].updated_at);
                var rideDateString = (rideDate.getMonth() + 1) + "/" + rideDate.getDate() + "/" + rideDate.getFullYear();
                this.activityRides.push({
                  rideId: response.user_rides[i].id,
                  userId: userId,
                  firstName: response.firstName,
                  miles: response.user_rides[i].miles,
                  date: rideDateString,
                  timeRidden: rideDate
                });
                break;
            }
          }

        }.bind(this));
      },
      showRide: function(ride) {
        return ride.in_progress === true;
      },
      firstPlace: function(index) {
        return index === 0;
      },

      makeMilesBoxWeekly: function() {
        $("#today-button").removeClass("selected-miles");
        $("#lifetime-button").removeClass("selected-miles");
        $("#weekly-button").addClass("selected-miles");        
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
          this.miles = weekMiles.toFixed(2);
        }.bind(this));
      },

      makeRankingsWeekly: function() {
        var userId = document.getElementById("userId").innerHTML;
        this.rankings = [];
        var goneThroughUserInfo = false;
        var userWeeklyMiles = 0;
        var todayMS = Date.now();
        $.get("/api/v1/friendships/" + userId, function(response) {
      
          for (var i = 0; i < response.length; i++) {
            var friendId = response[i].friend_id;
            var friendWeeklyMiles = 0;
            var userFirstName = response[i].user_first_name;
            var friendFirstName = response[i].friend_first_name;
            for (var j = 0; j < response[i].friend_rides.length; j++) {
              if (response[i].friend_rides[j].finished) {
                var rideMS = Date.parse(response[i].friend_rides[j].updated_at);
                if ((todayMS - rideMS) <= 604800000) {
                  friendWeeklyMiles += response[i].friend_rides[j].miles;
                }
              }
            }
            if (!goneThroughUserInfo) {
              for (j = 0; j < response[i].user_rides.length; j++) {
                if (response[i].user_rides[j].finished) {
                  rideMS = Date.parse(response[i].user_rides[j].updated_at);
                  if ((todayMS - rideMS) <= 604800000) {
                    userWeeklyMiles += response[i].user_rides[j].miles;
                  }
                }
              }
              this.rankings.push({
                userId: userId,
                firstName: userFirstName,
                miles: parseFloat(userWeeklyMiles.toFixed(2))
              });
              goneThroughUserInfo = true;
            }
            
            this.rankings.push({
              userId: friendId,
              firstName: friendFirstName,
              miles: parseFloat(friendWeeklyMiles.toFixed(2))
            });
          }
        }.bind(this));        

        if (!goneThroughUserInfo) {
          $.get("/api/v1/users/" + userId, function(response) {
            for (var i = 0; i < response.user_rides.length; i++) {
              if (response.user_rides[i].finished) {
                var rideMS = Date.parse(response.user_rides[i].updated_at);
                if ((todayMS - rideMS) <= 604800000) {
                  userWeeklyMiles += response.user_rides[i].miles;
                }
              }
            }
            this.rankings.push({
              userId: response.id,
              firstName: response.firstName,
              miles: parseFloat(userWeeklyMiles.toFixed(2))
            });
            goneThroughUserInfo = true;
          }.bind(this));
        }

      },

      makeMilesBoxDaily: function() {
        $("#today-button").addClass("selected-miles");
        $("#lifetime-button").removeClass("selected-miles");
        $("#weekly-button").removeClass("selected-miles");

        var userId = document.getElementById("userId").innerHTML;
        var dailyMiles = 0;
        $.get('/api/v1/rides/', function(response) {
          var todayFull = new Date();
          var todayDate = todayFull.getDate();
          var todayMonth = todayFull.getMonth();
          var todayYear = todayFull.getFullYear();
          for (var i = 0; i < response.length; i++) {
            if (response[i].user_id === parseInt(userId) && response[i]) {
              var rideFull = new Date(response[i].updated_at);
              var rideDate = rideFull.getDate();
              var rideMonth = rideFull.getMonth();
              var rideYear = rideFull.getFullYear();
              
              if ((todayDate === rideDate) && (todayMonth === rideMonth) && (todayYear === rideYear)) {
                dailyMiles += response[i].miles;
              }
            }
          }
          this.miles = dailyMiles.toFixed(2);
        }.bind(this));
      },

      makeRankingsDaily: function() {
        var userId = document.getElementById("userId").innerHTML;
        var goneThroughUserInfo = false;
        var todayFull = new Date();
        var todayDate = todayFull.getDate();
        var todayMonth = todayFull.getMonth();
        var todayYear = todayFull.getFullYear();
        this.rankings = [];
        $.get("/api/v1/friendships/" + userId, function(response) {
          for (var i = 0; i < response.length; i++) {
            var friendId = response[i].friend_id;
            var friendDailyMiles = 0;
            var friendFirstName = response[i].friend_first_name;
            for (var j = 0; j < response[i].friend_rides.length; j++) {
              if (response[i].friend_rides[j].finished) {
                var rideFull = new Date(response[i].friend_rides[j].updated_at);
                var rideDate = rideFull.getDate();
                var rideMonth = rideFull.getMonth();
                var rideYear = rideFull.getFullYear();
                
                if ((todayDate === rideDate) && (todayMonth === rideMonth) && (todayYear === rideYear)) {
                  friendDailyMiles += response[i].friend_rides[j].miles;
                }
              }
            }
            if (!goneThroughUserInfo) {
              var userFirstName = response[i].user_first_name;
              var userDailyMiles = 0;
              for (j = 0; j < response[i].user_rides.length; j++) {
                if (response[i].user_rides[j].finished) {
                  rideFull = new Date(response[i].user_rides[j].updated_at);
                  rideDate = rideFull.getDate();
                  rideMonth = rideFull.getMonth();
                  rideYear = rideFull.getFullYear();
                }
                if ((todayDate === rideDate) && (todayMonth === rideMonth) && (todayYear === rideYear)) {
                  userDailyMiles += response[i].user_rides[j].miles;
                }
              }
              this.rankings.push({
                userId: userId,
                firstName: userFirstName,
                miles: parseFloat(userDailyMiles.toFixed(2))
              });
              goneThroughUserInfo = true;
            }
            
            this.rankings.push({
              userId: friendId,
              firstName: friendFirstName,
              miles: parseFloat(friendDailyMiles.toFixed(2))
            });

          }
        }.bind(this));        

        if (!goneThroughUserInfo) {
          $.get("/api/v1/users/" + userId, function(response) {
            var userDailyMiles = 0;
            for (var i = 0; i < response.user_rides.length; i++) {
              if (response.user_rides[i].finished) {
                var rideFull = new Date(response.user_rides[i].updated_at);
                var rideDate = rideFull.getDate();
                var rideMonth = rideFull.getMonth();
                var rideYear = rideFull.getFullYear();
              }
              if ((todayDate === rideDate) && (todayMonth === rideMonth) && (todayYear === rideYear)) {
                userDailyMiles += response.user_rides[i].miles;
              }
            }

            this.rankings.push({
              userId: response.id,
              firstName: response.firstName,
              miles: parseFloat(userDailyMiles.toFixed(2))              
            });
            goneThroughUserInfo = true;
          }.bind(this));
        }


      },

      makeMilesBoxLifetime: function() {
        $("#today-button").removeClass("selected-miles");
        $("#lifetime-button").addClass("selected-miles");
        $("#weekly-button").removeClass("selected-miles");
        var userId = document.getElementById("userId").innerHTML;
        $.get('/api/v1/users/' + userId, function(response) {
          this.miles = response.miles.toFixed(2);
        }.bind(this));
      },

      makeRankingsLifetime: function() {
        var goneThroughUserInfo = false;
        var userId = document.getElementById("userId").innerHTML;
        $.get("/api/v1/friendships/" + userId, function(response) {
          
          this.rankings = [];
          for (var i = 0; i < response.length; i++) {
            if (!goneThroughUserInfo) {
              this.rankings.push({
                userId: userId,
                firstName: response[i].user_first_name,
                miles: parseFloat(response[i].user_miles.toFixed(2))
              });
              goneThroughUserInfo = true;
            } 
            
            this.rankings.push({
              userId: response[i].friend_id,
              firstName: response[i].friend_first_name,
              miles: parseFloat(response[i].friend_miles.toFixed(2))
            });
          }
        }.bind(this));        

        if (!goneThroughUserInfo) {
          $.get("/api/v1/users/" + userId, function(response) {
            this.rankings.push({
              userId: response.id,
              firstName: response.firstName,
              miles: parseFloat(response.miles.toFixed(2))              
            });
            goneThroughUserInfo = true;
          }.bind(this));
        }
      },

      addComment: function(rideId) {
        var commentText = document.getElementById(rideId).value;
        var commentData = {'comment': commentText};
        $.ajax({
          url: '/api/v1/rides/' + rideId, 
          method: "PUT",
          data: commentData
        });
      },

      likeRide: function() {
        console.log("ride liked");
      },

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
        $.get("/api/v1/users/" + userId, function(response) {
          this.miles += response.miles;
        }.bind(this));
      }

      // Add user's own info to Rankings
      $.get("/api/v1/users/" + userId, function(response) {
        this.rankings.push({
          userId: userId,
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
                userId: friendId,
                firstName: response.firstName,
                miles: response.miles
              });   
            }.bind(this));
            
          }
        }
      }.bind(this));

    // Fill activity log with rides and comments of that ride
    $.get("/api/v1/rides", function(response) {
      var userFriends = {};
      for (var i = 0; i < response.length; i++) {
        
        // ride is finished and the user is not null
        if (response[i].finished && response[i].user_id) {
          
          if (response[i].user_id.toString() === userId) {
            for (var j = 0; j < response[i].user.friendship_info.length; j++) {
              var friendId = response[i].user.friendship_info[j].friend_id;
              userFriends[friendId] = 1;
            }

            
          }
 
          // ride belongs to current user
        }  
        
      }

      userFriends = Object.keys(userFriends);
      for (i = 0; i < userFriends.length; i++) {
        for (j = 0; j < response.length; j++) {
          if (response[j].finished && response[j].user_id) {

            if (response[j].user_id.toString() === userFriends[i]) {
              console.log("friends ride: " + response[j]);
            }
          }
        }
      }


    }.bind(this));

      //       this.activityRides.push({
      //         rideId: response[i].friend_rides[j].id,
      //         userId: response[i].friend_rides[j].user_id,
      //         firstName: response[i].friend_first_name,
      //         miles: response[i].friend_rides[j].miles,
      //         date: rideDateString,
      //         timeRidden: rideDate,
      //         rideComments: rideComments
      //       });



      // $.get("/api/v1/friendships/" + userId, function(response) {
      //   for (var i = 0; i < response.length; i++) {
      //     var friendComments = response[i].friend_comments;
      //     for (var j = 0; j < response[i].friend_rides.length; j++) {
            
      //       // if response[i].friend_comments.length 
      //     if (response[i].friend_rides[j].finished) {
      //       var rideDate = new Date(response[i].friend_rides[j].updated_at);
      //       var timeAdded = new Date();
      //       var rideDateString = (rideDate.getMonth() + 1) + "/" + rideDate.getDate() + "/" + rideDate.getFullYear();

      //       if (friendComments.length > 0) {
      //         var rideComments = [];
      //         for (var f = 0; f < friendComments.length; f++) {
      //           if (friendComments[f].ride_id === response[i].friend_rides[j].id) {
      //             var comment = {
      //               user: response[i].friend_first_name,
      //               text: friendComments[f].comment_text
      //             };
      //             rideComments.push(comment);
      //           }
      //         }
      //       }
      //       this.activityRides.push({
      //         rideId: response[i].friend_rides[j].id,
      //         userId: response[i].friend_rides[j].user_id,
      //         firstName: response[i].friend_first_name,
      //         miles: response[i].friend_rides[j].miles,
      //         date: rideDateString,
      //         timeRidden: rideDate,
      //         rideComments: rideComments
      //       });
      //     }  
      //     }
      //   }
      // }.bind(this));

      // $.get("/api/v1/users/" + userId, function(response) {
      //   for (var i = 0; i < response.user_rides.length; i++) {    
      //     if (response.user_rides[i].finished) {        
      //       var rideComments = [];
      //       var rideDate = new Date(response.user_rides[i].updated_at);
      //       var rideDateString = (rideDate.getMonth() + 1) + "/" + rideDate.getDate() + "/" + rideDate.getFullYear();
      //       if (response.commentsFromFriends.length > 0) {
      //         for (var f = 0; f < response.commentsFromFriends.length; f++) {
      //           console.log(response.commentsFromFriends[f][0].ride_id + "response.commentsFromFriends[f]");
      //           if (response.commentsFromFriends[f][0].ride_id === response.user_rides[i].id) {
      //             console.log("we made it to this conditional");
      //             var comment = {
      //               user: "BILLY",
      //               text: response.commentsFromFriends[f][0].comment_text
      //             };
      //             rideComments.push(comment);
      //           }
      //         }

      //       }

      //       this.activityRides.push({
      //         rideId: response.user_rides[i].id,
      //         userId: userId,
      //         firstName: response.firstName,
      //         miles: response.user_rides[i].miles,
      //         date: rideDateString,
      //         timeRidden: rideDate,
      //         rideComments: rideComments
      //       });
      //     }
      //   }
      // }.bind(this));
    },

    computed: {
      sortedFriends: function() {
        return this.rankings.sort(function(friend1, friend2) {
          return friend1.miles < friend2.miles;
        }.bind(this));
      },

      sortedRides: function() {
        return this.activityRides.sort(function(ride1, ride2) {
          return new Date(ride2.timeRidden) - new Date(ride1.timeRidden);
        }.bind(this));
      }
    }
  });
});

