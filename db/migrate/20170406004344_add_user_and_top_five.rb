class AddUserAndTopFive < ActiveRecord::Migration[5.0]
  def change
    add_column :rides, :user_id, :integer
    add_column :rides, :top_five, :boolean 
  end
end
