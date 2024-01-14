import express, {Application , Request, Response} from 'express';
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {sequelize} from './db/config/sequelize';
import userRoutes from './handlers/users';
import ticketsRoute from "./handlers/tickets";
import { authenticate } from './middlewares/authenticate';
import cors from 'cors';

dotenv.config();

const port: string | 3000  = process.env.PORT || 3000;
const app: Application = express(); // create express app
app.use(bodyParser.json()); // add body parser
app.use(cors());
app.all('*', authenticate);

userRoutes(app);
ticketsRoute(app);

app.listen(process.env.PORT || 3000, (): void=>{
    console.log(`Listening on port ${port}`)
    sequelize.sync()
        .then(() => console.log('Database connected...'))
        .catch((err: Error) => console.log('Error: ' + err))
})

