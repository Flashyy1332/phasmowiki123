import { pool } from "../src/db/index.js";

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ghosts", details: error.message || String(error) });
  }
}
