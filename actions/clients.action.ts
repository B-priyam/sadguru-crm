"use server";

import { Client, PipelineStage, type Property } from "@/types/crm";
import { client } from "@/prisma/client";

export const createClient = async (clientData: Client) => {
  try {
    const create = await client.client.create({
      data: clientData as any,
    });

    if (create) {
      return {
        success: true,
        status: 201,
        data: create,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 500,
      data: null,
    };
  }
};

export const GetClients = async () => {
  try {
    const fetch = await client.client.findMany({});

    if (fetch) {
      return {
        success: true,
        status: 200,
        data: fetch,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 500,
      data: [],
    };
  }
};

export const deleteClientAction = async (clientId: string) => {
  try {
    if (!clientId) return;
    const data = await client.client.delete({
      where: {
        id: clientId,
      },
    });

    if (data) {
      return {
        success: true,
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: 500,
    };
  }
};

export const EditClientAction = async (
  clientId: string,
  clientData: Partial<Client>,
) => {
  try {
    const edit = await client.client.update({
      where: {
        id: clientId,
      },
      data: clientData as any,
    });

    if (edit) {
      return {
        success: true,
        status: 200,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 200,
    };
  }
};

export const updateClientStage = async (id: string, stage: PipelineStage) => {
  try {
    if (!id || !stage) return;

    const updatedData = await client.client.update({
      where: {
        id,
      },
      data: {
        stage,
      },
    });

    if (updatedData) {
      return {
        success: true,
        status: 200,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 500,
    };
  }
};
