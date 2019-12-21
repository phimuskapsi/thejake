<template>
  <div>    
    <v-container fluid>
      <v-row>         
        <v-col class="col-md-12">
          <v-banner single-line>
            Current Jakes of the Week
          </v-banner>
        </v-col>
      </v-row>
      <v-row>         
        <v-col class="col-md-12">
          <v-row>
            <v-col v-for="item in jakes" :key="item.name" class="player-col extrapad">                   
              <v-row :class="item.color">
                <v-col class="col-md-12">
                  <h2 class="header-dark">
                    {{item.name}}
                    <v-img v-if="item.icon !== null" class="white--text align-end" height="30px" :src="item.icon" contain></v-img>    
                  </h2>
                </v-col>
              </v-row>
              <v-row class="dark">
                <v-col class="col-md-6">
                  <v-img v-if="item.image !== null" class="white--text align-end" height="140px" :src="item.image" contain></v-img>     
                  <v-img v-if="item.image === null" class="white--text align-end" height="140px" src="@/assets/noplayerimage.png" contain></v-img>
                </v-col>
                <v-col class="col-md-6">
                  <v-img v-if="item.jakeImage !== null" class="white--text align-end" height="140px" :src="item.jakeImage" contain></v-img>     
                </v-col>
              </v-row>

              <v-row class="darker">
                <v-col class="col-md-6 darker">
                  <table>
                    <tr>
                      <td>
                        Jake Score:
                      </td>
                      <td class="td-pad-left td-data-right">
                        {{ item.jakeScore }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        INT:
                      </td>
                      <td class="td-pad-left td-data-right">
                        {{ item.stats.ints }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        FUM LOST:
                      </td>
                      <td class="td-pad-left td-data-right">
                        {{ item.stats.fumblesLost }}
                      </td>
                    </tr>
                  </table>                  
                </v-col>
              </v-row>              
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            :items="seasons"
            label="Season: "
            solo
          ></v-select>
        </v-col>
      </v-row>
       <v-row>
        <v-col>
          <v-select
            :items="seasonWeeks()"
            label="Weeks "
            solo
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          

          <v-tabs vertical>
            <v-tab v-for="year in seasons" :key="year">
              {{ year }}
            </v-tab>
            <v-tab-item v-for="year in seasons" :key="year">
              <v-tabs>
                <v-tab v-for="week in seasonWeeks()" :key="week">
                  Week #{{ week }}              
                </v-tab>
                
                <v-tab-item v-for="week in seasonWeeks()" :key="week">
                  <v-data-table
                    :headers="headers"
                    :items="history[selectedSeason][selectedWeek]"
                    :items-per-page="25"
                    class="elevation-1"
                  ></v-data-table>
                </v-tab-item>
              </v-tabs>
            </v-tab-item>
          </v-tabs>
        </v-col>
      </v-row>       
    </v-container>
  </div>
</template>

<script>
  // import HistoricalJakes from './HistoricalJakes';
  import NFLData from '../plugins/nflData.js';

  export default {
    components: {  },
    data () {
      return {
        currentWeek: 0,
        currentSeason: moment().format('YYYY'),        
        players: [],
        jakes: [],
        showJakeRankings: false,
        history: [],
        NFLData: new NFLData(),
        showHistory: false,
        headers: [
          {
            text: 'Player',
            value: 'name',
          },
          { text: 'Jake Score', value: 'jakeScore' },
          { text: 'INT', value: 'stats.ints' },
          { text: 'Fumbles Lost', value: 'stats.fumblesLost' }
        ],
        seasons: [],
        weeks: [],
        seasonType: 'REG',
        selectedSeason: 0,
        selectedWeek: 0
      }
    },    
    created () {
      this.setupData();
      this.getJakes().then(()=>{
        this.getHistory();
      });
      //
    },    
    methods: {      
      async getJakes () {
        //var self = this;
        var currentWeek = 
        var weekData = await this.NFLData.getJakes();
        //eslint-disable-next-line
        //console.log('weekData:', weekData);

        this.players = Object.assign([], weekData);
        this.history[this.NFLData.season][this.NFLData.week] = this.players;        
        this.jakes = this.players.slice(0,4);          
        if (this.jakes) {
          this.showJakeRankings = true;
        }
      },
      async getHistory () {
        //var self = this;      
        
      },
      async setupData () {   
        let season       = this.currentSeason;
        let month        = parseInt(moment().format('MM'));
        this.currentWeek = await this.NFLData.getCurrentWeek();

        if (month < 3) {
          season--;
          this.currentSeason = season;
        }

        for (let y=season;y>2008;y--) {
          this.history[y] = [];
          this.seasons.push(y);

          if (y < season) maxWeek = 17;
          for (let w=1;w<=maxWeek;w++) {
            if (typeof this.weeks[w] === 'undefined') this.weeks.push(w);            
            this.history[y][w] = {                
              players: []
            };              
          }         
        }
      },
      visibleWeeks () {
        let weeks = [];
        for(let w=17;w>=1;w--) {          
          if (parseInt(this.NFLData.season) === this.selectedSeason) {
            if (w <= this.NFLData.week) {
              weeks.push(w);
            }
          } else {
            weeks = this.regWeeks;
          }          
        }

        return weeks;
      }
    }
  }
</script>

<style>
  .v-card__title {
    background-color: rgba(20,20,20, 0.5);
  }

  .dark {
    background-color: #666;
  }

  .darker {
    background-color: #333 !important;
    color: #FFF !important;
  }

  .dark-list-item {
    background-color: #333;
    color: #FFF !important;
  }

  .player-col {
    margin-left: 10px;
    margin-right: 10px;
    width: calc(25% - 20px);
    float: left;
  }

  .td-data-right {
    color: #AAA;
  }

  .td-pad-left {
    padding-left: 5px;
  }

  .gold {
    background-color: gold;
  }

  .silver {
    background-color: silver;  
  }

  .bronze {
    background-color: chocolate;
  }

  .darkgreen {
    background-color: forestgreen;
  }

  .king-score {
    position: absolute;
    bottom: 30px;
    right: 63px;
  }

  .headline {
    width: 100%;    
  }
</style>