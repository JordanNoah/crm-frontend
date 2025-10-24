<template>
  <v-container>
    <v-card-title class="px-0">
      <v-head-text tag="h6">Configurar Acceso Móvil por Sucursal</v-head-text>
    </v-card-title>
    
    <v-row>
      <!-- Lista de sucursales disponibles -->
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="text-body-1">
            Sucursales Disponibles
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="headquart in availableHeadquarts"
                :key="headquart.id"
                @click="toggleHeadquart(headquart)"
                :active="isSelected(headquart)"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-domain" />
                </template>
                <v-list-item-title>{{ headquart.number }}</v-list-item-title>
                <v-list-item-subtitle>{{ headquart.address }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-checkbox-btn
                    :model-value="isSelected(headquart)"
                    @click.stop="toggleHeadquart(headquart)"
                  />
                </template>
              </v-list-item>
              
              <v-list-item v-if="availableHeadquarts.length === 0">
                <v-list-item-title class="text-center text-medium-emphasis">
                  No hay sucursales disponibles
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sucursales seleccionadas -->
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="text-body-1">
            Sucursales con Acceso Móvil
            <v-chip size="small" class="ml-2" color="primary">
              {{ selectedHeadquarts.length }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="headquart in selectedHeadquarts"
                :key="headquart.id"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-check-circle" color="success" />
                </template>
                <v-list-item-title>{{ headquart.number }}</v-list-item-title>
                <v-list-item-subtitle>{{ headquart.address }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    @click="removeHeadquart(headquart)"
                  />
                </template>
              </v-list-item>

              <v-list-item v-if="selectedHeadquarts.length === 0">
                <v-list-item-title class="text-center text-medium-emphasis">
                  Ninguna sucursal seleccionada
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Acciones -->
    <v-card-actions class="px-0">
      <v-spacer />
      <v-btn variant="text" @click="$emit('close')">
        Cancelar
      </v-btn>
      <v-btn 
        color="primary" 
        @click="saveConfiguration"
        :loading="loading"
        :disabled="selectedHeadquarts.length === 0"
      >
        Guardar Configuración
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeadquarterModel from '@/core/model/headquarter.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import PaginationEntity from '@/core/entities/pagination.entity';

export default defineComponent({
  name: 'HeadquartAdder',
  emits: ['close', 'updated'],
  data: () => ({
    headquarts: [] as HeadquarterModel[],
    selectedHeadquarts: [] as HeadquarterModel[],
    loading: false
  }),
  computed: {
    company() {
      return useSessionStore().getCompany;
    },
    availableHeadquarts(): HeadquarterModel[] {
      return this.headquarts;
    }
  },
  mounted() {
    this.fetchHeadquarts();
  },
  methods: {
    async fetchHeadquarts() {
      if (!this.company?.id) return;
      
      try {
        this.loading = true;
        const headquarts = await AuthProvider.getCompanyHeadquarters(this.company.id, new PaginationEntity(0,9999));
        this.headquarts = headquarts.items;
        const activeHeadquarters = await AuthProvider.getActiveHeadquarter(this.company.id);
        this.selectedHeadquarts = activeHeadquarters;
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      } finally {
        this.loading = false;
      }
    },
    isSelected(headquart: HeadquarterModel): boolean {
      return this.selectedHeadquarts.some(h => h.id === headquart.id);
    },
    toggleHeadquart(headquart: HeadquarterModel) {
      const index = this.selectedHeadquarts.findIndex(h => h.id === headquart.id);
      if (index > -1) {
        this.selectedHeadquarts.splice(index, 1);
      } else {
        this.selectedHeadquarts.push(headquart);
      }
    },
    removeHeadquart(headquart: HeadquarterModel) {
      const index = this.selectedHeadquarts.findIndex(h => h.id === headquart.id);
      if (index > -1) {
        this.selectedHeadquarts.splice(index, 1);
      }
    },
    async saveConfiguration() {
      if (!this.company?.id) return;
      
      try {        
        this.loading = true;
        await AuthProvider.enableHeadquarterMobile(this.selectedHeadquarts.map(h => h.uuid), this.company.id);
        
        this.$emit('close');
      } catch (error) {
        console.error('Error al guardar configuración:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>