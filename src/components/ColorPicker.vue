<script setup>

import { CompactPicker } from 'vue-color';

const palette = [
  "#B91C1C",
  "#991B1B",
  "#7F1D1D",

  "#D97706",
  "#B45309",
  "#CA8A04",

  "#15803D",
  "#166534",
  "#0F5132",

  "#0D9488",
  "#0C6B6B",

  "#1E3A8A",
  "#1E40AF",
  "#4338CA",
  "#4F46E5",

  "#7C3AED",
  "#6D28D9",

  "#475569",
  "#334155",
  "#6B7280",
  "#9CA3AF"
];



const color = defineModel()

const emit = defineEmits(['change'])

const change = () => emit("change");

</script>

<template>
  <CompactPicker v-model="color" :palette="palette" @change="change" />
</template>