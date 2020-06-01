exports.seed = function(knex) {
    return knex('users').select().then(users => {
        return knex('dishes').insert([   
          {name: "Dumplings", description: "Dough with a filling", price: 60, businessId: users.find( user => user.name === "Node restuaurant").id},
          {name: "Soup", description: "Tasty water", price: 50, businessId: users.find( user => user.name === "Node restuaurant").id},
          {name: "Burger", description: "Patty in between dough", price: 120, businessId: users.find( user => user.name === "Node restuaurant").id},
        ]);
      });
  };
  