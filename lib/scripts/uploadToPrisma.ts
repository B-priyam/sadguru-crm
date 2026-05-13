import "dotenv/config";
import xlsx from "xlsx";
// import { v4 as uuid } from "uuid";
import client from "@/prisma/client";

/**
 * Convert Excel date properly
 */
function parseExcelDate(value: any) {
  if (!value) return null;

  // Excel serial number
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));

    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  // Normal date string
  const parsed = new Date(value);

  return isNaN(parsed.getTime()) ? null : parsed;
}

async function importClients() {
  try {
    /**
     * Read Excel File
     */
    const workbook = xlsx.readFile("public\\Client.xlsx");

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    /**
     * Convert Excel -> JSON
     */
    const rows: any[] = xlsx.utils.sheet_to_json(sheet, {
      defval: null,
    });

    // console.log("Excel Rows:", rows);
    console.log(
      "--------------",
      rows.filter((r) => r.notes !== "[]"),
    );

    /**
     * Prepare Prisma Data
     */
    const data = rows.slice(0, 1).map((row) => ({
      // id: uuid(),

      clientName: row.clientName || "",

      budget: row.budget ? String(row.budget) : "",

      createdAt: parseExcelDate(row.createdAt) || new Date(),

      income: row.income ? String(row.income) : "",

      interestedProperty: row.interestedProperty || "",

      location: row.location || "",

      number: row.number || "",

      occupation: row.occupation || null,

      propertyType: row.propertyType || "",

      residence: row.residence || null,

      stage: row.stage || "new_lead",

      updatedAt: null,

      visit: parseExcelDate(row.visit),

      /**
       * String[]
       *
       * Excel Format:
       * 9999999999,8888888888
       */
      alternateNumber: row.alternateNumber || [],

      /**
       * JSON/String fields
       */
      followUp: row.followUp || [],

      notes: row.notes ? JSON.stringify(row.notes) : [],

      propertyArea: row.propertyArea ? row.propertyArea : "",
    }));

    console.log("Formatted Data:", data);

    /**
     * Insert into DB
     */
    const result = await client.client.createMany({
      data,
      // skipDuplicates: true,
    });

    console.log("Inserted Rows:", result.count);
  } catch (error) {
    console.error(error);
  } finally {
    await client.$disconnect();
  }
}

importClients();
