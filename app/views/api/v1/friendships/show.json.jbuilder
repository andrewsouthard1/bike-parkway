json.array! @friendships.each do |friendship|
  json.id friendship.id
  json.user_id friendship.user_id

  # get user data
  if User.all.find_by(id: friendship.user_id)
    # user lifetime miles
    json.user_miles User.all.find_by(id: friendship.user_id).miles
    # user first name
    json.user_first_name User.all.find_by(id: friendship.user_id).first_name
    # Get all rides from user
    json.user_rides Ride.all.where(user_id: friendship.user_id)
    json.user_comments User.all.find_by(id: friendship.user_id).comments
    json.user_likes User.all.find_by(id: friendship.user_id).likes

  end

  json.friend_id friendship.friend_id
  
  # get friend user data
  if User.all.find_by(id: friendship.friend_id)
    # friend lifetime miles
    json.friend_miles User.all.find_by(id: friendship.friend_id).miles
    # friend first name
    json.friend_first_name User.all.find_by(id: friendship.friend_id).first_name
    # Get all rides from friend
    json.friend_rides Ride.all.where(user_id: friendship.friend_id)
    json.friend_comments User.all.find_by(id: friendship.friend_id).comments
    json.friend_likes User.all.find_by(id: friendship.friend_id).likes
  end
end