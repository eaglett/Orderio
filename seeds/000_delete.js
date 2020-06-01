exports.seed = function(knex) {
    return knex('users').del()
      .then(function () {
        return knex('roles').del();
      })
      .then(function () {
          return knex('addresses').del();
      });
  };
  