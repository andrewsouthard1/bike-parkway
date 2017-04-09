class RidesController < ApplicationController
  def new
    render 'new.html.erb'
  end

  def create
    @ride = Ride.new(
      starting_location: params[:starting_location],
      ending_location: params[:ending_location]
    )
    if current_user
      @ride.user_id = current_user.id
    end
    @ride.save
    redirect_to "/rides/#{@ride.id}"
  end

  def show
    @ride = Ride.find(params[:id])
    @ride_info = Unirest.get("https://maps.googleapis.com/maps/api/directions/json?origin=#{@ride.starting_location}&destination=#{@ride.ending_location}&key=#{ENV['API_KEY']}").body
    render 'show.html.erb'
  end
end
