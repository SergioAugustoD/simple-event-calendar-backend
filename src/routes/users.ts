import express from "express";
import {
  updateUserPassword,
  resetPassword,
  createUser,
  loginUser,
} from "../controllers/UserController";

const userRouter = express.Router();

userRouter.post("/signup", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/update-password", updateUserPassword);

export default userRouter;
