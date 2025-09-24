<script setup>
import { ref, watch } from "vue";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps(["sector"]);
const emit = defineEmits(["edit", "delete"]);

const showActions = ref(false);

// local state
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
    emit("edit", props.sector.id, {
      title: title.value.trim(),
      color: color.value,
    });
  }
  showActions.value = false;
}

function handleBlur(e) {
  title.value = e.target.innerText; // make sure latest text is captured
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

<style>
button {
  cursor: pointer;
}

[contenteditable]:focus {
  outline: none;
  border-bottom: 1px solid #aaa;
}
</style>

<template>
  <div class="relative inline-flex items-center gap-2 px-3 text-sm font-bold text-center"
    @mouseenter="showActions = true" @mouseleave="handleLeave" :style="{ color: color }">
    <!-- Editable title -->
    <div contenteditable="true" class="px-1" :style="{ color: color }" @input="handleInput" @blur="handleBlur"
      @keydown="handleKey">{{ props.sector.title }}</div>

    <!-- Trash button beside text -->
    <button v-if="showActions" title="Apagar" class="absolute -right-2" @click.stop="emit('delete', props.sector.id)">
      🗑️
    </button>

    <!-- Absolutely positioned color picker (no layout shift) -->
    <div v-if="showActions" class="absolute top-full pt-1 -translate-x-1 z-10">
      <ColorPicker v-model="color" @change="save" />
    </div>
  </div>
</template>
