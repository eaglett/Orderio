exports.seed = function(knex) {
  return knex('roles').select().then(roles => {
    return knex('addresses').select().then(addresses => {
      return knex('users').insert([   
        { email: "anejaorlic@gmail.com", password: "$2b$12$8WcmEztmBowHt6bDzvToZu/fO6VjTTfDblTkIQAsgCBPWQRbYJvgS", name: "Aneja Orlic", addressId: addresses.find(address => address.street === 'Nørrebrogade').id, roleId: roles.find(role => role.role === 'CUSTOMER').id, active: 1},
        { email: "node.aneja@gmail.com", password: "$2b$12$8WcmEztmBowHt6bDzvToZu/fO6VjTTfDblTkIQAsgCBPWQRbYJvgS", name: "Node restuaurant", addressId: addresses.find(address => address.street === 'Nørre Alle').id, roleId: roles.find(role => role.role === 'BUSINESS').id, active: 1}
      ]);
    });
  });
};
