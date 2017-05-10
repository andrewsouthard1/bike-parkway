json.array! @users.each do |user|
  json.id user.id
  json.firstName user.first_name
  json.lastName user.last_name
  json.email user.email
  json.miles user.miles
  json.profilePictureUrl user.profile_picture_url
end