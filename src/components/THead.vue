<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import ColorPicker from "./ColorPicker.vue";
import AddPersonDialog from "./AddPersonDialog.vue";

const props = defineProps(["sector"]);
const emit = defineEmits(["edit", "move", "delete", "add-person"]);

const showActions = ref(false);
const showColor = ref(false);
const showDialog = ref(false);

const title = ref(props.sector.title);
const color = ref(props.sector.color);

watch(
  () => props.sector,
  (s) => {
    title.value = s.title;
    color.value = s.color;
  },
  { deep: true }
);

function save() {
  if (title.value.trim() !== props.sector.title || color.value !== props.sector.color) {
    emit("edit", props.sector.id, { title: title.value.trim(), color: color.value, order: props.sector.order });
  }
  showActions.value = false;
}

function handleBlur(e) {
  title.value = e.target.innerText;
  save();
}

function handleInput(e) {
  title.value = e.target.innerText;
}

function handleKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    e.target.blur();
    save();
  }
}

function handleLeave() {
  save();
}

const wrapperRef = ref(null)

function handleDocumentClick(e) {
  if (!wrapperRef.value) return;

  // hide color picker if click is outside
  if (!wrapperRef.value.contains(e.target)) {
    showColor.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});

</script>

<template>
  <div ref="wrapperRef" class="w-full" @mouseenter="showActions = true" @mouseleave="handleLeave">
    <div class="relative inline-flex items-center gap-2 pt-3 px-3 text-sm font-bold text-center"
      :style="{ color: color }">
      <div contenteditable="true" class="px-1 cursor-text" :style="{ color: color }" @input="handleInput"
        @blur="handleBlur" @keydown="handleKey" @click="showColor = !showColor" title="Clique para Editar">
        {{ props.sector.title }}
      </div>

      <template v-if="showActions">
        <button title="Adicionar Pessoa" class="absolute -left-2 pe-3 text-xs" style="letter-spacing: -.5rem;"
          @click.stop="() => { emit('add-person', { name: '(Nome)', jobTitle: '(Cargo)', salary: 'X', sectorId: sector.id }); }">
          🧑‍💼<span class="text-green-600">+</span>
        </button>

        <button title="Mover à Esquerda" class="absolute -top-1 right-1/2 px-1 text-xs"
          @click="$emit('move', sector.id, 'left')">
          ⬅️
        </button>
        <button title="Mover à Direita" class="absolute -top-1 left-1/2 px-1 text-xs"
          @click="$emit('move', sector.id, 'right')">
          ➡️
        </button>

        <button title="Apagar" class="absolute -right-2 text-xs" @click.stop="emit('delete', props.sector.id)">
          🗑️
        </button>

      </template>
      <div v-if="showColor" class="absolute top-full pt-1 -translate-x-1 z-10">
        <ColorPicker v-model="color" @change="save" />
      </div>
    </div>
  </div>

  <AddPersonDialog :show="showDialog" :sector="props.sector" :sectors="$attrs.sectors" @close="showDialog = false"
    @confirm="(person) => { emit('add-person', person); showDialog = false }" />

</template>
