import {DataTypes} from 'sequelize';
import {sequelize} from '../config/sequelize';

// @ts-ignore
// @ts-ignore
// @ts-ignore
export const Ticket = sequelize.define('Ticket', {
    // Model attributes are defined here
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    attachment:{
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {
});


