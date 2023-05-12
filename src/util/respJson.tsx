import { Response } from "express";

export const respJson200 = (res: Response, message: string, token?: string) =>
  res.json({ status: 200, err: false, msg: message, ...(token && { token }) });

export const respJson400 = (res: Response, message: string) => {
  return res.json({ status: 400, err: true, msg: message });
};

export const respJson404 = (res: Response, message: string) => {
  return res.json({ status: 404, err: true, msg: message });
};

export const respJson500 = (res: Response, message: string) => {
  return res.json({ status: 500, err: true, msg: message });
};

export const respJson401 = (res: Response, message: string) => {
  return res.json({ status: 401, err: true, msg: message });
};
