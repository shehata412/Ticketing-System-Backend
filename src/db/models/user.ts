import {DataTypes} from 'sequelize';
import {sequelize} from '../config/sequelize';

// @ts-ignore
// @ts-ignore
// @ts-ignore
export const User = sequelize.define('User', {
  // Model attributes are defined here
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
     allowNull: false
  },
    isAdmin: {
    type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
});