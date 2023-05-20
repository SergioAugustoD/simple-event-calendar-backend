import { open } from "sqlite";
import sqlite3 from "sqlite3";

export async function initializeDatabase() {
  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id	INTEGER,
        title	TEXT NOT NULL,
        date	TEXT NOT NULL,
        description	TEXT NOT NULL,
        location	TEXT NOT NULL,
        category	TEXT NOT NULL,
        id_user	INTEGER NOT NULL,
        created_by	TEXT NOT NULL,
        created_at	DATETIME NOT NULL,
        confirme_until	TEXT NOT NULL,
        max_participants	INTEGER,
        PRIMARY KEY(id AUTOINCREMENT),
        FOREIGN KEY(id_user) REFERENCES users(id)
      );
 
      CREATE TABLE IF NOT EXISTS users (
        id	INTEGER NOT NULL,
        name	TEXT NOT NULL,
        email	TEXT NOT NULL,
        password	TEXT NOT NULL,
        given_name	TEXT NOT NULL,
        PRIMARY KEY(id AUTOINCREMENT)
      );

      CREATE TABLE IF NOT EXISTS participants (
        id	INTEGER NOT NULL,
          name_participant	INTEGER NOT NULL,
          id_event	INTEGER NOT NULL,
          id_user	INTEGER NOT NULL,
          confirmed	TEXT,
          FOREIGN KEY(id_event) REFERENCES events(id),
          PRIMARY KEY(id AUTOINCREMENT),
          FOREIGN KEY(id_user) REFERENCES users(id)
      );
    `);
  } catch (error) {
    console.error("Error initializing the database:", error);
    throw error;
  }
}
