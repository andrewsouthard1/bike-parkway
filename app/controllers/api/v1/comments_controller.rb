class Api::V1::CommentsController < ApplicationController
  def index
    @comments = Comment.all
    render 'index.json.jbuilder'
  end
end
