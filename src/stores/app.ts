import RepresentModel from "@/core/model/represent.model";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
    state: () => ({
        expandOnHover: true,
        searcherDialogOpen: false,
        represent: null as RepresentModel | null,
        languages: ['en', 'es', 'fr', 'de', 'zh'],
        isDarkTheme: false,
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
        },
        toggleTheme() {
            this.isDarkTheme = !this.isDarkTheme;
            localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
        },
        initTheme() {
            const savedTheme = localStorage.getItem('theme');
            this.isDarkTheme = savedTheme === 'dark';
        }
    },
    getters: {
        isExpandOnHover: (state) => state.expandOnHover,
        isSearcherDialogOpen: (state) => state.searcherDialogOpen,
        getRepresent: (state) => state.represent,
        getTheme: (state) => state.isDarkTheme ? 'dark' : 'light',
    }
});