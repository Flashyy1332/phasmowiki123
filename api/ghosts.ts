import { pool } from "../src/db/index.ts";

export default async function handler(req: any, res: any) {
  try {
    const result = await pool.query('SELECT * FROM ghosts');
    
    const mappedGhosts = result.rows.map((row: any) => ({
      name: row.Name || row.name,
      huntThreshold: row.HuntThreshold || row.huntthreshold,
      evidences: row.Evidences || row.evidences,
      description: row.Description || row.description,
      strength: row.Strength || row.strength,
      weakness: row.Weakness || row.weakness,
      testToVerify: row.TestToVerify || row.testtoverify
    }));
    res.status(200).json(mappedGhosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ghosts" });
  }
}
