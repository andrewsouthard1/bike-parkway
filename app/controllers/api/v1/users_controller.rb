class Api::V1::UsersController < ApplicationController
  def index
    @users = User.all
    render 'index.json.jbuilder'
  end

  def show
    @user = User.find_by(id: params[:id])
    render 'show.json.jbuilder'
  end
end
