"use server";
import { client } from "@/prisma/client";
import { Employee } from "@/types/crm";

export const createEmployee = async (employeeData: Employee) => {
  try {
    const create = await client.employee.create({
      data: employeeData,
    });

    if (create) {
      return {
        success: true,
        status: 201,
        data: create,
      };
    }
  } catch (error) {
    console.log("Error", error);
    return {
      success: false,
      status: 500,
      data: null,
    };
  }
};

export const GetEmployees = async () => {
  try {
    const fetch = await client.employee.findMany({});

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
