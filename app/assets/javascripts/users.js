document.addEventListener("DOMContentLoaded", function(event) { 
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello user',
      miles: 0
    },

    mounted: function() {
      if (!document.getElementById("userId")) {
        console.log("we're in the rides page");
      } else {
        var userId = document.getElementById("userId").innerHTML;
        console.log(userId);
        $.get("/api/v1/users/" + userId, function(response){
          console.log(response);
          this.miles += response.miles;
        }.bind(this));
      }
      // console.log(document.getElementById("userId").innerHTML);
      // $.get("/api/v1/users" + document.querySelector())
    }
  });
});