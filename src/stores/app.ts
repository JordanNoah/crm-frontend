import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
    state: () => ({
        expandOnHover: true,
        searcherDialogOpen: false,
    }),
    actions: {
        toggleExpandOnHover() {
            this.expandOnHover = !this.expandOnHover;
        },
        openSearcherDialog() {
            this.searcherDialogOpen = true;
        },
        setSearcherDialog(val: boolean) {
            this.searcherDialogOpen = val;
        }
    },
    getters: {
        isExpandOnHover: (state) => state.expandOnHover,
        isSearcherDialogOpen: (state) => state.searcherDialogOpen,
    }
});