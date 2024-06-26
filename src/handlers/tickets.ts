import { User } from "./../db/models/user";
import express, { Request, Response } from "express";
import { Ticket } from "../db/models";
import { Model } from "sequelize";
import multer from "multer";
import path from "path";
import fs from "fs";
import classify_issue from ".././utils/chatgpt";
import { CreateCard } from ".././utils/trello";

interface UserRequest extends Request {
  user: {
    id: number;
    isAdmin: boolean;
    username?: string;
  };
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
};
const uploadDirectory = "uploads/";
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const create = async (req: Request, res: Response): Promise<Response> => {
  if (
    !req.body.title ||
    !req.body.description ||
    !req.body.priority ||
    !req.body.status
  ) {
    return res
      .status(400)
      .json({ msg: "Please include title, description, priority, status" });
  }
  let url: string = "";
  if (req.file) {
    req.body.attachment = path.join(uploadDirectory, req.file.filename);
    url = `https://ticket-api.masters-ts.com/${uploadDirectory}${req.file.filename}`;
  }
  req.body.user_id = (req as UserRequest).user.id;
  try {
    let Label_issue: string = process.env.LABEL_BOTH as string;
    let Label_priority: string = "";
    const newTicket = await Ticket.create(req.body);
    const userName = (req as UserRequest).user.username;
    //        const classification = await classify_issue(req.body.description);

    //        if(classification === 'backend') Label_issue = (process.env.LABEL_BACKEND) as string;
    //       if(classification === 'frontend') Label_issue = (process.env.LABEL_FRONTEND) as string;
    //        if(classification === 'both') Label_issue = (process.env.LABEL_BOTH) as string;
    if (req.body.priority == "low")
      Label_priority = process.env.LABEL_LOW as string;
    if (req.body.priority == "medium")
      Label_priority = process.env.LABEL_MEDIUM as string;
    if (req.body.priority == "high")
      Label_priority = process.env.LABEL_HIGH as string;

    CreateCard(
      process.env.TRELLO_MTS_LIST_ID as string,
      userName + "-  " + req.body.title,
      req.body.description + "  " + url,
      [Label_priority, Label_issue]
    );

    return res.json(newTicket);
  } catch (e) {
    return res.status(500).json(e);
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  if ((req as UserRequest).user.isAdmin) {
    try {
      const allTickets = await Ticket.findAll(
        {
          include: [
            {
              model: User,
              attributes: ["username"]
            },
          ],
        }
      );
      res.json({ tickets: allTickets, isAdmin: true });
      return;
    } catch (e) {
      res.status(500).json(e);
      return;
    }
  }
  try {
    const allTickets = await Ticket.findAll({
      where: {
        user_id: (req as UserRequest).user.id,
      },
    });
    res.json({tickets: allTickets});
    return;
  } catch (e) {
    res.status(500).json(e);
    return;
  }
};

const showone = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id;
  try {
    const ticket: Model<Ticket_data, Ticket_data> | null =
      await Ticket.findByPk(id);
    if (!ticket) {
      res.status(400).json({ msg: "Ticket not found" });
      return;
    }
    const ticketData: Ticket_data = ticket?.get({ plain: true }) as Ticket_data;
    if (
      (req as UserRequest).user.id !== ticketData.user_id &&
      !(req as UserRequest).user.isAdmin
    ) {
      res
        .status(403)
        .json({ msg: "You are not authorized to view this ticket" });
      return;
    }
    res.json(ticketData);
  } catch (e) {
    res.status(500).json(e);
    return;
  }
};

const updateTicket = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id;

  try {
    const ticket: Model<Ticket_data, Ticket_data> | null =
      await Ticket.findByPk(id);

    if (!ticket) {
      res.status(400).json({ msg: "Ticket not found" });
      return;
    }

    if (req.file) {
      req.body.attachment = path.join(uploadDirectory, req.file.filename);
    }

    const ticketData: Ticket_data = ticket?.get({ plain: true }) as Ticket_data;

    if (
      (req as UserRequest).user.id !== ticketData.user_id &&
      !(req as UserRequest).user.isAdmin
    ) {
      res
        .status(403)
        .json({ msg: "You are not authorized to update this ticket" });
      return;
    }
    await Ticket.update(req.body, {
      where: {
        id,
      },
    });
    res.json({ msg: "Ticket updated successfully" });
    return;
  } catch (e) {
    res.status(500).json(e);
    return;
  }
};

const updateTicketStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id: string = req.params.id;
  if (!(req as UserRequest).user.isAdmin) {
    res
      .status(403)
      .json({ msg: "You are not authorized to update this ticket" });
    return;
  }
  try {
    const ticket: Model<Ticket_data, Ticket_data> | null =
      await Ticket.findByPk(id);

    if (!ticket) {
      res.status(400).json({ msg: "Ticket not found" });
      return;
    }

    const ticketData: Ticket_data = ticket?.get({ plain: true }) as Ticket_data;

    const [affectedCount] = await Ticket.update(
      { status: "Resolved" },
      {
        where: {
          id,
        },
      }
    );
    console.log(affectedCount);
    res.json({ msg: "Ticket updated successfully" });
    return;
  } catch (e) {
    res.status(500).json(e);
    return;
  }
};

const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id;

  try {
    const ticket: Model<Ticket_data, Ticket_data> | null =
      await Ticket.findByPk(id);

    if (!ticket) {
      res.status(400).json({ msg: "Ticket not found" });
      return;
    }

    const ticketData: Ticket_data = ticket?.get({ plain: true }) as Ticket_data;

    if (ticketData.attachment) {
      fs.unlink(ticketData.attachment, (err) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
    if (
      (req as UserRequest).user.id !== ticketData.user_id &&
      !(req as UserRequest).user.isAdmin
    ) {
      res
        .status(403)
        .json({ msg: "You are not authorized to delete this ticket" });
      return;
    }
    await Ticket.destroy({
      where: {
        id,
      },
    });
    res.json({ msg: "Ticket deleted successfully" });
    return;
  } catch (e) {
    res.status(500).json(e);
    return;
  }
};

const ticketsRoute = (app: express.Application): void => {
  app.post("/ticket", upload.single("attachment"), create);
  app.get("/tickets", show);
  app.get("/ticket/:id", showone);
  app.patch("/ticket/:id", upload.single("attachment"), updateTicket);
  app.delete("/ticket/:id", deleteTicket);
  app.patch("/ticket/status/:id", updateTicketStatus);
};

export default ticketsRoute;
