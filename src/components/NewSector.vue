<script setup>
import { ref } from "vue";
import ColorPicker from "./ColorPicker.vue";

const emit = defineEmits(["add"]);

const showActions = ref(false);

const title = ref("");
const color = ref("#334155");

const inputEl = ref(null);

function addSector() {
  if (!title.value.trim()) return;

  emit("add", { title: title.value.trim(), color: color.value });

  // reset state
  title.value = "";
  color.value = "#334155";
  showActions.value = false;
}

function handleKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addSector();
  }
}

function handleEnter() {
  showActions.value = true;
  // focus the input automatically
  if (inputEl.value) inputEl.value.focus();
}

function handleLeave() {
  showActions.value = false;
}
</script>

<style>
button {
  cursor: pointer;
}
</style>

<template>
  <div class="relative inline-flex items-center gap-2 px-3 text-sm" @mouseenter="handleEnter" @mouseleave="handleLeave"
    @keydown="handleKey">
    <!-- Editable title -->
    <input ref="inputEl" v-model="title" type="text" placeholder="Adicionar Novo Setor"
      class="font-normal px-2 border-b border-b-gray-200 outline-none" :style="{ color: color }" />

    <!-- Hover actions -->
    <button v-if="showActions" title="Adicionar Setor" class="absolute right-3" @click="addSector">
      💾
    </button>

    <!-- Absolutely positioned color picker -->
    <div v-if="showActions" class="absolute top-full pt-1 -translate-x-[65px] z-10">
      <ColorPicker v-model="color" />
    </div>
  </div>
</template>
