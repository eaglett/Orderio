
exports.up = function(knex) {
  
    return knex.schema
        .createTable('roles', (table) => {
            table.increments('id').notNullable();
            table.string('role').unique().notNullable();
        })
        .createTable('addresses', (table) => {
            table.increments('id').notNullable();

            table.string('street').notNullable();
            table.string('number').notNullable();
            table.string('additional');

            table.string('post_nb').notNullable();
            table.string('city').notNullable();
            table.string('country').notNullable();
        })
        .createTable('users', (table) => {
            table.increments('id').notNullable();

            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('name').notNullable();
            

            table.integer('address_id').unsigned()
            table.foreign('address_id').references('addresses.id');

            table.integer('role_id').unsigned().notNullable();
            table.foreign('role_id').references('roles.id');

            table.dateTime('updated_at').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'));
            table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));

            table.boolean('active').defaultTo(false);
        })
        .createTable('dishes', (table) => {
            table.increments('id').notNullable();

            table.string('name').notNullable();
            table.string('description');
            table.float('price').notNullable();
            
            table.integer('business_id').unsigned().notNullable();
            table.foreign('business_id').references('users.id');
        })
        .createTable('orders', (table) => {
            table.increments('id').notNullable();

            table.integer('customer_id').unsigned().notNullable();
            table.foreign('customer_id').references('users.id');

            table.integer('business_id').unsigned().notNullable();
            table.foreign('business_id').references('users.id');

            table.integer('price').defaultTo(0);
            table.boolean('paid').defaultTo(false);

            table.dateTime('date_created').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        })
        .createTable('ordered_items', (table) => {
            table.increments('id').notNullable();

            table.integer('order_id').unsigned().notNullable();
            table.foreign('order_id').references('orders.id');

            table.integer('dish_id').unsigned().notNullable();
            table.foreign('dish_id').references('dishes.id');
        })
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('ordered_items')
        .dropTableIfExists('orders')
        .dropTableIfExists('dishes')
        .dropTableIfExists('users')
        .dropTableIfExists('roles')
        .dropTableIfExists('addresses');
        
};
