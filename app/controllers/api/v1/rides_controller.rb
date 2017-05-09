class Api::V1::RidesController < ApplicationController
  def index
    @rides = Ride.all
    render 'index.json.jbuilder'
  end

  def create
    @ride = Ride.new(
      starting_location: params[:starting_location],
      ending_location: params[:ending_location],
      miles: params[:miles],
      in_progress: params[:in_progress],
      finished: params[:finished],
      user_id: params[:user_id],
      top_five: params[:top_five]
    )
    if @ride.save
      render json: @ride 
    else
      render json: {errors: "Didn't save"},
        status: 420
    end
  end

  def show
    @ride = Ride.find_by(id: params[:id])
    render 'show.json.jbuilder'
  end

  def update
    ride = Ride.find_by(id: params[:id])
    p params[:testData]
    @ride_updated = ride.update(
      in_progress: false,
      finished: true
    )
    if @ride_updated
      render json: {ride: "completed"} 
    else
      render json: {error: "error"}, status: 422
    end
  end
end
