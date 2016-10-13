const bcrypt = require('bcrypt');
const _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING,
			allowNull: false
		},
		passwordHash: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('passwordHash', hashedPassword);
			}
		}
	}, { 
		hooks: {
			beforeValidate (user, options) {
				if (typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods: {
			toPublicJson: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}
	});
};