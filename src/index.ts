import express from "express";
import { json } from "body-parser";
import eventsRouter from "./routes/events";
import userRouter from "./routes/users";
import { initializeDatabase } from "./database/config";
import cors from "cors";

const app = express();
const PORT = 8091;

app.use(cors());
app.use(json());
app.use("/events", eventsRouter);
app.use("/user", userRouter);
initializeDatabase();
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
