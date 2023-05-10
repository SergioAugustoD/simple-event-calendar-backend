import { Request, Response } from "express";
import { dbQuery } from "../database/database";
import moment from "moment";

// GET /eventos
export const listarEventos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventos = await dbQuery("SELECT * FROM eventos");

  if (eventos.length > 0) {
    res.json(eventos);
  } else {
    res.json({
      status: 404,
      err: true,
      msg: "Não existem eventos cadastrados",
    });
  }
};

// POST /eventos
export const criarEvento = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    date,
    description,
    location,
    id_user,
    locationNumber,
    locationCity,
    locationCEP,
    category,
    created_by,
  } = req.body;
  let dateNow = new Date();
  let dateEvent = new Date(date);

  const novoEvento = [
    title,
    dateEvent.toLocaleDateString(),
    description,
    location + " " + locationNumber + "," + locationCity + " " + locationCEP,
    id_user,
    new Date().toLocaleString(),
    category,
    created_by,
  ];
  const cep = locationCEP ? " - " + locationCEP : locationCEP;
  const sql = `INSERT INTO eventos (title, date, description,location,category,created_by,id_user, created_at) VALUES (?, ?,?,?, ?,?,?,?)`;
  await dbQuery(sql, [
    title,
    moment(date.replace("/", "-")).format("DD/MM/yyyy"),
    description,
    "R." + location + " , " + locationNumber + " , " + locationCity + cep,
    category,
    created_by,
    id_user,
    dateNow.toLocaleString(),
  ])
    .then(() => {
      res.json({
        status: 200,
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
  const eventoId = parseInt(req.params.id);
  const eventoIndex = await dbQuery("SELECT * FROM eventos WHERE id = ?", [
    eventoId,
  ]);

  if (eventoIndex.length > 0) {
    await dbQuery("DELETE FROM eventos WHERE id =?", [eventoId]);
    res.json({ status: 200, err: false, msg: `Evento deletado com sucesso.` });
  } else {
    res.json({ status: 404, err: true, msg: "Evento não encontrado" });
  }
};

export default {
  listarEventos,
  criarEvento,
  obterEvento,
  excluirEvento,
};
