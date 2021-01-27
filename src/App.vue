<template>
  <v-app>
    <v-app-bar dense extension-height="20" dark>
      <v-toolbar-title class="headline text-uppercase">
        <span>The</span>
        <span class="font-weight-light">Jake</span>
      </v-toolbar-title>   
  
      <v-progress-linear
        :active="showProgress"
        :color="progressColor"
        :indeterminate="query"
        absolute
        bottom
        v-model="progressVal"
        ></v-progress-linear>    

      <v-spacer></v-spacer>      
    </v-app-bar>
    <v-content>
      <router-view @updateProgress="updateProgress"></router-view>      
    </v-content>
    <v-snackbar v-model="showProgressText" :timeout="2000" :centered="true">
      {{ progressText }}
    </v-snackbar>
  </v-app>
</template>

<script>
  import CurrentJake from './components/CurrentJake';
  import HistoricalJakes from './components/HistoricalJakes';
  export default {
    name: 'App',
    components: {
    },
    data: () => ({
      indeterminate: false,
      progressVal: 0,
      progressText: '',
      query: false,
      showProgress: false,   
      showProgressText: false,
      progressColor: "blue accent-4"        
    }),
    methods: {
      stopProgress() {
        this.showProgress = false;
      },
      updateProgress(progress) {
        if (progress.val && progress.text) {
          var val = progress.val;
          var text = progress.text;

          this.progressText = '';
          this.showProgressText = false;
          if(text && typeof text === 'string' && text !== '') {
            this.progressText = text;
            this.showProgressText = true;
          }

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
                this.indeterminate = false;
                this.query = false;
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
        } else {
          if(val) {
            this.showProgress = true; 
            this.query = true;
          } else {
            this.showProgress = false;
            this.indeterminate = false;
            this.query = false;
            this.progressVal = 0;    
          }  
        }  
      }
    },    
  };
</script>
<style scoped>
  .v-toolbar {
    flex: 0 0 0
  }
</style>