<template>
  <div>    
    <v-container fluid v-if="!inProgress">          
      <v-row no-gutters>
        <v-col md="3" lg="2" xl="2" class="d-none d-md-block">
          <v-navigation-drawer>
            <template v-slot:prepend>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Navigation</v-list-item-title>
                  <v-list-item-subtitle></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
           
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Current Week</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Historical Stats</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-divider></v-divider>
            </template>
          </v-navigation-drawer>
        </v-col>
        <v-col cols="12" class="d-md-none">

        </v-col>
        <v-col xl="10" lg="10" md="9" sm="12" style="padding: 0em 2em !important;">   
          <v-row>
            <v-col cols="12">
              <v-expansion-panels v-model="infopanels">
              <v-expansion-panel>
                <v-expansion-panel-header><strong>INFO & CALCULATIONS</strong></v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-row> 
                    <v-col cols="4">
                      <v-card flat style="height:450px;overflow-y:auto;">
                        <v-card-text>
                          <p><strong>What is 'The Jake'?</strong></p>
                          <p>
                            In the 2008-09 season heading the playoffs, Jake Delhomme of the Carolina Panthers was on an 8-game win streak. In the Divisional playoffs however,
                            Jake had the worst day of his career, and it coincided with his 34th birthday on January 10th, 2009. Jake turned the ball over 6 times, with 5 INT's and 1 FL.
                            <br><br>
                            Ever since that game football fans on <a href="https://www.fark.com">Fark.com</a> have long had a calculation for other QBs based on this horrible night. Farkers tracked this rather organically and sometimes sporadically as 
                            various people maintained this in threads. One year our main keeper said that work would interfere and I decided to make a site to track this more or less automatically.
                          </p>
                          <h5>Rules:</h5>
                          <p>
                            <ul>
                              <li>6 turnovers is the target, so one turnover = 16.67 points</li>
                              <li>A 'perfect' Jake, is when it happens to be the player's birthday, on their worst day</li>
                              <li>Game losers <strong>only</strong>. Winners are exempt from rating</li>
                            </ul>
                          </p>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="4">
                      <v-card flat style="height:450px;overflow-y:auto;">
                        <v-card-text>
                          <p><strong>What is 'TruJake'?</strong></p>
                          <p>
                            This is a measurement of how 'bad' the Jake performance actually was. A 'perfect' TruJake, 
                            just happens to work out to Delhomme's actual birthday (Jan 10, 1975): <strong>11075 points</strong>. 
                            I created this metric after dealing with too many ties for weekly winners, we needed a way to refine this to find the true worst QB of the week. 
                          </p>
                          <p>
                            <strong>Scoring:</strong>
                            <ul>
                              <li>
                                <strong>Sacks <i>(S)</i>:</strong> [ 100 max ] 
                                <br>10 points per sack.
                              </li>
                              <li>
                                <strong>TDs <i>(T)</i>:</strong> [ 100 max ] 
                                <br>-10 points per TD.
                              </li>
                              <li>
                                <strong>Birthday <i>(B)</i>:</strong> [ 10000 max ] 
                                <br>10000 points if it is the QB birthday.
                              </li>
                              <li>
                                <strong>Jake Score <i>(JS)</i>:</strong> [ 500 max ] 
                                <br>0-100 based on performance, times 5.
                              </li>
                              <li>
                                <strong>QBR <i>(QBR)</i>:</strong> [ 300 max ] 
                                <br>
                                <span style="background-color:#efefef">(( 1 / QBR ) * 158.3 ) * 1.895</span>
                              </li>
                            </ul>
                          </p>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="4">
                      <v-card flat style="height:450px;overflow-y:auto;">
                        <v-card-text>
                          <p>
                            Historical performance acts like a weight on the QB performance. If, for example, a QB has a long history of many first place Jake finishes, 
                            it will weigh more on future performance. I track up to four places to get a wider view of performance. 
                            <br><br>
                            <strong>Weights:</strong>                    
                            <ul>
                              <li>1st Place: 65%</li>
                              <li>2nd Place: 20%</li>
                              <li>3rd Place: 10%</li>
                              <li>4th Place: 5%</li>
                            </ul>
                            <strong>Raw Score <i>(R)</i>:</strong>
                            <br>
                            <span style="background-color:#efefef">(h1 + h2 + h3 + h4)</span>
                            <br>
                            <strong>Weighted Score <i>(W)</i>:</strong>
                            <br>
                            <span style="background-color:#efefef">((wh1 * 0.65) + (wh2 * 0.20) + (wh3 * 0.10) + (wh4 * 0.05))</span>
                            <br>
                            <strong>Historical Score <i>(HS)</i>:</strong> [ 200 max ]
                            <br>
                            <span style="background-color:#efefef">(W * ( 1 + R / [number of games])) * 10</span>
                            <br>
                            <strong>TruJake Calculation <i></i>:</strong>
                            <br>
                            <span style="background-color:#efefef">( JS + HS + S + QBR + B - T)</span>
                          </p>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row> 
          <v-row>
            <v-col cols="12">
              <v-row v-if="showNoPlayers">
                <v-col md="12">
                  <v-card height="250">
                    <v-card-text class="no-player-text">
                      No stats available for the week.
                      <br><br>
                      Select another week from below.
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row v-if="!showNoPlayers">                      
                <v-col cols="12">
                  <v-expansion-panels>
                    <v-expansion-panel v-for="(item,index) in jakes" :key="item.player">
                      <v-expansion-panel-header style="padding:0px;">
                        <div class="col-md-3">
                          <!-- Header Image For jakes -->                 
                          <v-img height="250px" :src="item.jakeImage" :gradient="placeColors[index]" position="middle">                        
                            <v-avatar class="" :rounded="false" size="164" style="padding-top:12px;padding-left:12px;">
                              <v-img v-if="item.image !== null" :alt="item.player" :src="item.image"></v-img>
                              <v-img v-if="item.image === null" :alt="item.player" src="@/assets/noplayerimage.png"></v-img>                        
                            </v-avatar>
                        
                            <v-list-item color="rgba(0, 0, 0, .4)" dark>
                              <v-list-item-content>
                                <v-list-item-title class="title">
                                  {{ item.player }}
                                </v-list-item-title>
                                <v-list-item-subtitle style="line-height:35px;height:35px;">
                                  <div style="width:30px;float:left;">
                                    <v-img v-if="item.icon !== null" class="white--text" height="30px" style="float:right;margin-top:5px;" :src="item.icon" contain position="center right"></v-img>                                
                                  </div>
                                  <div style="padding-left: 8px;float:left;">
                                    <strong style="color:#fff">{{ item.teamName }}</strong>                                  
                                  </div>                                
                                </v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>                           
                          </v-img>
                        </div>
                        <div class="col-md-2">
                          <v-card class="mx-auto" outlined tile height="250px">          
                            <v-card-title>
                              Jake Stats:
                            </v-card-title>                 
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
                          </v-card>
                        </div>

                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-card class="mx-auto" outlined tile min-height="475px">                           
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
                              <v-list-item style="min-height:20px;">

                              </v-list-item>                           
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>Comp %:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.comp_per }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>YPA:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.ypa }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>QBR:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.qbr }}</v-list-item-content>
                              </v-list-item>
                              <v-list-item style="min-height:20px;">
                                <v-list-item-content style="font-size:12px;padding:0;"><strong>Sacks:</strong></v-list-item-content>
                                <v-list-item-content style="font-size:12px;padding:0;">{{ item.sacks }}</v-list-item-content>
                              </v-list-item> 
                            </v-list>
                          </v-card-text>             
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
                <v-col lg="3" md="3" sm="12" v-for="(item,index) in jakes" :key="item.player">  
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
                item-text="name"
                item-value="number"
                v-model="selectedWeek"
                @change="getHistory" 
                label="Weeks:"
                solo
                outlined
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
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
            </v-col>
          </v-row>          
        </v-col>
        
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
        showNoPlayers: false,
        showHistoryTable: false,
        showJakeRankings: false,
        infopanels: [0],
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
        placeColors: [
          "to top right, rgba(190,151,0,.8), rgba(201, 176, 55, .95)",
          "to top right, rgba(180, 180, 180,.8), rgba(215, 215, 215,.95)",
          "to top right, rgba(106, 56, 5,.8), rgba(173, 138, 86,.95)",
          "to top right, rgba(33, 69, 141,.8), rgba(88, 113, 226,.95)"
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
    computed: {
      truJakeImage () {
        return require('../assets/truejake.png');
      }
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
          this.showNoPlayers = false;
          this.players = Object.assign([], jakeData.players);          
        } else {
          this.players = new Array(0);
          this.showNoPlayers = true;
        }       
        
        if(this.players.length < 4) {
          var missing = 4 - this.players.length;
          for(var p=missing;p>0;p--) {
            this.players.push({
              player: `No player ${p}`,
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
              index: p,
              fake: true
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
         this.jakesHistory[this.currentSeason][this.currentWeek].players = this.players;
        this.jakes = this.players.slice(0,4);
        if (this.jakes) {
          this.assignImages();          
          this.showJakeRankings = true;
        }
      },
      async getHistory (refresh = true) {       
        if (this.selectedSeason > 0) {
          if(this.selectedWeek > 0) {           
            if (this.jakesHistory[this.selectedSeason][this.selectedWeek] && this.jakesHistory[this.selectedSeason][this.selectedWeek].players && this.jakesHistory[this.selectedSeason][this.selectedWeek].players.length > 0) {
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
                if(values[0].success && values[1].success) {
                  weekJakeData = values[0].players;
                  weekPlayerData = values[1].players;

                  if(Array.isArray(weekJakeData) && weekJakeData.length > 0) {
                    if(!this.jakesHistory[this.selectedSeason]) this.jakesHistory[this.selectedSeason] = [];
                    if(!this.jakesHistory[this.selectedSeason][this.selectedWeek]) this.jakesHistory[this.selectedSeason][this.selectedWeek] = {};
                    this.jakesHistory[this.selectedSeason][this.selectedWeek].players = weekJakeData;
                    this.selectedJakeHistory = weekJakeData;
                  }

                  if(Array.isArray(weekPlayerData) && weekPlayerData.length > 0) {
                    this.playersHistory[this.selectedSeason][this.selectedWeek].players = weekPlayerData;
                    this.selectedPlayerHistory = weekPlayerData;
                  }              
                                  
                  this.showHistoryTable = true;
                }
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
            var weekName = `Week ${w}`;
            if(w > 17) {
              switch(w) {
                case 18: weekName = 'Wild Card'; break;
                case 19: weekName = 'Division Round'; break;
                case 20: weekName = 'Conference Championship'; break;
                case 21: weekName = 'Pro Bowl'; break;
                case 22: weekName = 'Super Bowl'; break;    
              }
            }
            if (typeof this.weeks[w] === 'undefined') this.weeks.push({ name: weekName, number: w});            
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

  .no-player-text {
    text-align: center;
    font-size: 2em !important;
    font-weight: 400;
    font-family: 'Courier New', Courier, monospace;
    padding-top: 100px !important;
  }

  .headline {
    width: 100%;    
  }

  .v-card__text {
    padding: 4px;
  }

  .v-card__title {
    background: transparent !important;
  }
</style>