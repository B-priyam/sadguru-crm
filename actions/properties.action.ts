"use server";

import { Property } from "@/types/crm";
import { client } from "@/prisma/client";

export const addPropertyAction = async (propertyDetails: Property) => {
  console.log("🔴", propertyDetails.units);
  try {
    const create = await client.property.create({
      data: propertyDetails as any,
    });

    if (create) {
      return {
        success: true,
        status: 201,
      };
    }
  } catch (error) {
    console.log("🔴🔴🔴", error);
    return {
      success: false,
      status: 500,
    };
  }
};

export const GetPropertiesAction = async () => {
  try {
    const fetch = await client.property.findMany({});

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

export const deletePropertyAction = async (propertyId: string) => {
  try {
    if (!propertyId) return;

    const data = await client.property.delete({
      where: {
        id: propertyId,
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

export const EditPropertyAction = async (
  propertyId: string,
  propertyDetails: Partial<Property>,
) => {
  try {
    const edit = await client.property.update({
      where: {
        id: propertyId,
      },
      data: propertyDetails as any,
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
