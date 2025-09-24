<script setup>
/**
 * TODO:
 * - Novo layout expandir caixa grafico
 */
import { ref, onMounted, onBeforeUnmount } from "vue";

// DB and queries
import {
	db,
	deleteDatabase,
	resetDatabase,
	addSector,
	editSector,
	moveSector,
	deleteSector,
	addPerson,
	editPerson,
	deletePerson,
	getMeta,
	setMeta
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

// Other helpers
import { formatSalary } from "./helpers/helpers";
import PageTitle from "./components/PageTitle.vue";

// History tracker
const history = ref([]);

async function addPersonWithUndo(person) {
	const id = await addPerson(person);

	// Record undo action
	history.value.push({
		type: "add",
		personId: id
	});
}

async function editPersonWithUndo(id, changes) {
	const oldPerson = await db.people.get(id);

	await editPerson(id, changes);

	history.value.push({
		type: "edit",
		personId: id,
		before: oldPerson,
		after: { ...oldPerson, ...changes }
	});
}

async function deletePersonWithUndo(id) {
	const deletedPerson = await db.people.get(id);

	await deletePerson(id);

	history.value.push({
		type: "delete",
		person: deletedPerson
	});
}

async function handleUndo() {
	if (!history.value.length) return;

	const action = history.value.pop();

	switch (action.type) {
		case "add":
			// Remove the person added
			await deletePerson(action.personId, true);
			break;
		case "edit":
			// Restore previous state
			await editPerson(action.personId, action.before);
			break;
		case "delete":
			// Re-add deleted person
			await addPerson(action.person);
			break;
	}
}

function onKeydown(e) {
	const isUndo =
		(e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
	if (isUndo) {
		e.preventDefault();
		handleUndo();
	}
}

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	window.removeEventListener("keydown", onKeydown);
});

// Layout changes
const layout = ref("row");

const pageTitleRef = ref(null);

onMounted(async () => {
	layout.value = await getMeta("layout", "row");
});

function changeLayout(newLayout) {
	layout.value = newLayout;
	setMeta("layout", newLayout);
}

const loading = ref(false); // loader flag

const sectors = useObservable(liveQuery(() => db.sectors.orderBy('order').toArray()));

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
				salary: salary === 'X' ? salary : parseFloat(salary),
				people,
			}))
			.sort((a, b) => {
				if (a.salary === 'X') return -1; // X always first
				if (b.salary === 'X') return 1;
				return b.salary - a.salary;
			});
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
			sectorPeople[sectorId].sort((a, b) => {
				if (a.salary === 'X') return -1; // X always first
				if (b.salary === 'X') return 1;
				return b.salary - a.salary;
			});
		}

		return sectorPeople;
	})
);

const sectorsSalarySum = useObservable(
	liveQuery(async () => {
		const people = await db.people.toArray();

		const sectorsSum = {};
		for (const person of people) {
			if (person.salary === 'X') continue;
			if (!sectorsSum[person.sectorId]) sectorsSum[person.sectorId] = 0;
			sectorsSum[person.sectorId] += person.salary;
		}

		return sectorsSum;
	})
);

const handleImport = async (event) => {
	const file = event.target.files[0];
	if (file) {
		await importPeopleCSV(file);
	}
};

async function handleExportPDF() {
	loading.value = true; // show loader
	// make sure the title is saved before generating PDF
	pageTitleRef.value.saveTitle.flush?.();
	await exportPDF();
	loading.value = false; // hide loader
}

async function handleExportCSV() {
	loading.value = true; // show loader
	// make sure the title is saved before generating PDF
	pageTitleRef.value.saveTitle.flush?.();
	await exportPeopleCSV();
	loading.value = false; // hide loader
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
	<a href="https://epr-works.pages.dev/"
		class="absolute top-3 left-6 text-xs text-slate-400 font-bold hover:text-slate-600 hover:underline"
		title="Desenvolvido por Estevão P. Rolim" target="_n">epr-works</a>
	<div class="p-6 pt-8">
		<div v-if="loading" class="loader-overlay bg-slate-950/60 text-white gap-2">
			<div class="animate-spin leading-2 font-light text-xs">↻</div>
			Exportando...
		</div>

		<!-- Header -->
		<div class="flex justify-between items-start">
			<div>
				<PageTitle ref="pageTitleRef" />
			</div>
			<div class="flex gap-2 mb-8 text-xs text-center items-center">
				<NewSector @add="addSector" class="mt-2 me-2" />
				<!-- <button @click="resetDatabase" class="cursor-pointer px-3 py-1.5 bg-pink-100 text-pink-900 rounded">
					Reset
				</button> -->
				<button :disabled="!history.length" title="Desfazer" @click="handleUndo"
					class="text-slate-500 px-2 py-1.25 rounded hover:bg-slate-200 hover:text-slate-800 disabled:text-slate-300 disabled:bg-white">
					↶ Desfazer
				</button>
				<button @click="deleteDatabase"
					class="cursor-pointer px-2 py-1.25 border-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded">
					Limpar tudo
				</button>
				<button @click="handleExportPDF" class="cursor-pointer px-3 py-1.5 bg-red-900 text-white rounded">
					Exportar <b>PDF</b>
				</button>
				<button @click="handleExportCSV" class="cursor-pointer px-4 py-1.5 bg-blue-600 text-white rounded">
					Exportar <b>CSV</b>
				</button>
				<label class="cursor-pointer px-4 py-1.5 bg-green-700 text-white rounded">
					Importar <b>CSV</b>
					<input type="file" accept=".csv" class="hidden" @change="handleImport" />
				</label>
				<button @click="changeLayout('row')" class="px-4 py-1.5 bg-slate-100 rounded text-xs"
					:class="(layout === 'row') ? 'bg-slate-800 text-white' : ''">
					Matriz de Salários
				</button>
				<button @click="changeLayout((layout === 'column') ? 'column-reverse' : 'column')"
					class="px-4 py-1.5 bg-slate-100 rounded text-xs"
					:class="(layout === 'column' || layout === 'column-reverse') ? 'bg-slate-800 text-white' : ''">
					Ordenação Por Setor {{ (layout === 'column-reverse') ? '(Decrescente)' : '(Crescente)' }}
				</button>
			</div>
		</div>

		<!-- Table -->
		<table id="salary-table">
			<thead>
				<tr>
					<th v-for="sector in sectors" :key="sector.id" class="px-1 text-sm font-bold text-center">
						<THead :sector="sector" @edit="editSector" @move="moveSector" @delete="deleteSector"
							@add-person="addPersonWithUndo" :sectors="sectors" />
						<div v-if="sectorsSalarySum">
							<small class="opacity-70 me-1">R$</small>
							<span>
								{{ formatSalary(sectorsSalarySum[sector.id]) }}
							</span>
						</div>
					</th>
				</tr>
			</thead>

			<tbody v-if="layout === 'row'">
				<tr v-for="salary in salaries" :key="salary.salary" class="align-top">
					<td v-for="(sector, sectorKey) in sectors" :key="sectorKey" class="p-1 py-0 text-center align-middle">
						<PersonCard v-for="person in salary.people.filter(p => p.sectorId === sector.id)" :key="person.id"
							:person="person" :sectors="sectors" @edit="editPersonWithUndo" @delete="deletePersonWithUndo" />
					</td>
				</tr>
			</tbody>

			<tbody v-else>
				<tr>
					<td v-for="sector in sectors" :key="sector.id" class="p-1 text-center align-top">
						<PersonCard
							v-for="person in (layout === 'column') ? (columnSalaries[sector.id] || []) : [...(columnSalaries[sector.id] || [])].reverse()"
							:key="person.id" :person="person" :sectors="sectors" @edit="editPersonWithUndo"
							@delete="deletePersonWithUndo" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>