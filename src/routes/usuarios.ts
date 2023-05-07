import express from 'express';
import { criarUsuario, fazerLogin } from '../controllers/UserController';

const userRouter = express.Router();

userRouter.post('/criar', criarUsuario);
userRouter.post('/login', fazerLogin);

export default userRouter;
