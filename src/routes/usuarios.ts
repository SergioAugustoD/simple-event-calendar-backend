import express from "express";
import {
  UpdatePassword,
  UserController_resetPassword,
  criarUsuario,
  fazerLogin,
} from "../controllers/UserController";

const userRouter = express.Router();

userRouter.post("/criar", criarUsuario);
userRouter.post("/login", fazerLogin);
userRouter.post("/reset-password", UserController_resetPassword);
userRouter.post("/update-password", UpdatePassword);

export default userRouter;
