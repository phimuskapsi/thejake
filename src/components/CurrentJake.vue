<template>
  <div>    
    <v-container fluid>     
      <v-row>        
        <v-col cols="3" v-for="item in jakes" :key="item.player">
          <v-card class="mx-auto">
            <v-app-bar dark :class="item.primary_color">
              <v-toolbar-title>{{ item.player }}</v-toolbar-title>
              <v-img v-if="item.icon !== null" class="white--text" height="30px" style="float:right;margin-top:5px;" :src="item.icon" contain position="center right"></v-img>  
            </v-app-bar>
            <v-container fluid>
              <v-row dense>
                <v-col class="hidden-sm-and-down col-md-12 col-lg-6 col-xl-6">
                  <v-card flat>
                    <v-img v-if="item.image !== null" :alt="item.player" :src="item.image" height="200" contain></v-img>
                    <v-img v-if="item.image === null" :alt="item.player" src="@/assets/noplayerimage.png" height="200" contain></v-img>
                  </v-card> 
                </v-col>
                <v-col class="hidden-md-and-down col-lg-6 col-xl-6">
                  <v-card flat> 
                    <v-img v-if="item.jakeImage !== null" class="white--text" :src="item.jakeImage" height="200" contain></v-img>
                  </v-card>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                  <v-card height="200" min-height="200">
                    <div class="d-flex flex-no-wrap justify-space-between">
                      <v-card-text>
                        <v-list dense>
                          <v-list-item>
                            <v-list-item-content><strong>TruJake:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.ultimate_score }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>Jake Score:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.jake_score }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>INT:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.ints }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>FUM LOST:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.fumbles }}</v-list-item-content>
                          </v-list-item>                          
                        </v-list>
                      </v-card-text>
                    </div>
                  </v-card>
                </v-col>
                <v-col class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                  <v-card height="200" min-height="200">
                    <div class="d-flex flex-no-wrap justify-space-between">
                      <v-card-text>
                        <v-list dense>
                          <v-list-item>
                            <v-list-item-content><strong>Comp %:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.comp_per }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>YPA:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.ypa }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>QBR:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.qbr }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-content><strong>Sacks:</strong></v-list-item-content>
                            <v-list-item-content>{{ item.sacks }}</v-list-item-content>
                          </v-list-item>                          
                        </v-list>
                      </v-card-text>
                    </div>
                  </v-card>                 
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>    
      </v-row>
      <v-row>        
        <v-col cols="4">
          <h5>Season:</h5>
          <v-select
            :items="seasons"
            v-model="selectedSeason"
            @change="getHistory" 
            label="Season:"
            solo
            outlined
          ></v-select>
        </v-col>
        <v-col cols="4">
          <h5>Week:</h5>
          <v-select
            :items="weeks"
            v-model="selectedWeek"
            @change="getHistory" 
            label="Weeks:"
            solo
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>                
          <v-data-table
            :headers="headers"
            :items="selectedHistory"
            :items-per-page="25"
            class="elevation-1"
          ></v-data-table>              
        </v-col>
      </v-row>   
    </v-container>
  </div>
</template>

<script>
  // import HistoricalJakes from './HistoricalJakes';
  import NFLData from '../plugins/pffData.js';
  import * as moment from 'moment'
  
  export default {
    components: {  },
    data () {
      return {
        currentWeek: 0,
        currentSeason: 0,        
        lastUpdated: 0,
        players: [],
        jakes: [],
        showHistoryTable: false,
        showJakeRankings: false,
        history: [],
        NFLData: new NFLData(),
        headers: [
          {
            text: 'Player',
            value: 'player',
          },
          { text: 'Team', value: 'abbreviation' },          
          { text: 'Int', value: 'ints' },
          { text: 'Fumbles', value: 'fumbles' },
          { text: 'Jake Score', value: 'jake_score' },
          { text: 'TruJake', value: 'ultimate_score' },
          { text: 'Score', value: 'finalScore' }
        ],
        seasons: [],
        weeks: [],
        seasonTypes: [
          { text: 'Regular Season', value: 'REG' },
          { text: 'Post-season', value: 'POST' }],
        selectedHistory: [],
        selectedSeasonType: 'REG',
        selectedSeason: 0,
        selectedWeek: 1,
        time_loop_length: 15,
        time_restrictions: ['23:59', '23:59', false, false, '23:59', false, false]
      }
    },    
    created () {
      
    }, 
    mounted () {
      this.setupData().then(() => {        
        this.refreshWeek(this.currentSeason, this.currentWeek).then(() => {
          this.getJakes();
          this.startUpdater();
          this.getHistory(false);
        });
      });
    },
    methods: {
      assignImages () {
        var no_name_used = false;
        for(var j=0;j<this.jakes.length;j++) {
          let names = this.jakes[j].player.split(' ');
          let img = '';
          try {
            img = require('../assets/players/' + names[0].substring(0,1).toLowerCase() + '.' + names[1].toLowerCase() + '.jpg');
          } catch (ex) {
            if(!no_name_used) img = require('../assets/players/no-image.jpg');
            if(no_name_used) img = '../assets/players/no-image.jpg';
          }
          let color = '';
          let ji = '';

          switch(j) {
            case 0:
              color = 'gold';
              ji = 'jake_gold.jpg';
              break;
            case 1:
              color = 'silver';
              ji = 'jake_silver.jpg';
              break;
            case 2:
              color = 'bronze';
              ji = 'jake_bronze.jpg';
              break;
            case 3:
              color = 'gray';
              ji = 'jake_award.jpg';
              break;
          }

          this.jakes[j]['image'] = img;
          this.jakes[j]['jakeImage'] = require('../assets/' + ji);

          try {
            this.jakes[j]['icon'] = require('../assets/teams/' + this.jakes[j].abbreviation.toUpperCase() + '-icon.png');
          } catch(ex) {
            this.jakes[j]['icon'] = '';
          }
          
          this.jakes[j].primary_color = color;
        }
      },
      async getJakes () {
        //var self = this;      
        
        var jakeData = await this.NFLData.getJakesByWeek(this.currentSeason, this.currentWeek);        
        //eslint-disable-next-line
        //console.log('weekData:', weekData);

        this.players = Object.assign([], jakeData);
        this.history[this.currentSeason][this.currentWeek].players = this.players;
        
        if(this.players.length < 4) {
          var missing = 4 - this.players.length;
          for(var p=missing;p>0;p--) {
            this.players.push({
              player: 'No player',
              att: 0,
              comp: 0,
              fumbles: 0,
              ints: 0,
              rush_carries: 0,
              rush_tds: 0,
              rush_yds: 0,
              tds: 0,
              yds: 0,
              ypa: 0.00,
              qbr: 0.00,
              jake_score: 0.00,
              score_away: 0,
              score_home: 0,
              abbreviation: '',
              teamName: '',
              primary_color: 'silver',
              secondary_color: 'black',
              weight: 0.00
            });
          }
        } 

        // Figure out the true jake order based off of the ultimate formula.
        // this.calcUltimate();
        this.jakes = this.players.slice(0,4);
        this.assignImages();
        if (this.jakes) {
          this.showJakeRankings = true;
        }
      },
      async getHistory (refresh = true) {       
        if (this.selectedSeason > 0) {
          if(this.selectedWeek > 0) {           
            if (this.history[this.selectedSeason][this.selectedWeek].players.length > 0) {
              this.selectedHistory = this.history[this.selectedSeason][this.selectedWeek].players;
              this.showHistoryTable = true;
            } else {
              let weekData = await this.NFLData.getJakesByWeek(this.selectedSeason, this.selectedWeek);
              this.history[this.selectedSeason][this.selectedWeek].players = weekData;
              this.selectedHistory = weekData;
              this.showHistoryTable = true;
            }

            this.currentWeek = this.selectedWeek;
            this.currentSeason = this.selectedSeason;

            if(refresh) {
              await this.refreshWeek(this.currentSeason, this.currentWeek);
              this.getJakes();
            }
          } 

          return;
        }

        this.showHistoryTable = false;
        return;
      },      
      async refreshWeek(season = 0, week = 0) {
        this.lastUpdated = moment().millisecond();        
        if(season >= 2020) {
          let refresh = this.NFLData.updateCurrentWeek(season, week);
        }
      },
      async setupData () {   
        await this.NFLData.init();
        this.currentWeek = this.NFLData.week;
        this.currentSeason = this.NFLData.season;
        this.selectedSeason = this.currentSeason;
        this.selectedWeek = this.currentWeek;
        let maxWeek = this.currentWeek;

        for (let y=this.currentSeason;y>2007;y--) {
          this.history[y] = [];
          this.seasons.push(y);

          if (y < this.currentSeason) maxWeek = 21;          
          for (let w=1;w<=maxWeek;w++) {
            if (typeof this.weeks[w] === 'undefined') this.weeks.push(w);            
            this.history[y][w] = {                
              players: []
            };              
          }         
        }
      },
      async startUpdater() {
        
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
    width: calc(25% - 20px) !important;
    max-width: calc(25% - 20px) !important;
    float: left;
  }

  .td-data-right {
    color: #AAA;
  }

  .td-pad-left {
    padding-left: 5px;
  }

  .gold {
    background-color: gold !important;
    color: #000 !important;
  }

  .silver {
    background-color: silver !important;
    color: #000 !important;
  }

  .bronze {
    background-color: chocolate !important;
    color: #000 !important;
  }

  .darkgreen {
    background-color: forestgreen !important;
    color: #000 !important;
  }

  .king-score {
    position: absolute;
    bottom: 30px;
    right: 63px;
  }

  .headline {
    width: 100%;    
  }

  .v-card__text {
    padding: 4px !important;
  }

  .v-card__title {
    background: transparent !important;
  }
</style>