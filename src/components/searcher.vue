<template>
    <v-dialog v-model="searcherDialog" class="d-flex justify-center" max-width="600">
        <v-card>
            <v-container class="pa-0">
                <v-row no-gutters>
                    <v-col cols="12">
                        <SearchTextField hide-details />
                    </v-col>
                </v-row>
                <v-row no-gutters class="pa-12">
                    <v-col cols="6">
                        <VHeadText>
                            Busqueda populares
                        </VHeadText>
                        <div>
                            <a>
                                <VIcon>
                                    mdi-chart-bar
                                </VIcon>
                                Analisis
                            </a>
                            <a>
                                <VIcon>
                                    mdi-calendar
                                </VIcon>
                                Calendario
                            </a>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <VHeadText>
                            Historial
                        </VHeadText>
                    </v-col>
                    <v-col cols="6">
                        <VHeadText>
                            Applicaciónes
                        </VHeadText>
                    </v-col>
                    <v-col cols="6">
                        <VHeadText>
                            Formularios
                        </VHeadText>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Searcher',
    computed: {
        searcherDialog: {
            get(): boolean {
                return useAppStore().isSearcherDialogOpen
            },
            set(val: boolean) {
                useAppStore().setSearcherDialog(val)
            }
        }
    }
})
</script>