json.id @user.id
json.firstName @user.first_name
json.lastName @user.last_name
json.email @user.email
json.miles @user.miles
json.user_rides Ride.where(user_id: @user.id)
json.profilePictureUrl @user.profile_picture_url