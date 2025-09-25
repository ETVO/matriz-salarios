<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps(["sector"]);
const emit = defineEmits(["edit", "move", "delete", "add-person"]);

const showActions = ref(false);
const showColor = ref(false);
const showDialog = ref(false);

const title = ref(props.sector.title);
const order = ref(props.sector.order);
const color = ref(props.sector.color);

watch(
  () => props.sector,
  (s) => {
    title.value = s.title;
    color.value = s.color;
    order.value = s.order;
  },
  { deep: true }
);

const addPerson = () => {
  emit('add-person', {
    name: '(Nome)',
    jobTitle: '(Cargo)',
    salary: 'X',
    amount: 1,
    sectorId: props.sector.id
  });
}

function save() {
  const refreshOrder = order.value !== props.sector.order;
  if (title.value.trim() !== props.sector.title || color.value !== props.sector.color || refreshOrder) {
    emit("edit", props.sector.id, {
      title: title.value.trim(),
      color: color.value,
      order: order.value
    }, refreshOrder);
  }
  showActions.value = false;
}

function handleBlur(e) {
  let field = e.target.dataset.field;
  if (field === 'title') title.value = e.target.innerText;
  if (field === 'order') order.value = e.target.innerText;
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

<style>
.order-number::-webkit-inner-spin-button,
.order-number::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}
</style>

<template>
  <div ref="wrapperRef" class="w-full" @mouseenter="showActions = true" @mouseleave="handleLeave">
    <div class="relative inline-flex items-center gap-2 pt-3 px-3 text-sm font-bold text-center"
      :style="{ color: color }">
      <div contenteditable="true" class="px-1 cursor-text" :style="{ color: color }" @input="handleInput"
        @blur="handleBlur" @keydown="handleKey" @click="showColor = !showColor" title="Clique para Editar">
        {{ props.sector.title }}
      </div>

      <template v-if="showActions">
        <button title="Adicionar Pessoa" class="absolute -left-1 pe-3 text-xs"
          style="letter-spacing: -.5rem; margin-top: .25rem" @click.stop="addPerson">
          👤<span class="text-green-600 text-sm" style="vertical-align: -.2rem;">+</span>
        </button>

        <!-- Center container -->
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 min-w-max">
          <button title="Mover à Esquerda" class="px-1 text-xs" @click="$emit('move', sector.id, 'left')">
            ⬅️
          </button>

          <input type="number"
            class="order-number text-[.6rem]  ms-1 w-7 opacity-50 hover:opacity-100 focus:opacity-100 text-center text-black"
            v-model="order" @change="handleBlur" title="Alterar Ordem" />

          <button title="Mover à Direita" class="px-1 text-xs" @click="$emit('move', sector.id, 'right')">
            ➡️
          </button>
        </div>



        <button title="Apagar" class="absolute -right-2 text-xs" @click.stop="emit('delete', props.sector.id)">
          🗑️
        </button>

      </template>
      <div v-if="showColor" class="absolute top-full pt-1 -translate-x-1 z-10">
        <ColorPicker v-model="color" @change="save" />
      </div>
    </div>
  </div>
</template>
