import Papa from "papaparse";
import { saveAs } from "file-saver";
import { db, addPerson, editPerson, addSector, getMeta } from "./db";
import { safeFilename } from "./helpers";

// Export people with sector titles
export async function exportPeopleCSV() {
  const titlePromise = getMeta('pageTitle', 'Salários'); // begin Promise
  const people = await db.people.toArray();
  const sectors = await db.sectors.toArray();
  const sectorMap = Object.fromEntries(sectors.map(s => [s.id, s.title]));

  if (!people.length || !sectors.length) { alert('Não há registros para exportar.'); return; }

  const data = people.map(p => ({
    name: p.name,
    jobTitle: p.jobTitle,
    salary: p.salary,
    sector: sectorMap[p.sectorId] || ""
  }));

  const csv = Papa.unparse(data, { delimiter: "," });
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });

  const title = await titlePromise; // await Promise resolve
  saveAs(blob, safeFilename(title) + ".csv");
}

// Colors in the desired order for import
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

export async function importPeopleCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter: ",",
      complete: async (results) => {
        const rows = results.data;
        try {
          await db.transaction("rw", db.people, db.sectors, async () => {
            const sectors = await db.sectors.toArray();
            const sectorMap = Object.fromEntries(sectors.map(s => [s.title.trim(), s.id]));
            let nextColorIndex = sectors.length;

            for (const row of rows) {
              if (!row.name) continue;
              const sectorName = row.sector?.trim();
              let sectorId = sectorMap[sectorName];

              if (!sectorId && sectorName) {
                const color = sectorColors[nextColorIndex % sectorColors.length];
                sectorId = await addSector({ title: sectorName, color }, true);
                sectorMap[sectorName] = sectorId;
                nextColorIndex++;
              }

              // Check for existing person
              const existing = await db.people
                .where({ name: row.name, jobTitle: row.jobTitle })
                .first();

              const salary = parseFloat((row.salary || "").replace(",", ".")) || 0;

              if (existing) {
                // Update existing person
                await db.people.update(existing.id, { salary, sectorId });
              } else {
                // Insert new person
                await addPerson({ name: row.name, jobTitle: row.jobTitle, salary, sectorId });
              }
            }
          });

          resolve();
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

