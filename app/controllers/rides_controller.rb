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
    @ride_directions = Unirest.get("https://maps.googleapis.com/maps/api/directions/json?origin=#{@ride.starting_location}&destination=#{@ride.ending_location}&mode=bicycling&key=#{ENV['API_KEY']}").body
    @start_latitude = @ride_directions["routes"][0]["legs"][0]["start_location"]["lat"]
    @start_longitude = @ride_directions["routes"][0]["legs"][0]["start_location"]["lng"]
    @end_latitude = @ride_directions["routes"][0]["legs"][0]["end_location"]["lat"]
    @end_longitude = @ride_directions["routes"][0]["legs"][0]["end_location"]["lng"]
    


    render 'show.html.erb'
  end
end
