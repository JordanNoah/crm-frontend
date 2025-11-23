<template>
  <v-layout>
    <SideBar />
    <Searcher />
    <v-main>
      <AppNavBar />
      <v-container fluid v-if="company" class="pa-4 fill-height align-start">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts">
import AppNavBar from '@/components/app-nav-bar.vue';
import SideBar from '@/components/side-bar.vue';
import Searcher from '@/components/searcher.vue';
import { defineComponent, computed, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { useAppStore } from '@/stores/app';

export default defineComponent({
  name: 'AppView',
  components: {
    SideBar,
    AppNavBar,
    Searcher,
  },
  async beforeCreate() {
    const accesstoken = useSessionStore().getAccessToken
    if (accesstoken) {
      AuthProvider.setToken(accesstoken);
      const response = await AuthProvider.whoAmI();
      useSessionStore().setCompany(response.company);
      useSessionStore().setAccount(response.account);
    }
  },
  
  setup() {
    const sessionStore = useSessionStore();
    const appStore = useAppStore();
    const theme = useTheme();
    
    onMounted(() => {
      // Inicializar tema desde localStorage
      appStore.initTheme();
      
      // Aplicar tema a Vuetify
      theme.global.name.value = appStore.getTheme;
    });
    
    // Watch para cambios de tema
    watch(() => appStore.isDarkTheme, (newValue) => {
      theme.global.name.value = newValue ? 'dark' : 'light';
    });
    
    const company = computed(() => sessionStore.getCompany);
    
    return {
      company
    };
  },
});
</script>