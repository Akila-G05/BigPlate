-- Add detailed fields to menu_items table
alter table menu_items add column if not exists description text;
alter table menu_items add column if not exists spice_level text default 'Mild';
alter table menu_items add column if not exists prep_time text default '15 min';
alter table menu_items add column if not exists tags text[] default '{}';

-- Update existing items with details
update menu_items set 
  description = 'Massive stacked burger with premium toppings, special sauce, and fresh ingredients.',
  spice_level = 'Mild',
  prep_time = '15-20 min',
  tags = '{"Beef","Signature","Bestseller"}'
where name = 'Tower Burger';

update menu_items set 
  description = 'Classic beef burger with our special Big Plate sauce, fresh lettuce, tomatoes, and melted cheese.',
  spice_level = 'Mild',
  prep_time = '10-15 min',
  tags = '{"Beef","Classic"}'
where name = 'Beef Burger';

update menu_items set 
  description = 'Loaded chicken sub with fresh veggies, melted cheese, and our signature dressing in a fresh baked sub roll.',
  spice_level = 'Medium',
  prep_time = '10-15 min',
  tags = '{"Chicken","New"}'
where name = 'Chicken Submarine';

update menu_items set 
  description = 'Spicy Indo-Chinese devilled chicken with peppers, onions, and our secret spice blend.',
  spice_level = 'Hot',
  prep_time = '15-20 min',
  tags = '{"Chicken","Spicy","Chinese"}'
where name = 'Devilled Chicken';

update menu_items set 
  description = 'Wok-fried rice with tender chicken pieces and fresh vegetables in our signature sauce.',
  spice_level = 'Mild',
  prep_time = '15 min',
  tags = '{"Chicken","Rice"}'
where name = 'Chicken Fried Rice';

update menu_items set 
  description = 'Aromatic basmati rice cooked with perfectly spiced chicken, saffron, and premium spices.',
  spice_level = 'Medium',
  prep_time = '20-25 min',
  tags = '{"Chicken","Indian","Rice"}'
where name = 'Chicken Biryani';

update menu_items set 
  description = 'Chopped roti stir-fried with tender chicken, fresh vegetables, and aromatic Sri Lankan spices.',
  spice_level = 'Medium',
  prep_time = '15-20 min',
  tags = '{"Chicken","Sri Lankan"}'
where name = 'Chicken Kottu';

update menu_items set 
  description = 'Fresh baked garlic naan bread from our tandoor oven. Perfect with any curry.',
  spice_level = 'Mild',
  prep_time = '5-10 min',
  tags = '{"Bread","Indian"}'
where name = 'Garlic Naan';

update menu_items set 
  description = 'Spicy stir-fried beef with bell peppers, onions, and our signature chilli sauce.',
  spice_level = 'Hot',
  prep_time = '15-20 min',
  tags = '{"Beef","Spicy","Chinese"}'
where name = 'Chilli Beef';

update menu_items set 
  description = 'Creamy yogurt mango smoothie made with real mango pulp and a hint of cardamom.',
  spice_level = 'None',
  prep_time = '5 min',
  tags = '{"Drink","Sweet"}'
where name = 'Mango Lassi';
