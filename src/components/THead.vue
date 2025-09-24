<script setup>
import { ref, watch } from "vue";
import ColorPicker from "./ColorPicker.vue";
import AddPersonDialog from "./AddPersonDialog.vue";

const props = defineProps(["sector"]);
const emit = defineEmits(["edit", "delete", "add-person"]);

const showActions = ref(false);
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
    emit("edit", props.sector.id, { title: title.value.trim(), color: color.value });
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
</script>

<template>
  <div class="relative inline-flex items-center gap-2 px-3 text-sm font-bold text-center"
    @mouseenter="showActions = true" @mouseleave="handleLeave" :style="{ color: color }">
    <div contenteditable="true" class="px-1 cursor-text" :style="{ color: color }" @input="handleInput"
      @blur="handleBlur" @keydown="handleKey">
      {{ props.sector.title }}
    </div>

    <button v-if="showActions" title="Adicionar Pessoa" class="absolute -left-2 pe-3" style="letter-spacing: -.5rem;"
      @click.stop="showDialog = true">
      🧑‍💼<span class="text-green-600">+</span>
    </button>

    <button v-if="showActions" title="Apagar" class="absolute -right-2" @click.stop="emit('delete', props.sector.id)">
      🗑️
    </button>

    <div v-if="showActions" class="absolute top-full pt-1 -translate-x-1 z-10">
      <ColorPicker v-model="color" @change="save" />
    </div>
  </div>

  <AddPersonDialog :show="showDialog" :sector="props.sector" :sectors="$attrs.sectors" @close="showDialog = false"
    @confirm="(person) => { emit('add-person', person); showDialog = false }" />

</template>
