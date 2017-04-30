json.array! @rides.each do |ride|
  json.id ride.id
  json.starting_location ride.starting_location
  json.ending_location ride.ending_location
  json.miles ride.miles
  json.in_progress ride.in_progress
  json.finished ride.finished
  json.user_id ride.user_id
  json.top_five ride.top_five
end