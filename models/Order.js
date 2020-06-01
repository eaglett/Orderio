const { Model } = require('objection');

const User = require('./User.js');
const Dish = require('./Dish.js');

class Order extends Model {
    static get tableName() {
      return 'orders';
    }

    static relationMappings = {
        business: {
          relation: Model.BelongsToOneRelation,
          modelClass: User,
          join: {
            from: 'orders.businessId',
            to: 'users.id'
          }
        },
        customer: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
              from: 'orders.customerId',
              to: 'users.id'
            }
        },
        dish: {
          relation: Model.ManyToManyRelation,
          modelClass: Dish,
          join: {
            from: 'orders.id',
            through: {
              // ordered_items is the join table.
              from: 'ordered_items.orderId',
              to: 'ordered_items.dishId'
            },
            to: 'dishes.id'
          }
        }
    };
}

module.exports = Order;