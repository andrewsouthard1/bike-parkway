class CreateSavedRides < ActiveRecord::Migration[5.0]
  def change
    create_table :saved_rides do |t|
      t.integer :ride_id
      t.integer :user_id
      t.boolean :top_five

      t.timestamps
    end
  end
end
