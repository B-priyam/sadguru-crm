"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = async (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "2h" });
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
};

export const logoutUser = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("token");
};
