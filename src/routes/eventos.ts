import express from "express";
import {
  listarEventos,
  criarEvento,
  obterEvento,
  excluirEvento,
  addParticipant,
  listParticipants,
} from "../controllers/EventoController";

const eventosRouter = express.Router();

eventosRouter.get("/", listarEventos);
eventosRouter.post("/", criarEvento);
eventosRouter.get("/:id", obterEvento);
eventosRouter.delete("/:id", excluirEvento);
eventosRouter.post("/add-user-event", addParticipant);
eventosRouter.post("/participants", listParticipants);

export default eventosRouter;
