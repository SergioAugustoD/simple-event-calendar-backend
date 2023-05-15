import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { dbQuery } from "../database/database";
import nodemailer from "nodemailer";
import {
  respJson200,
  respJson401,
  respJson404,
  respJson500,
} from "../util/respJson";

/**
 * Gera um JSON Web Token (JWT) com um determinado ID de usuário e e-mail.
 * @param id - ID do usuário.
 * @param email - O email do usuário.
 * @returns O JWT gerado.
 */
export const generateToken = (id: string, email: string): string => {
  const payload = { userId: id, userEmail: email };
  const options = { expiresIn: "2h" };
  const secretKey = process.env.JWT_SECRET;

  return jwt.sign(payload, secretKey, options);
};

/**
 * Cria um novo usuário no banco de dados.
 * @param req - O objeto de solicitação que contém os dados do usuário no corpo.
 * @param res - O objeto de resposta para enviar o resultado da operação.
 * @retorna nulo
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, givenName } = req.body;

    // Verifica se o e-mail ou o apelido já existe
    const [emailExists, givenNameExists] = await Promise.all([
      dbQuery("SELECT * FROM users WHERE email = ?", [email]),
      dbQuery("SELECT * FROM users WHERE given_name = ?", [givenName]),
    ]);
    if (emailExists.length > 0) {
      respJson404(res, "Email está em uso.");
      return;
    }
    if (givenNameExists.length > 0) {
      respJson404(res, "Apelido está em uso.");
      return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insere o usuário na base
    const sql = `
      INSERT INTO users (name, email, password, given_name)
      VALUES (?, ?, ?, ?)
    `;
    const token = generateToken(uuidv4(), email);
    await dbQuery(sql, [name, email, hashedPassword, givenName]);

    // Retorna sucesso no response
    respJson200(res, "Usuário criado com sucesso.", token);
  } catch (error) {
    console.error("Erro ao criar o usuário:", error);
    respJson500(res, "Erro ao criar o usuário.");
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gutogtt1@gmail.com",
    pass: process.env.PASSWORD_NODEMAILER,
  },
});

/**
 * Envia um e-mail de redefinição de senha para o endereço de e-mail especificado.
 * @param to - O endereço de e-mail do destinatário.
 */
async function sendPasswordResetEmail(to: string) {
  const mailOptions = {
    from: "Simple Event Calendar <gutogtt1@gmail.com>",
    to,
    subject: "Resetar senha",
    text: `Você solicitou uma redefinição de senha. Clique no link a seguir para redefinir sua senha: http://localhost:5173/reset-password?email=${to}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(info.response || info.rejected);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Redefine a senha de um usuário com o e-mail fornecido.
 * Envia um e-mail com instruções de redefinição de senha.
 * @param req - O objeto de solicitação Express.
 * @param res - O objeto de resposta Express.
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      respJson404(res, "User not found");
      return;
    }

    await sendPasswordResetEmail(email);
    respJson200(res, "Reset de senha enviado com sucesso!");
  } catch (error) {
    console.error(error);
    respJson500(
      res,
      "Erro interno do servidor, entre em contato com um administrador"
    );
  }
};

const getUserByEmail = async (email: string) => {
  const query = "SELECT * FROM users WHERE email = ?";
  const result = await dbQuery(query, [email]);
  return result[0];
};

/**
 * Atualiza a senha de um usuário no banco de dados
 *
 * @param {Request} req - O objeto de solicitação contendo o e-mail do usuário e a nova senha
 * @param {Response} res - O objeto de resposta que enviará uma mensagem de sucesso ou erro
 * @return {Promise<void>} Uma promessa que resolve quando a senha é atualizada com sucesso
 */
export const updateUserPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Generate the password hash
  const passwordHash = await bcrypt.hash(password, salt);

  const passwordUpdateResult = await dbQuery(
    "UPDATE users SET password = ? WHERE email = ?",
    [passwordHash, email]
  );

  if (passwordUpdateResult.length === 0) {
    respJson404(res, "User not found");
    return;
  }

  return respJson200(res, "Password updated successfully");
};

/**
 * Autentica um usuário por e-mail e senha. Responde com um objeto JSON contendo
 * um sinalizador de sucesso, uma mensagem, um token, o ID do usuário e o nome do usuário se o
 * a autenticação foi bem-sucedida. Caso contrário, ele responde com uma mensagem de erro.
 *
 * @async
 * @função loginUser
 * @param {Request} req - O objeto de solicitação contendo o e-mail e a senha no corpo.
 * @param {Response} res - O objeto de resposta que conterá o sinalizador de sucesso, mensagem,
 * token, ID do usuário e apelido fornecido se a autenticação foi bem-sucedida.
 * @throws {Json401Error} Caso o e-mail não esteja cadastrado ou a senha esteja incorreta.
 * @throws {Json500Error} Se houver um erro interno do servidor ao gerar um token ou
 * fazendo login.
 */

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const [user] = await dbQuery("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    respJson401(res, "Credenciais erradas");
    return;
  }

  try {
    const [isCorrectPassword, token] = await Promise.all([
      bcrypt.compare(password, user.password),
      generateToken(user.id, user.email),
    ]);

    if (!isCorrectPassword) {
      respJson401(res, "Credenciais erradas");
      return;
    }

    res.json({
      success: true,
      msg: "Logado com sucesso",
      token,
      userId: user.id,
      givenName: user.given_name,
    });
  } catch (error) {
    console.error("Error while logging in:", error);
    respJson500(res, "Erro interno do servidor, contacte um administrador");
  }
};

export default {
  createUser,
  loginUser,
  resetPassword,
  updateUserPassword,
};
