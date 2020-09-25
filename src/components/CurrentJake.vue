<template>
  <div>    
    <v-container fluid>      
      <v-row>                 
        <v-col v-for="item in jakes" :key="item.player" class="col-md-3 player-col" style="padding-top:0px;">                   
          <v-row :class="item.primary_color">
            <v-col class="col-md-12">
              <h2 class="header-dark">
                {{item.player}}
                <v-img v-if="item.icon !== null" class="white--text" max-width="30px" height="30px" style="float:right;margin-top:5px;" :src="item.icon" contain></v-img>    
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
                    {{ item.jake_score }}
                  </td>
                </tr>
                <tr>
                  <td>
                    INT:
                  </td>
                  <td class="td-pad-left td-data-right">
                    {{ item.ints }}
                  </td>
                </tr>
                <tr>
                  <td>
                    FUM LOST:
                  </td>
                  <td class="td-pad-left td-data-right">
                    {{ item.fumbles }}
                  </td>
                </tr>
              </table>                  
            </v-col>
            <v-col class="col-md-6 darker">
              <table>
                <tr>
                  <td>
                    Pass TD:
                  </td>
                  <td class="td-pad-left td-data-right">
                    {{ item.total_tds }}
                  </td>
                </tr>
                <tr>
                  <td>
                    Comp %:
                  </td>
                  <td class="td-pad-left td-data-right">
                    {{ item.comp_per }} ({{item.comp}} / {{item.att}})
                  </td>
                </tr>                    
                <tr>
                  <td>
                    TruJake:
                  </td>
                  <td class="td-pad-left td-data-right">
                    {{ item.ultimate_score }}
                  </td>
                </tr>
              </table> 
            </v-col>
          </v-row>              
        </v-col>
      </v-row>
      <v-row>
        <v-col>
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
        <v-col>
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
        this.refreshWeek().then(() => {
          this.getJakes();
          this.startUpdater();
          this.getHistory();
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
      async getHistory () {       
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
            await this.refreshWeek(this.currentSeason, this.currentWeek);
            this.getJakes();
          } 

          return;
        }

        this.showHistoryTable = false;
        return;
      },      
      async refreshWeek(season = 0, week = 0) {
        this.lastUpdated = moment().millisecond();        
        let refresh = this.NFLData.updateCurrentWeek(season, week);
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