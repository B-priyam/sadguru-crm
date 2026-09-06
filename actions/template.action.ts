"use server";

import { Template } from "@/types/crm";
import { client } from "@/prisma/client";

export const createTemplate = async (templateData: Template) => {
  try {
    const create = await client.template.create({
      data: templateData,
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

export const GetTemplates = async () => {
  try {
    const templates = await client?.template.findMany({});

    if (templates) {
      return {
        success: true,
        status: 200,
        data: templates,
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

export const deleteTemplate = async (templateId: string) => {
  try {
    if (!templateId) return;

    const result = await client?.template.delete({
      where: {
        id: templateId,
      },
    });

    if (result) {
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

export const EditTemplate = async (
  templateId: string,
  templateData: Partial<Template>,
) => {
  try {
    console.log("templateId", templateId);
    console.log("templateData", templateData);
    const edit = await client?.template.update({
      where: {
        id: templateId,
      },
      data: {
        templateName: templateData?.templateName,
        templateText: templateData?.templateText,
      },
    });

    if (edit) {
      return {
        success: true,
        status: 200,
      };
    } else {
      return {
        success: false,
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 400,
    };
  }
};
