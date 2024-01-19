import express, { Request, Response } from "express";
import {Ticket}  from "../db/models";
import {Model} from "sequelize";
import multer from "multer";

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

const upload = multer({ dest: 'uploads/' })


const create = async (req: Request,res: Response): Promise<void> => {

    if(!req.body.title || !req.body.description || !req.body.priority || !req.body.status){
        res.status(400).json({msg: 'Please include title, description, priority, status'});
        return;
    }
    console.log(req.file);

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
    if(req.body.isAdmin) {
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
                user_id: req.body.user_id
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

        if (req.body.user_id !== ticketData.user_id && !req.body.isAdmin) {
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