Rails.application.routes.draw do

  get 'sessions/new'

  get 'sessions/create'

  get 'sessions/destroy'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get '/' => 'rides#index'
  get '/rides' => 'rides#index'
  post '/rides' => 'rides#create'

  namespace :api do
    namespace :v1 do
      get '/rides' => 'rides#index'
      post '/rides' => 'rides#create'
      get '/rides/:id' => 'rides#show'
      put '/rides/:id' => 'rides#update'
    end
  end

  get '/signup' => 'users#new'
  get '/users' => 'users#index'
  post '/users' => 'users#create'
  get '/users/:id' => 'users#show'

  namespace :api do
    namespace :v1 do
      get '/users' => 'users#index'
      get '/users/:id' => 'users#show'
    end
  end

  post '/friendships' => 'friendships#create'
  delete 'friendships' => 'friendships#destroy'

  get '/login' => 'sessions#new'
  post '/login' => 'sessions#create'
  get '/logout' => 'sessions#destroy'
end
