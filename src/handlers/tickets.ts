import { User } from './../db/models/user';
import express, { Request, Response } from "express";
import {Ticket}  from "../db/models";
import {Model} from "sequelize";
import multer from "multer";
import path from "path";



interface UserRequest extends Request {
    user: {
      id: number;
      isAdmin: boolean;
    }
  }

type Ticket_data = {
    id?: number;
    title: string;
    description: string;
    priority: number;
    status: string;
    attachment?: string;
    user_id: number;
    created_at?: Date;
    updated_at?: Date;
}
const uploadDirectory = 'uploads/'; 
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage })


const create = async (req: Request,res: Response): Promise<void> => {

    if(!req.body.title || !req.body.description || !req.body.priority || !req.body.status){
        res.status(400).json({msg: 'Please include title, description, priority, status'});
        return;
    }
    if(req.file){
        req.body.attachment = path.join(uploadDirectory,req.file.filename);
    }
    req.body.user_id = (req as UserRequest).user.id;
    try {
        const newTicket = await Ticket.create(req.body);
        res.json(newTicket);
        return;
    } catch (e) {
        res.status(500).json(e);
        return;
    }
}

const show = async (req: Request, res: Response): Promise<void> => {
    if((req as UserRequest).user.isAdmin) {
        try {
            const allTickets = await Ticket.findAll();
             res.json(allTickets);
             return;
        } catch (e) {
            res.status(500).json(e);
            return;
        }
    }
    try {
        const allTickets = await Ticket.findAll({
            where: {
                user_id: (req as UserRequest).user.id
            }
        });
        res.json(allTickets);
        return;
    } catch (e) {
        res.status(500).json(e);
        return;
    }
}

const updateTicket = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id;

    try {
        const ticket: Model<Ticket_data, Ticket_data> | null = await Ticket.findByPk(id);

        if (!ticket) {
            res.status(400).json({ msg: 'Ticket not found' });
            return;
        }

        const ticketData: Ticket_data = ticket?.get({ plain: true }) as Ticket_data;

        if ((req as UserRequest).user.id !== ticketData.user_id && !(req as UserRequest).user.isAdmin) {
            res.status(403).json({ msg: 'You are not authorized to update this ticket' });
            return;
        }
        await Ticket.update(req.body, {
            where: {
                id
            }
        });
        res.json({ msg: 'Ticket updated successfully' });
        return;
    } catch (e) {
        res.status(500).json(e);
        return;
    }
}

const ticketsRoute = (app: express.Application): void =>{
    app.post('/ticket',upload.single('attachment') ,create);
    app.get('/tickets', show);
    app.patch('/ticket/:id', updateTicket);
}

export default ticketsRoute;