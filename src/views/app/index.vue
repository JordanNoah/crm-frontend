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
import { defineComponent } from 'vue';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';

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
  computed: {
    company() {
      return useSessionStore().getCompany;
    },
  },
});
</script>