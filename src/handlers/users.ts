import express, { Request, Response } from 'express';
import  {User, Ticket}  from '../db/models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {Model} from "sequelize";

    type User_data = {
    id?: number;
    username: string;
    password: string;
    isAdmin: boolean;
    created_at?: Date;
    updated_at?: Date;
}


const show = async (req: Request, res: Response): Promise<void>=>{
    try {
        const allUsers = await User.findAll();
        res.json(allUsers);
    } catch(e){
        res.status(500).json(e);
    }
}
const create = async (req: Request, res: Response) : Promise<void> =>{
    if(!req.body.username || !req.body.password){
        res.status(400).json({msg: 'Please include username and password'});
    }
    req.body.password  = bcrypt.hashSync(req.body.password + process.env.BCRYPT_PASS as string ,parseInt( process.env.SALT_ROUNDS as string));
    try{
        const newUser = await User.create(req.body);
        res.json(newUser);
    } catch(e){
        res.status(500).json(e)
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({msg: 'Please include username and password'});
        return;
    }
    try {
        const user: Model<User_data, User_data> | null = await User.findOne({
            where: {
                username: req.body.username
            }
        });
        if (!user) {
            res.status(400).json({msg: 'User not found'});
            return;
        }
        const userData: User_data = user?.get({plain: true}) as User_data;
        console.log(userData);
        if (!bcrypt.compareSync(req.body.password + process.env.BCRYPT_PASS as string, userData?.password as string)) {
            res.status(400).json({msg: 'Incorrect password'});
            return;
        }
        const token : string = jwt.sign({id: userData.id, username: userData.username, isAdmin: userData.isAdmin}, process.env.TOKEN_SECRET as string);
        res.json({token});
    } catch (e) {
        res.status(500).json(e);
    }
}

const showusertickets = async (req: Request, res: Response): Promise<void>=>{
        if(!req.body.user_id){
        res.status(400).json({msg: 'Please include user_id'});
        }
    try {
        const allTickets = await Ticket.findAll({
            where: {
                user_id: req.body.user_id
            }
        });
        res.json(allTickets);
    } catch(e){
        res.status(500).json(e);
    }
}




const userRoutes = (app: express.Application): void =>{
    app.post('/user', create);
    app.get('/user', show);
    app.post('/login', login);
    app.post('/user/tickets/', showusertickets);
}

export default userRoutes;