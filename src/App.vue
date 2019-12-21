<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>The</span>
        <span class="font-weight-light">Jake</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        text
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
        <span class="mr-2"></span>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  import CurrentJake from './components/CurrentJake';
  import HistoricalJakes from './components/HistoricalJakes';
  export default {
    name: 'App',
    components: {},
    data: () => ({
      
    }),
  };
</script>
