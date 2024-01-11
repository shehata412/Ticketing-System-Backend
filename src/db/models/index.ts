import {User} from './user';
import {Ticket} from './ticket';

User.hasMany(Ticket, {foreignKey: 'user_id'});
Ticket.belongsTo(User, {foreignKey: 'user_id'});

export { User, Ticket };