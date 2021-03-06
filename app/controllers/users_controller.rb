class UsersController < ApplicationController
  
  def index
    @users = User.all
    render 'index.html.erb'
  end

  def new
    render 'new.html.erb'
  end

  def create
    user = User.new(
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      password: params[:password],
      password_confirmation: params[:password_confirmation]
    )
    if user.save
      session[:user_id] = user.id 
      flash[:success] = 'Successfully created account!'
      redirect_to "/users/#{user.id}"
    else
      flash[:warning] = 'Invalid email or password!'
      redirect_to '/signup'
    end
  end

  def show
    @user = User.find_by(id: params[:id])
  end
end
