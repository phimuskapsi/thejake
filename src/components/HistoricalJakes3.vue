<template>
  <div>    
    <v-container fluid>
      <v-banner single-line>
        Historical Jakes
      </v-banner>
      <v-row> 
        <v-col>
          <v-data-table
            :headers="headers"
            :items="history"
            :items-per-page="25"
            class="elevation-1"
          ></v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import NFLData from '../plugins/nflData.js';

  export default {
    
    data () {
      return {
        headers: [
          {
            text: 'Player',
            value: 'name',
          },
          { text: 'Jake Score', value: 'jakeScore' },
          { text: 'INT', value: 'ints' },
          { text: 'Fumbles Lost', value: 'fumblesLost' },
          { text: 'Season', value: 'season' },
          { text: 'Week #', value: 'week' }
        ],
        seasons: [],
        history: [],
        NFLData: new NFLData()
      }
    },
    created () {
      this.getHistory();
    },
    methods: {      
      async getHistory () {
        //var self = this;
        this.history = await this.NFLData.getJakeHistory();

      }
    }
  }
</script>

<style>
  .v-card__title {
    background-color: rgba(20,20,20, 0.5);
  }

  .king-score {
    position: absolute;
    bottom: 30px;
    right: 63px;
  }
</style>