const { Model } = require('objection');

const Order = require('./Order.js');
const Dish = require('./Dish.js');

class Ordered_item extends Model {
    static tableName = 'ordered_items';

    static relationMappings = {
        order: {
          relation: Model.BelongsToOneRelation,
          modelClass: Order,
          join: {
            from: 'ordered_items.order_id',
            to: 'orders.id'
          }
        },
        dish: {
            relation: Model.BelongsToOneRelation,
            modelClass: Dish,
            join: {
              from: 'ordered_items.dish_id',
              to: 'dishes.id'
            }
          }
    };
}

module.exports = Ordered_item;