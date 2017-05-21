json.array! @comments.each do |comment|
  json.user_id comment.user_id
  json.ride_id comment.ride_id
  json.comment_text comment.comment_text
  json.commenter_first_name User.find_by(id: comment.user_id).first_name
  json.created_at comment.created_at
end