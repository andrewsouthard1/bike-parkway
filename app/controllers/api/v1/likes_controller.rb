class Api::V1::LikesController < ApplicationController
  def index
    @likes = Like.all
    render 'index.json.jbuilder'
  end

  def show
    @likes = Like.where(ride_id: params[:id])
    render 'show.json.jbuilder'
  end
end
