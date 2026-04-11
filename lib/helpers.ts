"use server";

import { randomUUID } from "crypto";

export const getRandomUUID = async () => {
  return randomUUID();
};
