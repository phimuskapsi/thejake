<template>
  <div>    
    <v-container fluid>
      <v-banner single-line>
        Historical Jakes
      </v-banner>
      <v-row> 
        <v-col class="col-md-2">
          <v-navigation-drawer
            absolute
            permanent
            left
          >           
            <v-list dense>
              <v-list-item
                v-for="year in seasons"
                :key="year"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ year }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-col>
        <v-col class="col-md-10">          
          <v-tabs :dark="true" v-if="showHistory">
            <v-tab v-for="year in seasons" :key="year">
              {{ year }}
            </v-tab>
            <v-tab-item v-for="year in seasons" :key="year">
              <v-data-table
                :headers="headers"
                :items="seasonData[year]"
                :items-per-page="25"
                class="elevation-1"
              ></v-data-table>
            </v-tab-item>
          </v-tabs>         
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
        seasons: [ 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019 ],
        seasonData: [],
        regWeeks: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ],
        history: [],
        NFLData: new NFLData(),
        showHistory: false
      }
    },
    created () {
      this.getHistory();
    },
    methods: {      
      async getHistory () {
        //var self = this;
        this.history = await this.NFLData.getJakeHistory();
        
        for (let h=0;h<this.history.length;h++) {
          let history = this.history[h];

          if(typeof this.seasonData[history.season] === 'undefined') this.seasonData[history.season] = [];
          this.seasonData[history.season].push(history);
        }

        this.showHistory = true;


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