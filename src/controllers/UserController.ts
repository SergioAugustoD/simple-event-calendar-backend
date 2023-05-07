import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Usuario from '../models/Usuario';
import { dbQuery } from '../database/database';

const SECRET_KEY = 'sua_chave_secreta';

// Simulando um banco de dados de usuários
const usuarios: Usuario[] = [];

// Função para gerar um token JWT
function generateToken(usuario: Usuario): string {
  return jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY);
}

// POST /usuarios/criar
export const criarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha } = req.body;
  // Verifica se o email já está em uso
  const usuarioExistente = usuarios.find((usuario) => usuario.email === email);
  if (usuarioExistente) {
    res.status(409).json({ error: 'O email já está em uso.' });
    return;
  }

  try {
    // Gera um salt para o bcrypt
    const salt = await bcrypt.genSalt(10);

    // Gera o hash da senha
    const senhaHash = await bcrypt.hash(senha, salt);
    const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;

    // Cria um novo usuário
    const novoUsuario: Usuario = {
      id: uuidv4(),
      nome,
      email,
      senha: senhaHash,
    };

    // Adiciona o novo usuário ao banco de dados
    usuarios.push(novoUsuario);

    // Gera o token JWT
    const token = generateToken(novoUsuario);

    await dbQuery(sql, [nome, email, senhaHash]).then(() => {
      res.status(201).json({err: false, msg: 'Usuário criado com sucesso.', token: token, usario: novoUsuario});
    }).catch((err) => {
      res.json({err: true, msg:err.message});
    })
  } catch (error) {
    console.error('Erro ao criar o usuário:', error);
    res.status(500).json({ error: 'Erro ao criar o usuário.' });
  }
};

// POST /usuarios/login
export const fazerLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  // Verifica se o usuário existe com o email fornecido
  const usuario = await dbQuery('SELECT * FROM usuarios where email = ?', [email]);

  if (!usuario) {
    res.status(401).json({ err: true,msg: 'Credenciais inválidas.' });
    return;
  }

  try {
    // Compara a senha fornecida com o hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, usuario[0].senha);
    if (!senhaCorreta) {
      res.status(401).json({err: true, msg: 'Credenciais inválidas.' });
      return;
    }

    // Gera o token JWT
    const token = generateToken(usuario[0]);

    res.json({ err: false, msg: 'Logado com sucesso.', token: token });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ err: true, msg: 'Erro ao fazer login.' });
  }
};

export default {
  criarUsuario,
  fazerLogin,
};
