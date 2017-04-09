class RidesController < ApplicationController
  def new
    render 'new.html.erb'
  end

  def create
    @ride = Ride.create(
      starting_location: params[:starting_location],
      ending_location: params[:ending_location]
    )
    redirect_to "/rides/#{@ride.id}"
  end

  def show
    @ride = Ride.find(params[:id])
    render 'show.html.erb'
  end
end
