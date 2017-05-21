json.id @user.id
json.firstName @user.first_name
json.lastName @user.last_name
json.email @user.email
json.miles @user.miles
json.user_rides Ride.where(user_id: @user.id)
friend_comments = []
Ride.where(user_id: @user.id).each do |ride|
  if ride.comments.length > 0
    friend_comments.push(ride.comments)
  end
end

json.profilePictureUrl @user.profile_picture_url
json.commentsFromFriends friend_comments