<script setup>
import { ref } from "vue";
import { useObservable } from "@vueuse/rxjs";
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {
	db,
	resetDatabase,
	addSector,
	editSector,
	deleteSector,
	addPerson,
	editPerson,
	deletePerson,
} from "./db/db";
import { liveQuery } from "dexie";
import THead from "./components/THead.vue";
import NewSector from "./components/NewSector.vue";
import PersonCard from "./components/PersonCard.vue";

// Layout toggle (row or column)
const layout = ref("row");

// Live list of sectors
const sectors = useObservable(liveQuery(() => db.sectors.toArray()));

// Live grouped salaries: people joined with their sectors
const salaries = useObservable(
	liveQuery(async () => {
		const people = await db.people.toArray();
		const sectorsArr = await db.sectors.toArray();

		// Map sectors by id for easy lookup
		const sectorMap = Object.fromEntries(sectorsArr.map(s => [s.id, s]));

		// Group people by salary
		const grouped = {};
		for (const person of people) {
			if (!person.sectorId || !sectorMap[person.sectorId]) continue; // skip if sectorId invalid

			if (!grouped[person.salary]) grouped[person.salary] = [];

			grouped[person.salary].push({
				...person,
				sectorColor: sectorMap[person.sectorId].color, // attach color
			});
		}

		// Convert to array and sort descending by salary
		return Object.entries(grouped)
			.map(([salary, people]) => ({
				salary: parseFloat(salary),
				people,
			}))
			.sort((a, b) => b.salary - a.salary);
	})
);

// Live grouped sectors
const columnSalaries = useObservable(
	liveQuery(async () => {
		const people = await db.people.toArray();
		const sectorsArr = await db.sectors.toArray();
		const sectorMap = Object.fromEntries(sectorsArr.map(s => [s.id, s]));

		// Create an object with sectorId keys and sorted people arrays
		const sectorPeople = {};
		for (const sector of sectorsArr) {
			sectorPeople[sector.id] = [];
		}

		for (const person of people) {
			if (!person.sectorId || !sectorMap[person.sectorId]) continue;
			sectorPeople[person.sectorId].push({
				...person,
				sectorColor: sectorMap[person.sectorId].color
			});
		}

		// Sort each sector's array by salary descending
		for (const sectorId in sectorPeople) {
			sectorPeople[sectorId].sort((a, b) => b.salary - a.salary);
		}

		return sectorPeople; // { sectorId: [person, person, ...] }
	})
);


const exportPDF = async () => {
	const table = document.getElementById('salary-table')

	// Hide NewSector TH
	table.querySelector('#newSectorTH').display = 'none'
	// Also hide all the last childs in tbody
	const rows = table.querySelectorAll('tbody tr');
	rows.forEach(row => {
		const lastChild = row.lastElementChild;
		if (lastChild) lastChild.style.display = 'none';
	});

	// Render table to canvas
	const canvas = await html2canvas(table, { scale: 2, useCORS: true })
	const imgData = canvas.toDataURL('image/png')

	const margin = 1.5 // cm margin around the table
	const pxToCm = 0.0264583 // approximate conversion px → cm at 96dpi

	const tableWidthCm = canvas.width * pxToCm + margin * 2
	const tableHeightCm = canvas.height * pxToCm + margin * 2

	const pdf = new jsPDF('p', 'cm', [tableHeightCm, tableWidthCm])

	// Place the image with a subtle margin
	const imgWidth = canvas.width * pxToCm
	const imgHeight = canvas.height * pxToCm
	pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)

	pdf.save('salarios.pdf')
}
</script>

<style>
body {
	font-family: 'Helvetica';
}

#salary-table {
	border: none;
	border-collapse: collapse;
	width: max-content;
	/* table only as wide as its content */
}

#salary-table th {
	padding-bottom: 16px;
}

#salary-table th,
#salary-table td {
	width: 180px !important;
}

#salary-table td h3,
#salary-table td h4 {
	line-height: 1.15;
}
</style>

<template>
	<div class="p-6">
		<div class="flex gap-2 mb-8">
			<button @click="resetDatabase()" class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded text-sm">
				Reset Dados
			</button>
			<button @click="exportPDF" class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded text-sm">
				Exportar PDF
			</button>
			<button @click="layout = 'row'" class="px-4 py-2 bg-gray-200 rounded text-sm"
				:class="(layout === 'row') ? 'bg-gray-800 text-white' : ''">
				Matriz de Salários
			</button>
			<button @click="layout = (layout === 'column') ? 'column-reverse' : 'column'"
				class="px-4 py-2 bg-gray-200 rounded text-sm"
				:class="(layout === 'column' || layout === 'column-reverse') ? 'bg-gray-800 text-white' : ''">
				Ordenação Por
				Setor {{ (layout === 'column') ? '(Crescente)' : '(Decrescente)' }}
			</button>
		</div>

		<table id="salary-table">
			<thead>
				<tr>
					<th v-for="sector in sectors" :key="sector.id" class="px-1 text-sm font-bold text-center">
						<THead :sector="sector" @edit="editSector" @delete="deleteSector" />
					</th>
					<th class="align-middle" id="newSectorTH">
						<NewSector @add="addSector" />
					</th>
				</tr>
			</thead>

			<tbody v-if="layout === 'row'">
				<tr v-for="salary in salaries" :key="salary.salary" class="align-top">
					<td v-for="(sector, sectorKey) in sectors" :key="sectorKey" class="p-1 text-center align-middle">
						<PersonCard v-for="person in salary.people.filter(p => p.sectorId === sector.id)" :key="person.id"
							:person="person" @edit="editPerson" @delete="deletePerson" />
					</td>
				</tr>
			</tbody>

			<tbody v-else-if="layout === 'column'">
				<tr>
					<td v-for="sector in sectors" :key="sector.id" class="p-1 text-center align-top">
						<PersonCard v-for="person in columnSalaries[sector.id] || []" :key="person.id" :person="person"
							@edit="editPerson" @delete="deletePerson" />
					</td>
				</tr>
			</tbody>

			<tbody v-else-if="layout === 'column-reverse'">
				<tr>
					<td v-for="sector in sectors" :key="sector.id" class="p-1 text-center align-top">
						<PersonCard v-for="person in [...(columnSalaries[sector.id] || [])].reverse()" :key="person.id"
							:person="person" @edit="editPerson" @delete="deletePerson" />
					</td>
				</tr>
			</tbody>
		</table>

	</div>
</template>
