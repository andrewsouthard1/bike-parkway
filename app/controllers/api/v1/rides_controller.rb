class Api::V1::RidesController < ApplicationController
  def index
    @rides = Ride.all
    render 'index.json.jbuilder'
  end

  def create
    @ride = Ride.new(
      starting_location: "Kansas",
      ending_location: "Wyoming",
      miles: 10000,
      in_progress: true,
      finished: false,
      user_id: 1,
      top_five: false
    )
    if @ride.save
      render 'show.json.jbuilder'
    else
      render json: {errors: "Didn't save"},
        status: 420
    end
  end

  def show
    @ride = Ride.find_by(id: params[:id])
    render 'show.json.jbuilder'
  end
end
