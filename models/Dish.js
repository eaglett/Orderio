const { Model } = require('objection');

const User = require('./User.js');
const Order = require('./Order.js');

class Dish extends Model {
    static tableName = 'dishes';

    static relationMappings = {
        user: {
          relation: Model.BelongsToOneRelation,
          modelClass: User,
          join: {
            from: 'dishes.businessId',
            to: 'users.id'
          }
        },
        order: {
          relation: Model.ManyToManyRelation,
          modelClass: Dish,
          join: {
            from: 'dish.id',
            through: {
              // ordered_items is the join table.
              from: 'ordered_items.dishId',
              to: 'ordered_items.orderId'
            },
            to: 'order.id'
          }
        }
    };
}

module.exports = Dish;