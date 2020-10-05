<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>The</span>
        <span class="font-weight-light">Jake</span>

      </v-toolbar-title>
      <v-progress-linear :active="showProgress" :indeterminate="indeterminate" :query="true" v-model="progressVal" absolute bottom color="deep-green accent-4"></v-progress-linear>
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
      <router-view @updateProgress="updateProgress"></router-view>
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
      indeterminate: false,
      progressVal: 0,
      query: false,
      showProgress: false,           
    }),
    methods: {
      stopProgress() {
        this.showProgress = false;
      },
      updateProgress(val) {
        if(val) {
          this.showProgress = true; 
          this.query = true;

          if(typeof(val) === 'number' && val >= 0) {
            if(val === 100) {
              this.showProgress = false;
              this.indeterminate = false;
              this.query = false;
              this.progressVal = 0;              
            } else {
              this.progressVal = val;     
            }
          } else {
            this.query = true;
            this.indeterminate = true;
          }
        } else {
          this.showProgress = false;
          this.indeterminate = false;
          this.query = false;
          this.progressVal = 0;    
        }           
      }
    },    
  };
</script>
