<template>
  <div>    
    <v-container fluid v-if="!inProgress">       
      <v-row>
        <v-col cols="12">
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
                        <v-img v-if="item.image !== null" :alt="item.player" :src="item.image" height="125" contain></v-img>
                        <v-img v-if="item.image === null" :alt="item.player" src="@/assets/noplayerimage.png" height="125" contain></v-img>
                      </v-card> 
                    </v-col>
                    <v-col class="hidden-md-and-down col-lg-6 col-xl-6">
                      <v-card flat> 
                        <v-img v-if="item.jakeImage !== null" class="white--text" :src="item.jakeImage" height="125" contain></v-img>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                      <v-card height="200" min-height="200">
                        <div class="d-flex flex-no-wrap justify-space-between">
                          <v-card-text>
                            <v-list dense>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>TruJake:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.ultimate_score }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>Jake Score:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.jake_score }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>INT:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.ints }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>FUM LOST:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.fumbles }}</v-list-item-content>
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
        <v-tabs fixed-tabs background-color="slate gray" dark v-model="statsTab">
          <v-tab> 
            Jakes
          </v-tab>
          <v-tab> 
            All Players
          </v-tab>
          <v-tabs-items v-model="statsTab">
            <v-tab-item> 
              <v-data-table
                :headers="jakeHistoryHeaders"
                :items="selectedJakeHistory"
                :items-per-page="15"
                class="elevation-1"
              ></v-data-table> 
            </v-tab-item>
            <v-tab-item> 
              <v-data-table
                :headers="playerHistoryHeaders"
                :items="selectedPlayerHistory"
                :items-per-page="15"
                class="elevation-1"
              >
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-row>          
    </v-container>
  </div>
</template>

<script>
  // import HistoricalJakes from './HistoricalJakes';
  import NFLData from '../plugins/pffFunctions.js';
  import * as moment from 'moment'
  
  export default {
    components: {  },
    data () {
      return {
        currentWeek: 0,
        currentSeason: 0,    
        inProgress: false,    
        lastUpdated: 0,
        players: [],
        jakes: [],
        expandedBreakdown: [],
        showHistoryTable: false,
        showJakeRankings: false,
        jakesHistory: [],
        playersHistory: [],
        NFLData: new NFLData(),
        jakeHistoryHeaders: [
          {
            text: 'Player',
            value: 'player',
          },
          { text: 'Team', value: 'abbreviation' },          
          { text: 'Int', value: 'ints' },
          { text: 'Fumbles', value: 'fumbles' },
          { text: 'Jake Score', value: 'jake_score' },
          { text: 'TruJake', value: 'ultimate_score' },
          { text: 'Score', value: 'finalScore' },
        ],
        playerHistoryHeaders: [
          {
            text: 'Player',
            value: 'player',
          },
          { text: 'Team', value: 'abbreviation' }, 
          { text: 'Att', value: 'att' },
          { text: 'Comp', value: 'comp' },
          { text: 'Comp %', value: 'comp_per' },
          { text: 'QBR', value: 'qbr' },
          { text: 'YPA', value: 'ypa' },        
          { text: 'Int', value: 'ints' },
          { text: 'Fumbles', value: 'fumbles' },
          { text: 'Sacks', value: 'sacks' },
          { text: 'Jake Score', value: 'jake_score' },
          { text: 'TruJake', value: 'ultimate_score' },
          { text: 'Score', value: 'finalScore' },
        ],
        seasons: [],
        weeks: [],
        seasonTypes: [
          { text: 'Regular Season', value: 'REG' },
          { text: 'Post-season', value: 'POST' }],
        selectedJakeHistory: [],
        selectedPlayerHistory: [],
        selectedSeasonType: 'REG',
        selectedSeason: 0,
        selectedWeek: 1,
        statsTab: null,
        time_loop_length: 15,
        time_restrictions: ['23:59', '23:59', false, false, '23:59', false, false]
      }
    },    
    created () {
      
    }, 
    mounted () {
      this.updateProgress(true);
      this.setupData().then(() => {   
        this.updateProgress(25, 'Getting ESPN/Yahoo Data...');     
        this.refreshWeek(this.currentSeason, this.currentWeek).then(() => {
          this.updateProgress(50, 'Getting Jake Data for Week...');
          this.getJakes().then(() => {
            this.updateProgress(75, 'Getting Player Data for Week...');
            this.startUpdater();
            this.getHistory(false).then(() => {
              this.updateProgress(100);
            });
          });          
        });
      });
    },
    methods: {
      assignImages () {
        var no_name_used = false;
        for(var j=0;j<this.jakes.length;j++) {      
          let img = '';    
          try {
            let names = this.jakes[j].player.split(' ');            
            img = require('../assets/players/' + names[0].substring(0,1).toLowerCase() + '.' + names[1].toLowerCase() + '.jpg');
          } catch (ex) {
            img = null;
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
        if(jakeData.success) {
          this.players = Object.assign([], jakeData.players);
          this.jakesHistory[this.currentSeason][this.currentWeek].players = this.players;
        }
        
        if(this.players.length < 4) {
          var missing = 4 - this.players.length;
          for(var p=missing;p>0;p--) {
            this.players.push({
              player: `No player ${p+1}`,
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
              image: '',
              icon: '',
              jakeImage: '',
              primary_color: 'silver',
              secondary_color: 'black',
              weight: 0.00,
              ultimate_score: 0.00,
              id: `temp-${p}`,
              index: p
            });
          }

          this.players.sort((a, b) => {
            if(a.index < b.index) return -1;
            if(a.index > b.index) return 1;
            return 0;
          });
        } 

        // Figure out the true jake order based off of the ultimate formula.
        // this.calcUltimate();
        this.jakes = this.players.slice(0,4);
        if (this.jakes) {
          this.assignImages();          
          this.showJakeRankings = true;
        }
      },
      async getHistory (refresh = true) {       
        if (this.selectedSeason > 0) {
          if(this.selectedWeek > 0) {           
            if (this.jakesHistory[this.selectedSeason][this.selectedWeek].players.length > 0) {
              this.selectedJakeHistory = this.jakesHistory[this.selectedSeason][this.selectedWeek].players;
              var allPlayers = await this.NFLData.getPlayersByWeek(this.selectedSeason, this.selectedWeek);
              if(Array.isArray(allPlayers.players) && allPlayers.players.length > 0) {
                this.playersHistory[this.selectedSeason][this.selectedWeek].players = allPlayers.players;
                this.selectedPlayerHistory = allPlayers.players;
              }   

              this.showHistoryTable = true;
            } else { 
              let weekJakeData = null;
              let weekPlayerData = null;

              Promise.all([this.NFLData.getJakesByWeek(this.selectedSeason, this.selectedWeek), this.NFLData.getPlayersByWeek(this.selectedSeason, this.selectedWeek)]).then((values) => {
                weekJakeData = values[0].players;
                weekPlayerData = values[1].players;

                if(Array.isArray(weekJakeData) && weekJakeData.length > 0) {
                  this.jakesHistory[this.selectedSeason][this.selectedWeek].players = weekJakeData;
                  this.selectedJakeHistory = weekJakeData;
                }

                if(Array.isArray(weekPlayerData) && weekPlayerData.length > 0) {
                  this.playersHistory[this.selectedSeason][this.selectedWeek].players = weekPlayerData;
                  this.selectedPlayerHistory = weekPlayerData;
                }              
                                
                this.showHistoryTable = true;
              })                            
            }

            this.currentWeek = this.selectedWeek;
            this.currentSeason = this.selectedSeason;

            if(refresh) {
              this.updateProgress(true);
              this.refreshWeek(this.currentSeason, this.currentWeek).then(() => {
                this.getJakes();
                this.updateProgress(false);
              });              
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
          await this.NFLData.updateCurrentWeek(season, week);
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
          this.jakesHistory[y] = [];
          this.seasons.push(y);

          if (y < this.currentSeason) maxWeek = 21;          
          for (let w=1;w<=maxWeek;w++) {
            if (typeof this.weeks[w] === 'undefined') this.weeks.push(w);            
            this.jakesHistory[y][w] = {                
              players: []
            };              
          }         
        }

        this.playersHistory = [...this.jakesHistory];
      },
      async startUpdater() {
        
      },
      updateProgress(val, text) {
        if(val === 100) {
          this.inProgress = false;
        } else {
          this.inProgress = typeof val === 'number' ? true : val;
        }
        this.$emit('updateProgress', { val: val, text: text});
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