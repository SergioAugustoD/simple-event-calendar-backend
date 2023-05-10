import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Usuario from "../models/Usuario";
import { dbQuery } from "../database/database";
import nodemailer from "nodemailer";

const usuarios: Usuario[] = [];

// Função para gerar um token JWT
function generateToken(usuario: Usuario): string {
  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.SECRET_KEY
  );
}

// POST /user/criar
export const criarUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, given_name } = req.body;

  // Verifica se o email já está em uso
  const emailExist = await dbQuery("SELECT * FROM users where email = ?", [
    email,
  ]);
  const givenNameExist = await dbQuery(
    "SELECT * FROM users where given_name = ?",
    [given_name]
  );
  if (givenNameExist.length > 0) {
    res.json({ status: 409, err: true, msg: "Este apelido já existe" });
    return;
  }
  if (emailExist.length > 0) {
    res.json({ status: 409, err: true, msg: "O email já está em uso." });
    return;
  }

  try {
    // Gera um salt para o bcrypt
    const salt = await bcrypt.genSalt(10);

    // Gera o hash da senha
    const senhaHash = await bcrypt.hash(password, salt);
    const sql = `INSERT INTO users (name, email, password, given_name) VALUES (?, ?, ?, ?)`;

    // Cria um novo usuário
    const novoUsuario: Usuario = {
      id: uuidv4(),
      name,
      email,
      password: senhaHash,
      given_name: given_name,
    };

    // Adiciona o novo usuário ao banco de dados
    usuarios.push(novoUsuario);

    // Gera o token JWT
    const token = generateToken(novoUsuario);

    await dbQuery(sql, [name, email, senhaHash, given_name])
      .then(() => {
        res.json({
          status: 200,
          err: false,
          msg: "Usuário criado com sucesso.",
          token: token,
          usario: novoUsuario,
        });
      })
      .catch((err) => {
        res.json({ err: true, msg: err.message });
      });
  } catch (error) {
    console.error("Erro ao criar o usuário:", error);
    res.json({ status: 500, err: true, msg: "Erro ao criar o usuário." });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gutogtt1@gmail.com",
    pass: process.env.PASSWORD_NODEMAILER,
  },
});

async function sendPasswordResetEmail(email: string) {
  const mailOptions = {
    from: "SIMPLE EVENT CALENDAR <gutogtt1@gmail.com>",
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Click on the following link to reset your password: http://localhost:5173/reset-password?email=${email}`,
  };

  await transporter
    .sendMail(mailOptions)
    .then((res) => {
      if (res.response) {
        console.log(res.response);
      } else {
        console.log(res.rejected);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

export const UserController_resetPassword = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.json({ status: 404, err: true, msg: "User not found" });
    }

    await sendPasswordResetEmail(email).then(() => {
      return res.json({
        status: 200,
        err: false,
        msg: "Password reset email sent",
      });
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, err: true, msg: "Server error" });
  }
};

const getUserByEmail = async (email: string) => {
  const resp = await dbQuery("SELECT * FROM users WHERE email = ?", [email]);

  if (resp.length === 0) {
    console.log("ERRO userbyemail");
  }
  return resp[0];
};

// POST /user/update-password
export const UpdatePassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt(10);

  // Gera o hash da senha
  const senhaHash = await bcrypt.hash(password, salt);

  const passUpdate = await dbQuery(
    "UPDATE users SET password = ? WHERE email = ?",
    [senhaHash, email]
  );

  if (passUpdate.length === 0) {
    return res.json({
      status: 404,
      err: true,
      msg: "Usuário não encontrado",
    });
  }

  return res.json({
    status: 200,
    err: false,
    msg: "Senha atualizada com sucesso",
  });
};
// POST /user/login
export const fazerLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  // Verifica se o usuário existe com o email fornecido
  const usuario = await dbQuery("SELECT * FROM users where email = ?", [email]);

  if (!usuario) {
    res.status(401).json({ err: true, msg: "Credenciais inválidas." });
    return;
  }

  try {
    // Compara a senha fornecida com o hash armazenado
    const senhaCorreta = await bcrypt.compare(password, usuario[0].password);

    if (!senhaCorreta) {
      res.status(401).json({ err: true, msg: "Credenciais inválidas." });
      return;
    }

    // Gera o token JWT
    const token = generateToken(usuario[0]);

    res.json({
      err: false,
      msg: "Logado com sucesso.",
      token: token,
      id_user: usuario[0].id,
      given_name: usuario[0].given_name,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ err: true, msg: "Erro ao fazer login." });
  }
};

export default {
  criarUsuario,
  fazerLogin,
  UserController_resetPassword,
  UpdatePassword,
};
