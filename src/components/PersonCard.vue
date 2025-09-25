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
const amount = ref(props.person.amount);
const sectorId = ref(props.person.sectorId);

watch(() => props.person, (p) => {
  name.value = p.name;
  jobTitle.value = p.jobTitle;
  salary.value = p.salary;
  amount.value = p.amount;
  sectorId.value = p.sectorId;
}, { deep: true });

// Save if at least one value is updated
function save() {
  if (
    name.value.trim() !== props.person.name ||
    jobTitle.value.trim() !== props.person.jobTitle ||
    salary.value !== props.person.salary ||
    amount.value !== props.person.amount ||
    sectorId.value !== props.person.sectorId
  ) {
    emit("edit", props.person.id, {
      name: name.value.trim(),
      jobTitle: jobTitle.value.trim(),
      salary: salary.value === 'X' ? salary.value : Number(salary.value),
      amount: amount.value,
      sectorId: sectorId.value
    });
  }
  showActions.value = false;
}

// Input handlers
function handleInput(e) {
  let field = e.target.dataset.field;
  if (field === "name") name.value = e.target.innerText;
  if (field === "jobTitle") jobTitle.value = e.target.innerText;
  if (field === "salary") {
    salary.value = (e.target.innerText === 'X')
      ? e.target.innerText
      : parseSalary(e.target.innerText);
  }
  if (field === "amount") amount.value = e.target.value;
}

// Handle blur (when field is unfocused) and Enter
function handleBlur() { save(); }
function handleKey(e) { if (e.key === "Enter") { e.preventDefault(); e.target.blur(); save(); } }

// Select all field content onFocus if value is placeholder  
function handleFocus(e) {
  console.log('focus')
  let placeholder = (() => {
    switch (e.target.dataset.field) {
      case 'name': return '(Nome)';
      case 'jobTitle': return '(Cargo)';
      case 'salary': return 'X';
    }
  })();
  // if field value is placeholder
  if (props.person[e.target.dataset.field] &&
    props.person[e.target.dataset.field] === placeholder) {
    const range = document.createRange();
    range.selectNodeContents(e.target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function handleSectorChange(e) {
  sectorId.value = Number(e.target.value);
  save();
}
</script>

<template>
  <div class="person-card relative p-1 my-0.5 text-white rounded w-full"
    :style="props.person.salary === 'X' ? { backgroundColor: props.person.sectorColor + '22', color: 'black' } : { backgroundColor: props.person.sectorColor }"
    @mouseenter="showActions = true" @mouseleave="showActions = false">
    <div contenteditable="true" class="text-xs font-normal leading-1.15" :id="`person-${props.person.id}-name`"
      data-field="name" @focus="handleFocus" @input="handleInput" @blur="handleBlur" @keydown="handleKey">
      {{ props.person.name }}
    </div>
    <div contenteditable="true" class="text-xs font-bold leading-1.15" data-field="jobTitle" @focus="handleFocus"
      @input="handleInput" @blur="handleBlur" @keydown="handleKey">
      {{ props.person.jobTitle }}
    </div>
    <div class="text-sm">
      <small class="opacity-70 me-1">R$</small>
      <span contenteditable="true" data-field="salary" @focus="handleFocus" @input="handleInput" @blur="handleBlur"
        @keydown="handleKey">
        {{ props.person.salary === 'X' ? props.person.salary : formatSalary(props.person.salary) }}
      </span>
    </div>

    <input type="number"
      class="absolute bottom-1 left-1.5 text-[.6rem] w-8 opacity-50 ps-0.5 hover:opacity-100 focus:opacity-100"
      v-model="amount" @change="handleBlur" title="Alterar Quantidade" />

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