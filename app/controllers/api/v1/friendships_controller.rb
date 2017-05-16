class Api::V1::FriendshipsController < ApplicationController
  def index
    @users = User.all
    @friendships = Friendship.all
    render 'index.json.jbuilder'
  end

  def show
    @users = User.all
    @friendships = Friendship.where(user_id: params[:id])
    render 'show.json.jbuilder'
  end

end
