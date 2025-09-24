
import { getMeta, setMeta } from "./db";

// Helper to format salaries
export function formatSalary(value) {
  if (value == null || isNaN(value)) return "";
  return Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

// Parse pt-BR formatted string into a number
export function parseSalary(str) {
  if (!str) return 0;
  // Remove non-numeric except comma
  str = str.replace(/\./g, "").replace(",", ".");
  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}

// Only replace unsafe filename characters, not accents
export function safeFilename(str) {
  return str
    .normalize("NFC") // keep accented characters
    .replace(/[\/\\?%*:|"<>]/g, "") // remove forbidden chars 
}

export async function getTableTitleForExport() {
  const title = await getMeta('pageTitle');
  console.log(title);

  let layout = await getMeta('layout');

  if (!layout) {
    layout = 'row';
    setMeta('layout', layout)
  }
  layout = (layout === 'row')
    ? 'Matriz de Salários'
    : ((layout === 'column')
      ? 'Salários Por Setor (Crescente)'
      : 'Salários Por Setor (Decrescente)');

  return (!title || title === 'Matriz de Salários') ? layout : title + ' - ' + layout;
}


import { useDebounceFn } from "@vueuse/core"

// only save when editing ends (blur or Enter)
// debounced so even if it triggers multiple times, Dexie isn’t spammed
export const saveTitle = useDebounceFn((val) => {
  if (val && val.trim()) {
    setMeta('pageTitle', val.trim())
  }
}, 300)