function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 4
  });
  directionsService.route({
    origin: document.getElementById('origin-input'),
    destination: document.getElementById('destination-input'),
    travelMode: 'BICYCLING'
  }, function(response, status) {
    if (status === 'OK') {
      window.alert('this hit');
      console.log('full response');
      console.log(response);
      var meters = response['routes'][0]['legs'][0]['distance']['value'];
      var miles = getMiles(meters);
      console.log('directions');
      var directions = response['routes'][0]['legs'][0]['steps'];
      var instructions = getInstructions(directions);
      document.getElementById("miles_count").innerHTML = miles;
      document.getElementById("steps").innerHTML = directions;
      directionsDisplay.setDirections(response);
      directionsDisplay.setMap(map);
    } else {
      window.alert('Directions request failed' + status);
    }
  });

  function getMiles(meters) {
    return (meters * 0.00062137).toFixed(2);
  }

  function getInstructions(stepsArray) {
    var stepArray = [];
    for (var i = 0; i < stepsArray.length; i++) {
      stepArray.push(stepsArray[i]['instructions']);
    }
  }
}