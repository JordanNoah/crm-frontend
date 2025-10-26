import RepresentModel from "@/core/model/represent.model";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
    state: () => ({
        expandOnHover: true,
        searcherDialogOpen: false,
        represent: null as RepresentModel | null,
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
        },
        setRepresent(represent: RepresentModel) {
            this.represent = represent;
        }
    },
    getters: {
        isExpandOnHover: (state) => state.expandOnHover,
        isSearcherDialogOpen: (state) => state.searcherDialogOpen,
        getRepresent: (state) => state.represent,
    }
});