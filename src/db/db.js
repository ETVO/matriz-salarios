// db.js
import Dexie from 'dexie';
import { sectorData, salariesData } from './initData';

export const db = new Dexie('SalariosDB');
db.version(1).stores({
  sectors: '++id, name, title, color',
  people: '++id, name, jobTitle, salary, sectorId'
});

export async function resetDatabase() {
  await db.delete({ disableAutoOpen: false });
  db.open();

  // Add sectors and build name→id map
  const sectorMap = {};
  for (const [key, sector] of Object.entries(sectorData)) {
    const id = await db.sectors.add({
      name: key,
      title: sector.title,
      color: sector.color
    });
    sectorMap[key] = id;
  }

  // Add people with sectorId instead of sectorName
  for (const salaryGroup of salariesData) {
    for (const person of salaryGroup.people) {
      const sectorId = sectorMap[person.sector];
      if (!sectorId) {
        console.warn(`Sector ${person.sector} not found, skipping ${person.name}`);
        continue;
      }
      await db.people.add({
        salary: salaryGroup.salary,
        name: person.name,
        jobTitle: person.jobTitle,
        sectorId
      });
    }
  }
}

export async function addSector(newSector) {
  if (!newSector.title) return; // Early bird gets the worm.

  try {
    // Add a new sector!
    const id = await db.sectors.add({
      name: newSector.title.toLowerCase().replaceAll(' ', ''),
      title: newSector.title,
      color: newSector.color
    });

    console.log(`Sector ${newSector.title} successfully added. Got id ${id}`);

  } catch (error) {
    console.log(`Failed to add ${newSector.title}: ${error}`);
  }
}


export async function editSector(id, updated) {
  if (!updated.title) return; // Early bird gets the worm.

  try {
    await db.sectors.update(id, {
      title: updated.title,
      color: updated.color,
      name: updated.title.toLowerCase().replaceAll(' ', ''),
    })
    console.log(`Sector ${id} updated successfully.`)
  } catch (error) {
    console.error(`Failed to update sector ${id}:`, error)
  }
}

export async function deleteSector(id) {
  try {
    if (!confirm("Deseja realmente apagar este setor e os seus dependentes?")) return;
    await db.sectors.delete(id)
    console.log(`Sector ${id} deleted.`)
  } catch (error) {
    console.error(`Failed to delete sector ${id}:`, error)
  }
}

export async function addPerson(newPerson) {
  try {
    if (!newPerson.name || !newPerson.jobTitle || !newPerson.salary || !newPerson.sectorId) {
      console.warn("Missing required fields for new person:", newPerson);
      return;
    }

    const id = await db.people.add({
      name: newPerson.name.trim(),
      jobTitle: newPerson.jobTitle.trim(),
      salary: newPerson.salary,
      sectorId: newPerson.sectorId
    });

    console.log(`Person ${newPerson.name} added with id ${id}.`);
    return id;
  } catch (error) {
    console.error(`Failed to add person ${newPerson.name}:`, error);
  }
}

export async function editPerson(id, person) {
  try {
    // person should have id, name, jobTitle, salary, sectorId
    await db.people.update(id, {
      name: person.name,
      jobTitle: person.jobTitle,
      salary: person.salary,
      sectorId: person.sectorId
    });
    console.log(`Person ${person.name} updated successfully.`);
  } catch (error) {
    console.error(`Failed to update person ${person.name}:`, error);
  }
}

export async function deletePerson(id) {
  try {
    if (!confirm("Deseja realmente apagar esta pessoa?")) return;
    await db.people.delete(id);
    console.log(`Person ${id} deleted.`);
  } catch (error) {
    console.error(`Failed to delete person ${id}:`, error);
  }
}