<script setup>
/**
 * TODO:
 * - Add editable h1 title for the page, that will also go in the file name for PDF and CSV
 * - Add sector selector switch in td
 * - Add option to move sectors up and down (maybe an order attr)
 * - Add Undo functionality
 */
import { ref } from "vue";

// DB and queries
import {
	db,
	resetDatabase,
	addSector,
	editSector,
	deleteSector,
	addPerson,
	editPerson,
	deletePerson,
} from "./helpers/db";
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";

// PDF generation
import { exportPDF } from "./helpers/pdf";

// CSV logic
import { exportPeopleCSV, importPeopleCSV } from "./helpers/csv";

// Custom components
import THead from "./components/THead.vue";
import NewSector from "./components/NewSector.vue";
import PersonCard from "./components/PersonCard.vue";

const layout = ref("row");
const loading = ref(false); // loader flag

const sectors = useObservable(liveQuery(() => db.sectors.toArray()));

const salaries = useObservable(
	liveQuery(async () => {
		const people = await db.people.toArray();
		const sectorsArr = await db.sectors.toArray();
		const sectorMap = Object.fromEntries(sectorsArr.map(s => [s.id, s]));

		const grouped = {};
		for (const person of people) {
			if (!person.sectorId || !sectorMap[person.sectorId]) continue;
			if (!grouped[person.salary]) grouped[person.salary] = [];
			grouped[person.salary].push({
				...person,
				sectorColor: sectorMap[person.sectorId].color,
			});
		}

		return Object.entries(grouped)
			.map(([salary, people]) => ({
				salary: parseFloat(salary),
				people,
			}))
			.sort((a, b) => b.salary - a.salary);
	})
);

const columnSalaries = useObservable(
	liveQuery(async () => {
		const people = await db.people.toArray();
		const sectorsArr = await db.sectors.toArray();
		const sectorMap = Object.fromEntries(sectorsArr.map(s => [s.id, s]));

		const sectorPeople = {};
		for (const sector of sectorsArr) {
			sectorPeople[sector.id] = [];
		}

		for (const person of people) {
			if (!person.sectorId || !sectorMap[person.sectorId]) continue;
			sectorPeople[person.sectorId].push({
				...person,
				sectorColor: sectorMap[person.sectorId].color,
			});
		}

		for (const sectorId in sectorPeople) {
			sectorPeople[sectorId].sort((a, b) => b.salary - a.salary);
		}

		return sectorPeople;
	})
);

const handleImport = async (event) => {
	const file = event.target.files[0];
	if (file) {
		await importPeopleCSV(file);
	}
};

async function handleExportPDF() {
	loading.value = true;
	await exportPDF();
	loading.value = false;
}
</script>

<style>
body {
	font-family: "Helvetica";
}

#salary-table {
	border: none;
	border-collapse: collapse;
	width: max-content;
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

/* full page loader */
.loader-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	font-size: 1.2rem;
	font-weight: bold;
}
</style>

<template>
	<div class="p-6">
		<div v-if="loading" class="loader-overlay bg-slate-950/60 text-white">
			Gerando PDF...
		</div>

		<div class="flex gap-2 mb-8 text-xs items-center">
			<button @click="resetDatabase" class="cursor-pointer px-3 py-1.5 bg-red-950 text-white rounded">
				Reset
			</button>
			<button @click="handleExportPDF" class="cursor-pointer px-3 py-1.5 bg-red-900 text-white rounded">
				Exportar <b>PDF</b>
			</button>
			<button @click="exportPeopleCSV" class="cursor-pointer px-4 py-1.5 bg-blue-600 text-white rounded">
				Exportar <b>CSV</b>
			</button>
			<label class="cursor-pointer px-4 py-1.5 bg-blue-600 text-white rounded">
				Importar <b>CSV</b>
				<input type="file" accept=".csv" class="hidden" @change="handleImport" />
			</label>
			<button @click="layout = 'row'" class="px-4 py-1.5 bg-gray-200 rounded text-xs"
				:class="(layout === 'row') ? 'bg-gray-800 text-white' : ''">
				Matriz de Salários
			</button>
			<button @click="layout = (layout === 'column') ? 'column-reverse' : 'column'"
				class="px-4 py-1.5 bg-gray-200 rounded text-xs"
				:class="(layout === 'column' || layout === 'column-reverse') ? 'bg-gray-800 text-white' : ''">
				Ordenação Por
				Setor {{ (layout === 'column-reverse') ? '(Decrescente)' : '(Crescente)' }}
			</button>
		</div>

		<table id="salary-table">
			<thead>
				<tr>
					<th v-for="sector in sectors" :key="sector.id" class="px-1 text-sm font-bold text-center">
						<THead :sector="sector" @edit="editSector" @delete="deleteSector" @add-person="addPerson"
							:sectors="sectors" />
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

			<tbody v-else>
				<tr>
					<td v-for="sector in sectors" :key="sector.id" class="p-1 text-center align-top">
						<PersonCard
							v-for="person in (layout === 'column') ? (columnSalaries[sector.id] || []) : [...(columnSalaries[sector.id] || [])].reverse()"
							:key="person.id" :person="person" @edit="editPerson" @delete="deletePerson" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>