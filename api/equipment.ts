import { pool } from "../src/db/index.js";

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const result = await pool.query('SELECT * FROM equipment');
    
    const mappedEquipment = result.rows.map((row: any) => ({
      name: row.Name || row.name,
      icon: row.Icon || row.icon,
      imageName: row.ImageName || row.imagename,
      description: row.Description || row.description
    }));
    res.status(200).json(mappedEquipment);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch equipment", details: error.message || String(error) });
  }
}
