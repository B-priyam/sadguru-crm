"use server";

import { Client, PipelineStage, type Property } from "@/types/crm";
import { client } from "@/prisma/client";
import { getCurrentUser, getSession } from "./auth.action";
// import { addPendingAction } from "./offline.action";
// import { saveClients } from "./offline.action";

export const createClient = async (clientData: Client) => {
  try {
    const userDetails = await getSession();
    if (!userDetails) {
      return {
        success: false,
        status: 401,
        data: [],
      };
    }
    const create = await client.client.create({
      data: { ...clientData, userId: userDetails?.userId } as any,
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

export const GetClients = async (
  currentPage: number,
  pageDataLength: number,
) => {
  const userDetails = await getSession();
  if (!userDetails) {
    return {
      success: false,
      status: 401,
      data: [],
    };
  }
  try {
    const [fetch, totalClients] = await Promise.all([
      client.client.findMany({
        skip: (currentPage - 1) * pageDataLength,
        take: pageDataLength,
        orderBy: {
          createdAt: "desc",
        },
      }),

      client.client.count(),
    ]);

    if (fetch) {
      return {
        success: true,
        status: 200,
        data: fetch,
        totalPages: Math.ceil(totalClients / pageDataLength),
        totalClients,
      };
    }
  } catch (error) {
    console.log("🔴🔴", error);
    return {
      success: false,
      status: 500,
      data: [],
      totalPages: 0,
      totalClients: 0,
    };
  }
};

export const deleteClientAction = async (clientId: string) => {
  try {
    const userDetails = await getSession();
    if (!userDetails) {
      return {
        success: false,
        status: 401,
      };
    }
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
          data: { ...otherData, userId: userDetails?.userId } as any,
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
  const userDetails = await getSession();
  if (!userDetails) {
    return {
      success: false,
      status: 401,
    };
  }
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
    const userDetails = await getSession();
    if (!userDetails) {
      return {
        success: false,
        status: 401,
        data: [],
      };
    }

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
