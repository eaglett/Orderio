const { Model } = require('objection');

const Role = require('./Role.js');
const Address = require('./Address.js');
const Dish = require('./Dish.js');
const Order = require('./Order.js')

class User extends Model {
    static get tableName() {
      return 'users';
    }

    static relationMappings = {
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: Role,
          join: {
            from: 'users.roleId',
            to: 'roles.id'
          }
        },
        address: {
          relation: Model.BelongsToOneRelation,
          modelClass: Address,
          join: {
            from: 'users.addressId',
            to: 'addresses.id'
          }
        },
        dish: {
          relation: Model.HasManyRelation,
          modelClass: Dish,
          join: {
            from: 'users.id',
            to: 'dished.businessId'
          }
        },
        orderBusiness: {
          relation: Model.HasManyRelation,
          modelClass: Order,
          join: {
            from: 'users.id',
            to: 'orders.businessId'
          }
        },
        orderCustomer: {
          relation: Model.HasManyRelation,
          modelClass: Order,
          join: {
            from: 'users.id',
            to: 'orders.customerId'
          }
        }
    };
}

module.exports = User;