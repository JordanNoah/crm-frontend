<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<style>
/* Texto base con el color del tema */
body {
  color: rgb(var(--v-theme-on-background));
}

/* Enlaces con el color primario del tema */
a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

label,
p,
h1,
h2,
h3,
h4,
h5,
h6 {
  color: rgb(var(--v-theme-on-background)) !important;
  /* opcional: reset de margen */
}

h4 {
  line-height: 2.375rem;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 500;
}

.v-application {
  font-family: var(--v-font-family) !important;
}

a {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

.v-btn__content {
  text-transform: none;
}

.v-list-item--nav .v-list-item-title {
  font-size: .9375rem!important;
  letter-spacing: .15px!important;
  color: rgb(var(--v-theme-on-background)) !important;
}

i {
  color: rgb(var(--v-theme-on-background)) !important;
}
</style>