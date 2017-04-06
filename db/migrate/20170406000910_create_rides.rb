class CreateRides < ActiveRecord::Migration[5.0]
  def change
    create_table :rides do |t|
      t.string :starting_location
      t.string :ending_location
      t.integer :miles
      t.boolean :in_progress
      t.boolean :finished

      t.timestamps
    end
  end
end
