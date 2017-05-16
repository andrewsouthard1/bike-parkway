json.array! @friendships.each do |friendship|
  json.id friendship.id
  json.user_id friendship.user_id
  json.friend_id friendship.friend_id
  
  # get user data from friend_id
  if User.all.find_by(id: friendship.friend_id)
    
    #lifetime miles
    json.friend_miles User.all.find_by(id: friendship.friend_id).miles

    #friend first name
    json.friend_first_name User.all.find_by(id: friendship.friend_id).first_name
    
    # Get all rides where user is friend
    json.friend_rides Ride.all.where(user_id: friendship.friend_id)
  end
end