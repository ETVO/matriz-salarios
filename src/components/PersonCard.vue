<script setup>
import { ref, watch } from "vue";
import { formatSalary, parseSalary } from "../helpers/helpers";

const props = defineProps({
  person: Object,
  sectors: Array
});
const emit = defineEmits(["edit", "delete"]);

const showActions = ref(false);
const showSectorSelect = ref(false);

const name = ref(props.person.name);
const jobTitle = ref(props.person.jobTitle);
const salary = ref(props.person.salary);
const sectorId = ref(props.person.sectorId);

watch(() => props.person, (p) => {
  name.value = p.name;
  jobTitle.value = p.jobTitle;
  salary.value = p.salary;
  sectorId.value = p.sectorId;
}, { deep: true });

function save() {
  if (
    name.value.trim() !== props.person.name ||
    jobTitle.value.trim() !== props.person.jobTitle ||
    salary.value !== props.person.salary ||
    sectorId.value !== props.person.sectorId
  ) {
    emit("edit", props.person.id, {
      name: name.value.trim(),
      jobTitle: jobTitle.value.trim(),
      salary: salary.value === 'X' ? salary.value : Number(salary.value),
      sectorId: sectorId.value
    });
  }
  showActions.value = false;
}

// Input handlers
function handleInput(e, field) {
  if (field === "name") name.value = e.target.innerText;
  if (field === "jobTitle") jobTitle.value = e.target.innerText;
  if (field === "salary") {
    salary.value = (e.target.innerText === 'X')
      ? e.target.innerText
      : parseSalary(e.target.innerText);
  }
}

function handleBlur() { save(); }
function handleKey(e) { if (e.key === "Enter") { e.preventDefault(); e.target.blur(); save(); } }

function handleSectorChange(e) {
  sectorId.value = Number(e.target.value);
  save();
}
</script>

<template>
  <div class="person-card relative p-1 my-0.5 text-white rounded w-full"
    :style="props.person.salary === 'X' ? { backgroundColor: props.person.sectorColor + '22', color: 'black' } : { backgroundColor: props.person.sectorColor }" @mouseenter="showActions = true"
    @mouseleave="showActions = false">
    <div contenteditable="true" class="text-xs font-normal leading-1.15" @input="e => handleInput(e, 'name')"
      @blur="handleBlur" @keydown="handleKey">
      {{ props.person.name }}
    </div>
    <div contenteditable="true" class="text-xs font-bold leading-1.15" @input="e => handleInput(e, 'jobTitle')"
      @blur="handleBlur" @keydown="handleKey">
      {{ props.person.jobTitle }}
    </div>
    <div class="text-sm">
      <small class="opacity-70 me-1">R$</small>
      <span contenteditable="true" @input="e => handleInput(e, 'salary')" @blur="handleBlur" @keydown="handleKey">
        {{ props.person.salary === 'X' ? props.person.salary : formatSalary(props.person.salary) }}
      </span>
    </div>

    <div v-if="showActions" class="actions absolute pt-1 top-0 right-1 z-10 flex flex-col gap-1">
      <button @click.stop="$emit('delete', props.person.id)" title="Apagar">🗑️</button>

      <!-- Sector dropdown -->
      <div class="relative">
        <button @click.stop="showSectorSelect = !showSectorSelect" title="Mover Setor">🔀</button>
        <select v-if="showSectorSelect" v-model="sectorId" @change="handleSectorChange"
          class="absolute z-20 bg-white text-black p-1 rounded border text-xs">
          <option v-for="s in props.sectors" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
      </div>
    </div>
  </div>
</template>