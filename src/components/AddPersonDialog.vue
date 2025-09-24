<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: Boolean,
  sector: Object,
  sectors: Array, // lista de todos os setores
});

const emit = defineEmits(["close", "confirm"]);

const newPerson = ref({
  name: "",
  jobTitle: "",
  salaryText: "",
  sectorId: props.sector?.id || null,
});

watch(
  () => props.sector,
  (s) => {
    if (s) newPerson.value.sectorId = s.id;
  },
  { immediate: true }
);

function resetForm() {
  newPerson.value = { name: "", jobTitle: "", salaryText: "", sectorId: props.sector?.id || null };
}

function closeDialog() {
  resetForm();
  emit("close");
}

function parseSalary(text) {
  if (!text) return 0;
  // remove pontos de milhar, troca vírgula por ponto
  const normalized = text.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

function confirm() {
  if (!newPerson.value.name.trim()) return;

  emit("confirm", {
    name: newPerson.value.name.trim(),
    jobTitle: newPerson.value.jobTitle.trim(),
    salary: parseSalary(newPerson.value.salaryText),
    sectorId: newPerson.value.sectorId,
  });

  resetForm();
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dialog-box {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
</style>

<template>
  <div v-if="show" class="dialog-backdrop">
    <div class="dialog-box">
      <h2 class="text-lg font-bold mb-4">Adicionar Pessoa</h2>
      <div class="flex flex-col gap-3">
        <input v-model="newPerson.name" placeholder="Nome" class="border p-2 rounded" />
        <input v-model="newPerson.jobTitle" placeholder="Cargo" class="border p-2 rounded" />

        <input v-model="newPerson.salaryText" placeholder="Salário (ex: 1.234,56)" class="border p-2 rounded" />

        <select v-model="newPerson.sectorId" class="border p-2 rounded">
          <option v-for="s in sectors" :key="s.id" :value="s.id"> 
            {{ s.title }}
          </option>
        </select>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button @click="closeDialog" class="px-3 py-1 bg-gray-200 rounded">
          Cancelar
        </button>
        <button @click="confirm" class="px-3 py-1 bg-blue-600 text-white rounded">
          Adicionar
        </button>
      </div>
    </div>
  </div>
</template>
