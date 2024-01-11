import express, { Request, Response } from "express";
import {Ticket}  from "../db/models";
import jwt, {JwtPayload} from "jsonwebtoken";
import {Model} from "sequelize";

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


const create = async (req: Request, res: Response): Promise<void> => {

    if(!req.body.title || !req.body.description || !req.body.priority || !req.body.status || !req.body.user_id){
        res.status(400).json({msg: 'Please include title, description, priority, status and user_id'});
        return;
    }

    try {
        const newTicket = await Ticket.create(req.body);
        res.json(newTicket);
    } catch (e) {
        res.status(500).json(e);
    }
}

const showall = async (req: Request, res: Response): Promise<void> => {
    try {
        const allTickets = await Ticket.findAll();
        res.json(allTickets);
    } catch (e) {
        res.status(500).json(e);
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
        const token: string | undefined = req.headers.authorization?.split(' ')[1];

        try {
            if (!token) {
                res.status(401).json({ msg: 'Token missing' });
                return;
            }

            const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string, { algorithms: ['HS256'] }) as JwtPayload;

            if (decoded.id !== ticketData.user_id && !decoded.isAdmin) {
                res.status(403).json({ msg: 'You are not authorized to update this ticket' });
                return;
            }
        } catch (e) {
            res.status(401).json({ msg: 'Invalid token' });
            return;
        }
        await Ticket.update(req.body, {
            where: {
                id
            }
        });
        res.json({ msg: 'Ticket updated successfully' });
    } catch (e) {
        res.status(500).json(e);
    }
}

const ticketsRoute = (app: express.Application): void =>{
    app.post('/ticket', create);
    app.get('/tickets', showall);
    app.patch('/ticket/:id', updateTicket);
}

export default ticketsRoute;