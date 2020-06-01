exports.seed = function(knex) {
    return knex('users').select().then(users => {
        return knex('orders').insert([   
          {customerId: users.find( user => user.name === "Aneja Orlic").id, businessId: users.find( user => user.name === "Node restuaurant").id, price: 110, paid: 1}
        ]);
      });
  };
  