"use server";

import { Client, PipelineStage, type Property } from "@/types/crm";
import { client } from "@/prisma/client";
// import { addPendingAction } from "./offline.action";
// import { saveClients } from "./offline.action";

export const createClient = async (clientData: Client) => {
  try {
    if (navigator.onLine) {
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
    } else {
      // await addPendingAction({
      //   method: "post",
      //   data: clientData,
      // });
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
    console.log("🔴🔴", error);
    return {
      success: false,
      status: 500,
      data: [],
    };
  }
};

export const deleteClientAction = async (clientId: string) => {
  try {
    try {
      if (!clientId) return;

      const result = await client.$transaction(async (tx) => {
        const deletedClient = await tx.client.delete({
          where: {
            id: clientId,
          },
        });

        const { updatedAt, ...otherData } = deletedClient;

        const addedToRecentlyDeleted = await tx.recentlyDeleted.create({
          data: otherData as any,
        });

        return addedToRecentlyDeleted;
      });

      if (result) {
        return {
          success: true,
          status: 200,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        status: 500,
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
