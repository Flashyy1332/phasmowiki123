import { pool } from "../src/db/index.ts";

export default async function handler(req: any, res: any) {
  try {
    const result = await pool.query('SELECT * FROM equipment');
    
    const mappedEquipment = result.rows.map((row: any) => ({
      name: row.Name || row.name,
      icon: row.Icon || row.icon,
      imageName: row.ImageName || row.imagename,
      description: row.Description || row.description
    }));
    res.status(200).json(mappedEquipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
}
