/* global Vue */
/* global $ */

document.addEventListener("DOMContentLoaded", function(event) { 
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      inProgressRides: [],
      rankings: [],
      activityRides: [],
      startRideButton: '',
      isLiked: false,
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
          if (response.user_rides.length === 1) {
            this.activityRides.push({
                  rideId: response.user_rides.id,
                  userId: userId,
                  firstName: response.firstName,
                  miles: response.user_rides.miles,
                  date: rideDateString,
                  timeRidden: rideDate
                });
          } else {
          for (var i = response.user_rides.length - 1; i > 0; i--) {    
              if (response.user_rides[i].id === ride.id) {
                console.log("THIS HIT");
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
        var userId = document.getElementById("userId").innerHTML;
        $.get("/api/v1/friendships/" + userId, function(response) {
          
          this.rankings = [];
          for (var i = 0; i < response.length; i++) { 
            this.rankings.push({
              userId: response[i].friend_id,
              firstName: response[i].friend_first_name,
              miles: parseFloat(response[i].friend_miles.toFixed(2))
            });
          }
        }.bind(this));        
        $.get("/api/v1/users/" + userId, function(response) {
          this.rankings.push({
            userId: response.id,
            firstName: response.firstName,
            miles: parseFloat(response.miles.toFixed(2))              
          });
        }.bind(this));

      },

      addComment: function(rideId) {
        var commentText = document.getElementById(rideId).value;
        var commentData = {'comment': commentText};
        var userId = document.getElementById("userId").innerHTML;
        $.get("/api/v1/users/" + userId, function(response) {
          var userFirstName = response.firstName;
          if (document.getElementById('comment' + rideId)) {
            document.getElementById('comment' + rideId).innerHTML += '<div class="commentClass">' + "<a href='/users/" + userId.toString() + "'> " + userFirstName + "</a> " + commentText + '</div>' ;
          }
        });
        $.ajax({
          url: '/api/v1/rides/' + rideId, 
          method: "PUT",
          data: commentData
        }
        ).done( function() {
          console.log(commentText);
          document.getElementById(rideId).value = '';
          console.log(document.getElementById(rideId));
          console.log(document.getElementById(rideId).value);

        });
      },

      // toggle the green and black
      likeRide: function(rideId) {
        console.log("ride liked");
        var likeData = {'liked': true};
        var userId = document.getElementById("userId").innerHTML;

        $.ajax({
          url: '/api/v1/rides/' + rideId,
          method: "PUT",
          data: likeData
        }).done( function() {
          $.get("/api/v1/rides/" + rideId, function(response) {
            if (response.likes.length > 0) {
            for (var i = 0; i < response.likes.length; i++) {
            // console.log(response.likes[i].user_id.toString() === userId);
              if (response.likes[i].user_id.toString() === userId){
                document.getElementById("like" + rideId).style.color = '#4ab678';
              }
      
            } 
            }
          });
        });
      },

      // isLikedByUser: function(rideId) {
      //   var userId = document.getElementById("userId").styl;
      // }
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
      
      // get rides from current user
      var userFriends = {};
      var hasRun = false;
      for (var i = 0; i < response.length; i++) {
        
        // ride is finished and the user is not null
        if (response[i].user_id.toString() === userId) {
          if (response[i].finished) {
            for (var j = 0; j < response[i].user.friendship_info.length; j++) {
              var friendId = response[i].user.friendship_info[j].friend_id;
              userFriends[friendId] = 1;
            }
            var rideDate = new Date(response[i].created_at);
            var rideDateString = (rideDate.getMonth() + 1) + "/" + rideDate.getDate() + "/" + rideDate.getFullYear();
            this.activityRides.push({
              rideId: response[i].id,
              firstName: response[i].user.first_name,
              miles: response[i].miles,
              date: rideDateString,
              timeRidden: rideDate,
              rideComments: response[i].comments,
              likes: response[i].likes
            });

          }
 
        }  
      }

      //get rides from users friends
      userFriends = Object.keys(userFriends);
      if (userFriends.length > 0) {
      for (i = 0; i < userFriends.length; i++) {
        for (j = 0; j < response.length; j++) {
          if (response[j].finished && response[j].user_id) {

            if (response[j].user_id.toString() === userFriends[i]) {
              console.log("friends ride: " + response[j]);
              
              rideDate = new Date(response[i].created_at);

              rideDateString = (rideDate.getMonth() + 1) + "/" + rideDate.getDate() + "/" + rideDate.getFullYear();
              console.log(rideDateString);
              this.activityRides.push({
                rideId: response[j].id,
                firstName: response[j].user.first_name,
                miles: response[j].miles,
                date: rideDateString,
                timeRidden: rideDate,
                rideComments: response[j].comments,
                likes: response[j].likes
              });
            }
          }
        }
      }
    }
    }.bind(this));

    },

    computed: {
      sortedFriends: function() {
        return this.rankings.sort(function(friend1, friend2) {
          return friend1.miles < friend2.miles;
        }.bind(this));
      },

      sortedRides: function() {
        return this.activityRides.sort(function(ride1, ride2) {
          // return ride1.miles - ride2.miles;
          console.log(ride2.timeRidden);
          return new Date(ride2.rideId) - new Date(ride1.rideId);
        }.bind(this));
      }
    }
  });
});

