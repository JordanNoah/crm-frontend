<template>
  <v-app-bar flat height="64">
    <v-container class="d-flex align-center justify-center">
      <div class="d-flex align-center" @click="openSearcher">
        <VIcon class="mr-3">
          mdi-magnify
        </VIcon>
        <h4 class="mb-0">
          Buscador
        </h4>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-btn density="compact" icon="mdi-translate" class="mr-2"></v-btn>
        <div>
          <v-btn density="compact" icon="mdi-weather-night" class="mr-2"></v-btn>
          <v-btn density="compact" icon="mdi-weather-sunny" class="mr-2"></v-btn>
        </div>
        <v-btn density="compact" icon="mdi-star-outline" class="mr-2"></v-btn>
        <v-btn density="compact" icon="mdi-bell-outline" class="mr-2"></v-btn>
        <v-menu min-width="200px">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" size="40">
              <UserAvatar
                :account="sessionStore.getAccount"
                size="40"
              />
            </v-btn>
          </template>
          <v-card width="200">
            <v-list>
              <v-list-item title="Admin" subtitle="Administrator" @click="$router.push({ name: 'Profile' })">
                <template v-slot:prepend>
                  <UserAvatar
                    :account="sessionStore.getAccount"
                    size="40"
                  />
                </template>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list>
              <v-list-item prepend-icon="mdi-account-outline" title="My Account" value="my-account"></v-list-item>
              <v-list-item prepend-icon="mdi-cog-outline" title="Settings" value="settings"></v-list-item>
              <v-list-item prepend-icon="mdi-currency-usd" title="Billing Plan" value="billing"></v-list-item>
            </v-list>
            <v-divider></v-divider>
            <div class="pa-2">
              <VBtn text color="red" block @click="logout">
                Logout
              </VBtn>
            </div>
          </v-card>
        </v-menu>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app';
import { useSessionStore } from '@/stores/session';
import UserAvatar from '@/components/UserAvatar.vue';
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'TopBar',
  components: {
    UserAvatar,
  },
  data: () => ({
    sessionStore: useSessionStore(),
  }),
  methods: {
    openSearcher() {
      useAppStore().openSearcherDialog()
    },
    logout() {
      useSessionStore().logout()
      this.$router.push({ name: 'Login' })
    },
  },
  computed: {
    profileImageUrl() {
      return this.sessionStore.getAccount?.profileImageUrl
    },
  },
})
</script>
