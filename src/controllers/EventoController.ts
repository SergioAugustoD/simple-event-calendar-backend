import { Request, Response } from 'express';
import Evento from '../models/Evento';

const eventos: Evento[] = [];

// GET /eventos
export const listarEventos = (req: Request, res: Response): void => {
  res.json(eventos);
};

// POST /eventos
export const criarEvento = (req: Request, res: Response): void => {
  const { title, date, description, location } = req.body;

  const novoEvento: Evento = {
    id: eventos.length + 1,
    title,
    date,
    description,
    location,
    created_at: new Date().toDateString()
  };

  eventos.push(novoEvento);

  res.status(201).json(novoEvento);
};

// GET /eventos/:id
export const obterEvento = (req: Request, res: Response): void => {
  const eventoId = parseInt(req.params.id, 10);
  const evento = eventos.find((evt) => evt.id === eventoId);

  if (evento) {
    res.json(evento);
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
};

// DELETE /eventos/:id
export const excluirEvento = (req: Request, res: Response): void => {
  const eventoId = parseInt(req.params.id, 10);
  const eventoIndex = eventos.findIndex((evt) => evt.id === eventoId);

  if (eventoIndex !== -1) {
    eventos.splice(eventoIndex, 1);
    res.sendStatus(204);
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
};

export default {
  listarEventos,
  criarEvento,
  obterEvento,
  excluirEvento,
};
