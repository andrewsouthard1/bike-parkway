json.array! @friendships.each do |friendship|
  json.id friendship.id
  json.user_id friendship.user_id
  json.friend_id friendship.friend_id
  if User.all.find_by(id: friendship.friend_id)
    json.friend_miles User.all.find_by(id: friendship.friend_id).miles
  end
end