class Api::V1::FriendshipsController < ApplicationController
  def index
    @friendships = Friendship.all
    render 'index.json.jbuilder'
  end

end
