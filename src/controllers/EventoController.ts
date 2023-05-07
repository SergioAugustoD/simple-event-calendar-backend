import { Request, Response } from "express";
import { dbQuery } from "../database/database";

// GET /eventos
export const listarEventos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventos = await dbQuery("SELECT * FROM eventos");

  if (eventos.length > 0) {
    res.json(eventos);
  } else {
    res.status(404).json({
      msg: "Não existem eventos cadastrados",
    });
  }
};

// POST /eventos
export const criarEvento = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, date, description, location } = req.body;

  const novoEvento = [
    title,
    date,
    description,
    location,
    new Date().toDateString(),
  ];

  const sql = `INSERT INTO eventos (title, date, description,location, created_at) VALUES (?, ?, ?,?,?)`;
  await dbQuery(sql, [
    title,
    date,
    description,
    location,
    new Date().toDateString(),
  ])
    .then(() => {
      res.status(201).json({
        err: false,
        msg: "Evento criado com sucesso.",
        evento: novoEvento,
      });
    })
    .catch((err) => {
      res.json({ err: true, msg: err.message });
    });
};

// GET /eventos/:id
export const obterEvento = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventoId = parseInt(req.params.id, 10);
  const evento = await dbQuery("SELECT * FROM eventos WHERE id = ?", [
    eventoId,
  ]);

  if (evento) {
    res.json(evento);
  } else {
    res.status(404).json({ err: true, msg: "Evento não encontrado" });
  }
};

// DELETE /eventos/:id
export const excluirEvento = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventoId = parseInt(req.params.id, 10);
  const eventoIndex = await dbQuery("SELECT * FROM eventos WHERE id = ?", [
    eventoId,
  ]);

  if (eventoIndex.length > 0) {
    await dbQuery("DELETE FROM eventos WHERE id =?", [eventoId]);
    res.sendStatus(204);
  } else {
    res.status(404).json({ err: true, msg: "Evento não encontrado" });
  }
};

export default {
  listarEventos,
  criarEvento,
  obterEvento,
  excluirEvento,
};
