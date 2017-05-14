class User < ApplicationRecord
  has_secure_password

  has_many :friendships
  has_many :friends, through: :friendships
  has_many :inverse_friendships, :class_name => "Friendship", :foreign_key => "friend_id"
  has_many :inverse_friends, :through => :inverse_friendships, :source => :user
  has_many :rides

  def friend?(input_id)
    friendships = Friendship.all.where(user_id: self.id)
    friendships.each do |friendship|
      if friendship.friend_id == input_id
        return true
      end
    end
    false
  end
end
