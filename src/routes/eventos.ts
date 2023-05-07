import express from 'express';
import { listarEventos, criarEvento, obterEvento, excluirEvento } from '../controllers/EventoController';

const eventosRouter = express.Router();

eventosRouter.get('/', listarEventos);
eventosRouter.post('/', criarEvento);
eventosRouter.get('/:id', obterEvento);
eventosRouter.delete('/:id', excluirEvento);

export default eventosRouter;
