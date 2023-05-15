import express from "express";
import {
  listEvents,
  createEvent,
  getEvent,
  deleteEvent,
  addParticipant,
  listParticipants,
  getEventsByParticipantId,
  confirmEvent,
  getCommentsByEventId,
  createComment,
} from "../controllers/EventoController";

const eventsRouter = express.Router();

eventsRouter.get("/", listEvents);
eventsRouter.post("/", createEvent);
eventsRouter.get("/:id", getEvent);
eventsRouter.delete("/:id", deleteEvent);
eventsRouter.post("/add-user-event", addParticipant);
eventsRouter.post("/participants", listParticipants);
eventsRouter.post("/events-participant", getEventsByParticipantId);
eventsRouter.post("/confirm", confirmEvent);
eventsRouter.post("/create-comment", createComment);
eventsRouter.post("/comments", getCommentsByEventId);

export default eventsRouter;
