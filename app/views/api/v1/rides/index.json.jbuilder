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
  all_comments = Comment.where(ride_id: ride.id)
  json.comments do
    json.array! all_comments.each do |comment|
      json.comment_id comment.id
      json.comment_user_id comment.user_id
      json.comment_first_name User.find_by(id: comment.user_id).first_name
      json.comment_last_name User.find_by(id: comment.user_id).last_name
      json.comment_url User.find_by(id: comment.user_id).profile_picture_url
      json.comment_text comment.comment_text
      json.comment_created_at comment.created_at 
      json.updated_at comment.updated_at
    end
  end
  json.likes Like.where(ride_id: ride.id)
end