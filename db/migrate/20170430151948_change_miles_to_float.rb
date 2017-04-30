class ChangeMilesToFloat < ActiveRecord::Migration[5.0]
  def change
    change_column :rides, :miles, :float
  end
end
