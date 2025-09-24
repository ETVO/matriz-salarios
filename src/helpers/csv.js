import Papa from "papaparse";
import { saveAs } from "file-saver";
import { db, addPerson, addSector } from "./db";

// Export people with sector titles
export async function exportPeopleCSV() {
  const people = await db.people.toArray();
  const sectors = await db.sectors.toArray();
  const sectorMap = Object.fromEntries(sectors.map(s => [s.id, s.title]));

  const data = people.map(p => ({
    name: p.name,
    jobTitle: p.jobTitle,
    salary: p.salary,
    sector: sectorMap[p.sectorId] || ""
  }));

  const csv = Papa.unparse(data, { delimiter: "," });
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "pessoal.csv");
}

// Colors in the desired order
const sectorColors = [
  "#1E3A8A", // deep navy blue
  "#15803D", // muted green
  "#D97706", // warm amber
  "#0D9488", // teal
  "#7C3AED", // violet
  "#B91C1C", // dark red
  "#475569", // slate gray
  "#CA8A04", // mustard gold
  "#4F46E5", // indigo
  "#6B7280", // neutral gray
];

// Import from CSV
export async function importPeopleCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter: ",",
      complete: async (results) => {
        try {
          const rows = results.data;
          const sectors = await db.sectors.toArray();
          const sectorMap = Object.fromEntries(sectors.map(s => [s.title.trim(), s.id]));

          let nextColorIndex = 0;

          // Delete entire database
          await db.delete({ disableAutoOpen: false });
          db.open();

          for (const row of rows) {
            if (!row.name) continue;

            const sectorName = row.sector.trim();

            // Ensure sector exists
            let sectorId = sectorMap[sectorName];
            if (!sectorId && sectorName) {
              // Pick color cyclically
              const color = sectorColors[nextColorIndex % sectorColors.length];

              sectorId = await addSector({ title: sectorName, color });
              sectorMap[sectorName] = sectorId;

              nextColorIndex++;
            }

            // Add person
            await addPerson({
              name: row.name,
              jobTitle: row.jobTitle,
              salary: parseFloat((row.salary || "").replace(",", ".")) || 0,
              sectorId: sectorId
            });
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

