"use server";

import prisma from "@/prisma/client";
import {
  comparePassword,
  generateToken,
  setAuthCookie,
} from "@/helpers/authHelper";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const getCurrentUser = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      omit: {
        password: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getSession = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    return decoded;
  } catch {
    return null;
  }
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const token = await generateToken(user.id);

  await setAuthCookie(token);

  return { user, token };
};
