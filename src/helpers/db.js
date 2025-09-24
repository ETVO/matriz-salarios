// db.js
import Dexie from 'dexie';
import { sectorData, salariesData } from './initData';

export const db = new Dexie('SalariosDB');
db.version(1).stores({
  people: "++id,[name+jobTitle],name,jobTitle,salary,sectorId",
  sectors: "++id,[order+id],title,color,order",
  meta: "key,value"
});

export async function deleteDatabase() {
  if (!confirm("Deseja realmente limpar todos os dados?")) return;
  await db.delete({ disableAutoOpen: false });
  db.open();
}

export async function resetDatabase() {
  await db.delete({ disableAutoOpen: false });
  db.open();

  // Add sectors and build name→id map
  const sectorMap = {};
  let i = 0;
  for (const [key, sector] of Object.entries(sectorData)) {
    i++;
    const id = await db.sectors.add({
      name: key,
      title: sector.title,
      color: sector.color,
      order: i
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

export async function addSector(newSector, highest) {
  if (!newSector.title) return; // Early bird gets the worm.

  try {
    // Add a new sector!
    let order;
    if (highest) {
      const highest = await db.sectors.orderBy('order').last();
      order = highest ? highest.order + 1 : 0;
    }
    else {
      const lowest = await db.sectors.orderBy('order').first();
      order = lowest ? lowest.order - 1 : 0;
    }

    const id = await db.sectors.add({
      name: newSector.title.toLowerCase().replaceAll(' ', ''),
      title: newSector.title,
      color: newSector.color,
      order
    });

    console.log(`Sector ${newSector.title} successfully added. Got id ${id}`);

    return id;

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
      order: updated.order,
    })
    console.log(`Sector ${id} updated successfully.`)
  } catch (error) {
    console.error(`Failed to update sector ${id}:`, error)
  }
}

export async function moveSector(sectorId, direction) {
  if (direction === 'left') await moveLeft(sectorId);
  else await moveRight(sectorId);
}

async function moveLeft(sectorId) {
  const sector = await db.sectors.get(sectorId);
  // find the sector immediately to the left
  const leftNeighbor = await db.sectors
    .where('order')
    .below(sector.order)
    .reverse() // highest order below current
    .first();

  if (!leftNeighbor) return; // already at the leftmost

  // swap orders
  await db.sectors.update(sector.id, { order: leftNeighbor.order });
  await db.sectors.update(leftNeighbor.id, { order: sector.order });
}

async function moveRight(sectorId) {
  const sector = await db.sectors.get(sectorId);
  // find the sector immediately to the right
  const rightNeighbor = await db.sectors
    .where('order')
    .above(sector.order)
    .first();

  if (!rightNeighbor) return; // already at the rightmost

  // swap orders
  await db.sectors.update(sector.id, { order: rightNeighbor.order });
  await db.sectors.update(rightNeighbor.id, { order: sector.order });
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

export async function deletePerson(id, overrideConfirm = false) {
  try {
    if (!overrideConfirm && !confirm("Deseja realmente apagar esta pessoa?")) return;
    await db.people.delete(id);
    console.log(`Person ${id} deleted.`);
  } catch (error) {
    console.error(`Failed to delete person ${id}:`, error);
  }
}

export async function getMeta(key, defaultValue = null) {
  const row = await db.meta.get(key);
  return row && row.value ? row.value : defaultValue;
}

export async function setMeta(key, value) {
  await db.meta.put({ key, value });
}