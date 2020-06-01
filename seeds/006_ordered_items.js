exports.seed = function(knex) {
  return knex('users').select().then(users => {
    return knex('orders').select().then(orders => {
      return knex('dishes').select().then(dishes => {
        return knex('ordered_items').insert([   
          { orderId: orders.find(order => order.id === users.find(user => user.name === 'Aneja Orlic').id ).id, dishId: dishes.find(dish => dish.name === 'Dumplings').id },
          { orderId: orders.find(order => order.id === users.find(user => user.name === 'Aneja Orlic').id ).id, dishId: dishes.find(dish => dish.name === 'Soup').id }
        ]);
      });
    });
  });
};
  