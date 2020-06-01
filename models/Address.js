const { Model } = require('objection');

const User = require('./User.js');

class Address extends Model {
    static get tableName() {
      return 'addresses';
    }

    static relationMappings = {
        users: {
          relation: Model.HasOneRelation,
          modelClass: User,
          join: {
            from: 'adresses.id',
            to: 'users.addressId'
          }
        }
    };
}

module.exports = Address;