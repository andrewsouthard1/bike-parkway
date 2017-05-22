class Api::V1::RidesController < ApplicationController
  def index
    @user = User.all
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
    user = User.find_by(id: ride.user_id)
    if (params[:miles])
      if user.miles == nil
        new_miles = ride.miles
      else
        new_miles = ride.miles + user.miles
      end
      p "new_miles#{new_miles}"

      @ride_updated = ride.update(
        in_progress: false,
        finished: true
      )

      @user_update = user.update(
        miles: new_miles
      )

      if @ride_updated && @user_update
        render json: {ride: "completed"} 
      else
        render json: {error: "error"}, status: 422
      end
    elsif (params[:comment])
      comment = Comment.create(
        user_id: current_user.id,
        ride_id: ride.id,
        comment_text: params[:comment]
      )
    elsif (params[:liked])
      p "***********************"
      p "LIKED conditional is up"
      p "***********************"
      like = Like.find_by(ride_id: ride.id, user_id: user.id)
      if !like
        like.create(
          user_id: current_user.id,
          ride_id: ride.id
        )
      else
        like.destroy
      end
    else
      p "comment conditional did not hit and neither did params[:miles]"
    end
  end
end
