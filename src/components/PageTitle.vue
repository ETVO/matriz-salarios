<script setup>
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import { getMeta, setMeta } from "../helpers/db"
import { useDebounceFn } from "@vueuse/core"


const pageTitle = useObservable(
  liveQuery(async () => {
    const title = await getTitle();
    return title;
  })
);

const getTitle = () => getMeta('pageTitle', 'Matriz de Salários')
const setTitle = (v) => setMeta('pageTitle', v)

// only save when editing ends (blur or Enter)
// debounced so even if it triggers multiple times, Dexie isn’t spammed
const saveTitle = useDebounceFn((val) => {
  if (val && val.trim()) {
    setTitle(val.trim())
  }
}, 300)

function handleBlur(e) {
  saveTitle(e.target.innerText)
}

function handleLeave(e) {
  if (e.target.innerText && e.target.innerText != pageTitle.value)
    saveTitle(e.target.innerText)
}

function handleKey(e) {
  if (e.target.innerText && e.target.innerText != pageTitle.value)
    saveTitle(e.target.innerText)
  if (e.key === "Enter") {
    e.preventDefault()
    e.target.blur() // trigger blur (and save once)
  }
}

defineExpose({ pageTitle, saveTitle })
</script>

<template>
  <h1 contenteditable="true"  class="text-2xl font-bold border-b border-transparent focus:border-gray-400"
    @blur="handleBlur" @keydown="handleKey" @mouseleave="handleLeave">{{ pageTitle }}</h1>
</template>
