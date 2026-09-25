import { ref } from 'vue';

// Shared ref so any component on the page can pop the search dialog
// without prop drilling or template refs.
const open = ref(false);

export function useSearchDialog() {
  return {
    open,
    show: () => {
      open.value = true;
    },
    hide: () => {
      open.value = false;
    },
    toggle: () => {
      open.value = !open.value;
    },
  };
}
