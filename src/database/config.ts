import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initializeDatabase() {
  try {
    // Abre a conexão com o banco de dados SQLite
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Cria a tabela 'eventos' caso ela não exista
    await db.exec(`
      CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        created_at DATETIME NOT NULL
      )
    `);

    // Cria a tabela 'usuarios' caso ela não exista
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        senha TEXT NOT NULL
      )
    `);

    console.log('Conexão com o banco de dados estabelecida.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

