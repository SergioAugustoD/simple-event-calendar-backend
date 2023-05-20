import { Request, Response } from "express";
import { IParticipant } from "../../../simple-event-calendar-frontend/src/interfaces/IParticipants";
import { dbQuery } from "../database/database";
import {
  respJson200,
  respJson400,
  respJson404,
  respJson500,
} from "../util/respJson";

/**
 * Recupera os eventos que foram confirmados até a data e hora atual.
 *
 * @param {Request} req - O objeto de solicitação.
 * @param {Response} res - O objeto de resposta.
 * @return {Promise<void>} - Uma promessa que resolve quando a execução da função termina.
 */
export const listEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const confirmedEvents = await dbQuery(
    "SELECT * FROM events WHERE confirme_until > ?",
    [new Date().toLocaleString()]
  );
  if (confirmedEvents.length > 0) {
    res.json(confirmedEvents);
  } else {
    respJson404(res, "Não existem eventos cadastrados");
  }
};

/**
 * Cria um novo evento no banco de dados com os parâmetros fornecidos no corpo da solicitação.
 *
 * @async
 * @param {Request} req - O objeto de solicitação.
 * @param {Response} res - O objeto de resposta.
 * @return {Promise<void>} - Uma Promise que resolve quando a execução da função termina.
 */
export const createEvent = async (
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
    confirme_until,
    district,
    uf,
  } = req.body;

  const now = new Date();
  const cep = locationCEP ? `${locationCEP}` : "";
  const sql = `
    INSERT INTO events (
      title,
      date,
      description,
      location,
      category,
      created_by,
      id_user,
      created_at,
      confirme_until
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  if (new Date(confirme_until).toLocaleString() < now.toLocaleString()) {
    respJson400(
      res,
      "Data de confirmação tem que ser maior que a data/hora atual!"
    );
    return;
  }

  if (new Date(date).toLocaleString() < now.toLocaleString()) {
    respJson400(res, "Data do evento tem que ser maior que a data/hora atual!");
    return;
  }

  try {
    await dbQuery(sql, [
      title,
      new Date(date).toLocaleString(),
      description,
      `${location}, ${locationNumber} - ${district}, ${locationCity} - ${uf}, ${cep}`,
      category,
      created_by,
      id_user,
      now,
      new Date(confirme_until).toLocaleString(),
    ]);
    respJson200(res, "Evento criado com sucesso.");
  } catch (err) {
    respJson500(res, err.message);
  }
};

/**
 * Recupera um evento do banco de dados por ID e o envia na resposta como um objeto JSON.
 *
 * @async
 * @function getEvent
 * @param {Request} req - O objeto de solicitação expressa que contém o ID do evento a ser recuperado.
 * @param {Response} res - O objeto de resposta expressa usado para enviar o evento recuperado.
 * @returns {Promessa<void>}
 */
export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const event = await dbQuery("SELECT * FROM events WHERE id = ?", [eventId]);
    event.length > 0
      ? res.json(event)
      : respJson404(res, "Evento não encontrado");
  } catch (error) {
    respJson500(res, error.message);
  }
};

/**
 * Exclui um evento do banco de dados com o id especificado nos parâmetros da solicitação.
 *
 * @param {Request} req - O objeto de solicitação HTTP contendo o id do evento a ser excluído.
 * @param {Response} res - O objeto de resposta HTTP usado para enviar uma resposta indicando se a exclusão foi bem-sucedida.
 * @return {Promise<void>} - Uma promessa que resolve quando a exclusão é concluída.
 */
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  const result = await dbQuery("DELETE FROM events WHERE id = ?", [id]);
  if (result) {
    respJson200(res, "Evento deletado com sucesso");
  }
};

/**
 * Adiciona um participante a um evento com o ID de usuário, ID do evento e nome do participante.
 *
 * @async
 * @param {Request<any, any, IParticipant>} req - O objeto de solicitação que contém as informações do participante.
 * @param {Response} res - O objeto de resposta.
 * @return {Promise<void>} Uma promessa que resolve quando o participante é adicionado ao evento.
 * @throws {Error} Se ocorrer um erro ao adicionar o participante ao evento.
 */
export const addParticipant = async (
  req: Request<any, any, IParticipant>,
  res: Response
): Promise<void> => {
  const { id_user, id_event, name_participant } = req.body;

  try {
    const [userExists, eventExists, participantExists] = await Promise.all([
      dbQuery("SELECT * FROM users WHERE id = ?", [id_user]),
      dbQuery("SELECT * FROM events WHERE id = ?", [id_event]),
      dbQuery("SELECT * FROM participants WHERE id_user = ? AND id_event = ?", [
        id_user,
        id_event,
      ]),
    ]);

    if (participantExists.length > 0) {
      respJson400(res, "Você já é um participante deste evento!");
      return;
    }

    if (!userExists.length) {
      respJson404(res, "Usuário não encontrado");
      return;
    }

    if (!eventExists.length) {
      respJson404(res, "Evento não encontrado");
      return;
    }

    await dbQuery(
      "INSERT INTO participants (id_user, id_event, name_participant) VALUES (?, ?, ?)",
      [id_user, id_event, name_participant]
    );
    respJson200(res, "Adicionado com sucesso no evento!");
  } catch (error) {
    respJson500(res, error.message);
  }
};

/**
 * Recupera uma lista de participantes para um determinado ID de evento do banco de dados e a envia como uma resposta JSON.
 *
 * @param {Request} req - O objeto de solicitação HTTP.
 * @param {Response} res - O objeto de resposta HTTP.
 * @return {Promise<void>} - Promessa que resolve quando a função é concluída com sucesso.
 */
export const listParticipants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id_event } = req.body;
  try {
    const participants = await dbQuery(
      "SELECT * FROM participants WHERE id_event = ?",
      [id_event]
    );

    res.json(participants);
  } catch (error) {
    respJson500(res, error.message);
  }
};

/**
 * Recupera eventos associados a um determinado ID de participante do banco de dados
 *
 * @param {Request} req - o objeto Request expresso
 * @param {Response} res - o objeto Response expresso
 * @return {Promise<void>} - uma promessa que resolve sem valor
 */
export const getEventsByParticipantId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id_user } = req.body;

  try {
    const events = await dbQuery(
      "SELECT * FROM participants pp INNER JOIN events ev ON ev.id = pp.id_event WHERE pp.id_user = ?",
      [id_user]
    );

    res.json(events);
  } catch (error) {
    respJson500(res, error.message);
  }
};

export const confirmEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id_user, id_event, confirme_until } = req.body;
  const now = Date.now();
  const confirmUntilMillis = new Date(confirme_until).getTime();

  if (now > confirmUntilMillis) {
    respJson400(res, "Data de confirmação expirou!");
    return;
  }

  try {
    const result = await dbQuery(
      "UPDATE participants SET confirmed = ? WHERE id_event = ? AND id_user = ?",
      ["true", id_event, id_user]
    );
    if (result) {
      respJson200(res, "Evento confirmado com sucesso.");
    } else {
      respJson400(res, "Evento ou usuário não encontrado.");
    }
  } catch (error) {
    respJson500(res, error.message);
  }
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { comment, idUser, idEvent, author } = req.body;
  const now = new Date();
  try {
    const result = await dbQuery(
      `
      INSERT INTO event_comments (comment, idUser, idEvent, author, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      [comment, idUser, idEvent, author, now.toLocaleString()]
    );

    if (result) {
      res.json({ result, msg: "Comment added successfully.", status: 200 });
    } else {
      respJson400(res, "Erro ao adicionar o comentário.");
    }
  } catch (error) {
    respJson500(res, error.message);
  }
};

export const getCommentsByEventId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { idEvent } = req.body;

  try {
    const results = await dbQuery(
      `
      SELECT *
      FROM event_comments
      WHERE idEvent = ?
      ORDER BY created_at DESC
    `,
      [idEvent]
    );
    res.json(results);
  } catch (error) {
    throw new Error(
      `Error fetching comments for event ${idEvent}: ${error.message}`
    );
  }
};
export default {
  listEvents,
  createEvent,
  getEvent,
  deleteEvent,
  addParticipant,
  listParticipants,
  getEventsByParticipantId,
  confirmEvent,
};
