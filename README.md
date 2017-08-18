# Bike Parkway

Bike Parkway is an app that allows users to sign up, add their friends, and compete in bike mile challenges. A fitness tracker purely for bike riding/commuting. BP integrates the Google Maps API to provide optimal bike directions and a clean user interface.

# Motivation

There are many fitness tracking/direction apps out there these days. I wanted to provide a landing spot purely for bike riding and those who commute by bicycle. As the subway gets worse every day here in NYC, anything we can do to encourage cycling needs to be done!

# Tech/framework used

**Built with**
  * [Ruby on Rails](http://rubyonrails.org/)
  * [Vue.js](https://vuejs.org/)
  * [PostgreSQL](https://www.postgresql.org/)
  * [Google Maps API](https://developers.google.com/maps/)

# Screenshots

![alt text](https://i.ytimg.com/vi/jWPxcDhshDs/maxresdefault.jpg)

# Features

  * User login/signup
  * Tracks miles by day, week, lifetime
  * Provides bike route on custom map
  * Single-page Application Activity Feed 

# Code Example

**Adding a comment to wall**
```javascript
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
```

**Writing a User class with friendships**
```ruby
  class User < ApplicationRecord
    has_secure_password

    has_many :friendships
    has_many :friends, through: :friendships
    has_many :inverse_friendships, :class_name => "Friendship", :foreign_key => "friend_id"
    has_many :inverse_friends, :through => :inverse_friendships, :source => :user
    has_many :rides
    has_many :comments
    has_many :likes

    def friend?(input_id)
      friendships = Friendship.all.where(user_id: self.id)
      friendships.each do |friendship|
        if friendship.friend_id == input_id
          return true
        end
      end
      false
    end
  end
```

  