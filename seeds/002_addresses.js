
exports.seed = function(knex) {
  return knex('addresses').insert([
    { street: "Nørrebrogade", number: "1", post_nb: "2200", city: "København", country: "Danmark"},
    { street: "Nørre Alle", number: "7", post_nb: "2200", city: "København", country: "Danmark"}
  ]);    
};
