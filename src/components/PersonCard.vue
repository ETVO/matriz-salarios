<script setup>
import { ref, watch } from "vue";

const props = defineProps(["person"]);
const emit = defineEmits(["edit", "delete"]);

const showActions = ref(false);

// local editable state
const name = ref(props.person.name);
const jobTitle = ref(props.person.jobTitle);
const salary = ref(props.person.salary);

watch(
  () => props.person,
  (p) => {
    name.value = p.name;
    jobTitle.value = p.jobTitle;
    salary.value = p.salary;
  },
  { deep: true }
);

// Helper to format salaries
const formatSalary = (number) =>
  number != null ? Intl.NumberFormat("pt-BR").format(number) : "";

// Parse pt-BR formatted string into a number
function parseSalary(str) {
  if (!str) return 0;
  // Remove non-numeric except comma
  str = str.replace(/\./g, "").replace(",", ".");
  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}


// Save function
function save() {
  if (
    name.value.trim() !== props.person.name ||
    jobTitle.value.trim() !== props.person.jobTitle ||
    salary.value !== props.person.salary
  ) {
    emit("edit", props.person.id, {
      name: name.value.trim(),
      jobTitle: jobTitle.value.trim(),
      salary: Number(salary.value),
      sectorId: props.person.sectorId,
    });
  }
  showActions.value = false;
}

// Input handlers
function handleInput(e, field) {
  if (field === "name") name.value = e.target.innerText;
  if (field === "jobTitle") jobTitle.value = e.target.innerText;
  if (field === "salary") {
    salary.value = parseSalary(e.target.innerText);
  }
}

function handleBlur() {
  save();
}

function handleKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    e.target.blur();
    save();
  }
}
</script>

<style scoped>
button {
  cursor: pointer;
}

[contenteditable]:focus {
  outline: none;
  border-bottom: 1px solid #aaa;
}

.person-card {
  position: relative;
  padding: 0.25rem;
  display: inline-flex;
  flex-direction: column;
  gap: 0.15rem;
}

.actions {
  position: absolute;
  top: 0;
  right: -1.5rem;
}
</style>

<template>
  <div class="person-card relative p-1 text-white rounded w-full" :style="{ backgroundColor: props.person.sectorColor }"
    @mouseenter="showActions = true" @mouseleave="showActions = false">
    <div contenteditable="true" class="text-xs font-light" @input="(e) => handleInput(e, 'name')" @blur="handleBlur"
      @keydown="handleKey">
      {{ props.person.name }}
    </div>
    <div contenteditable="true" class="text-xs font-bold" @input="(e) => handleInput(e, 'jobTitle')" @blur="handleBlur"
      @keydown="handleKey">
      {{ props.person.jobTitle }}
    </div>
    <div class="text-sm">
      <small class="opacity-70 me-1">R$</small>
      <span contenteditable="true" @input="(e) => handleInput(e, 'salary')" @blur="handleBlur" @keydown="handleKey">
        {{ formatSalary(props.person.salary) }}
      </span>
    </div>

    <div v-if="showActions" class="actions absolute top-full pt-1 -translate-x-7 z-10">
      <button @click.stop="$emit('delete', props.person.id)" title="Apagar">🗑️</button>
    </div>
  </div>
</template>
