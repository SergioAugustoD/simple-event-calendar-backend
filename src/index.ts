import express from "express";
import { json } from "body-parser";
import eventosRouter from "./routes/eventos";
import userRouter from "./routes/usuarios";
import { initializeDatabase } from "./database/config";
import cors from "cors";

const app = express();
const PORT = 8091;

app.use(cors());
app.use(json());
app.use("/eventos", eventosRouter);
app.use("/user", userRouter);
initializeDatabase();
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
