json.array! @rides.each do |ride|
  json.id ride.id
  json.starting_location ride.starting_location
  json.ending_location ride.ending_location
  json.miles ride.miles
  json.in_progress ride.in_progress
  json.finished ride.finished
  json.user_id ride.user_id
  json.top_five ride.top_five
  json.updated_at ride.updated_at
  if User.find_by(id: ride.user_id)
    json.user do
      json.first_name User.find_by(id: ride.user_id).first_name 
      json.last_name User.find_by(id: ride.user_id).last_name
      json.email User.find_by(id: ride.user_id).miles
      json.profilePictureUrl User.find_by(id: ride.user_id).profile_picture_url
      json.friendship_info Friendship.where(user_id: ride.user_id)
    end 
  end
  json.comments Comment.where(ride_id: ride.id)
end