"use strict";
const axios = require('axios');
const moment  = require('moment');

module.exports = class NFLData {
  constructor () {
    this.now = moment();
    this.start = moment("2019-09-08 12:00:00");
    this.player = {};
    this.players = [];
    this.winLossCache = [];
    this.jakes = [];

    // Might as well really init the week number
    // As soon as noon passes of the sunday it rolls to the proper week
    this.week = Math.ceil(this.now.diff(this.start, 'weeks', true));
    this.week = this.week > 17 ? 17 : this.week;
    this.season = this.now.format('YYYY');
    this.position = 'QB';
    this.apiKey = 'naBSrfRl2voKxZ0TNHsdAiy36PzV7ebt';
  }

  async getJakes (y = 0, w = 0, g = 0) {
    var self = this;
    let url = new URL('https://profootballapi.com/players');
    url.searchParams.append('api_key', 'naBSrfRl2voKxZ0TNHsdAiy36PzV7ebt');
    url.searchParams.append('season_type', 'REG');
    url.searchParams.append('stats_type', 'passing');
    url.searchParams.append('year', (y > 0 ? y : self.season));
    url.searchParams.append('week', (w > 0 ? w : self.week));

    if (g > 0) {
      url.searchParams.append('game_id', g);
    }

    var response = await axios.post(url);
    //console.log('data:', response.data);
    if (response.data) {
      this.parseWeekData(response.data);
      if (self.players.length > 0) {        
        self.players.sort((a,b) => {
          return b.jakeScore - a.jakeScore;
        });

        for(let p=0;p<self.players.length;p++) {
          let lname = self.players[p].name.toLowerCase();
          self.players[p].image = require('../assets/players/' + lname + '.jpg');         
        }

        let kingJake = self.players.splice(0,1);
        let pretenderJakes = self.players.splice(0,3);

        return { king: kingJake[0], pretenders: pretenderJakes };
      }
    }

    return false;
  }

  async getJakeHistory(y = -1, w = -1, g = -1) {
    let url = 'http://lvh.me:3000/api/players/jakes/history';
     
    if (y > -1) {
      url += `/${y}`;

      if (w > -1) {
        url += `/${w}`;        
      }
    }

    var history = await axios.get(url);
    if (history.length > 0) {
      return history;
    } 
    
    return false;
  }

  async getPlayerWin () {
    let self = this;
    // See if we've already seen the team info for this player.
    if(self.winLossCache.length > 0 && self.winLossCache.keys().indexOf(self.player.teamAbbr) >= 0) {
      let cache = self.winLossCache[self.player.teamAbbr];
      self.player.winLossInfo = {
        win: cache.win,      
        score: cache.score
      }
    } else {
      // Nope, let's grab that players matchup and set the winLossInfo while also filling the cache with the opposing team
      // theoretically this will knock this down to 16 grabs instead of 30-32 (depending if byes)
      let url = `https://api.fantasy.nfl.com/v1/players/advanced?teamAbbr=${self.player.teamAbbr}&season=${self.season}&week=${self.week}&format=json&position=${self.position}`;    
      let response = await axios.get(url);
      let gameInfo = response.data;
      
      if (gameInfo.QB.length > 0) {
        // Then we have something to look at. 
        for(var g=0;g<gameInfo.QB.length;g++) {
          let game = gameInfo.QB[g];
          // lets just check that our players match, they may not
          if (game.gsisPlayerId === self.player.nflId) {
            let status = game.status.split(',');

            self.player.winLossInfo = {
              win: status[0].trim().toLowerCase() === 'win',            
              score: status[1].trim()
            }

            // check cache for opponent data (which should theoretically always be like this in here)
            if(self.winLossCache.length === 0 || self.winLossCache.keys().indexOf(game.opponentTeamAbbr) === -1) {
              self.winLossCache[game.opponentTeamAbbr] = {
                win: !self.player.winLossInfo.win,
                score: self.player.winLossInfo.score
              }
            }
          } // player match end
        } // end loop
      }
    }

    return;
  }

  parseWeekData (weekData, r = false) {
    let self = this;
    self.players = [];
    for (let game in weekData){
      let gameData = weekData[game];
      for (let playerID in gameData) {
        let player = gameData[playerID];

        if (player.passing) {
          if (player.id === undefined) player.id = playerID;
          let p = new NFLPlayer(player);
          if (p.playerId !== undefined) {
            self.players.push(p);
          }
        }
      }  
    }

    if (r) {
      let p = self.players;
      self.players = [];
      return p;
    }
  }

  async getHistoricalDataFromAPI (year = 2009) {    
    let scheduleURL = 'https://profootballapi.com/schedule';
    let scheduleData = {
      api_key: this.apiKey,
      year: year,
      season_type: 'REG'
    };

    try {
      //eslint-disable-next-line
      //console.log('starting season: ', year.toString());        
      const schedule = await axios.post(scheduleURL, scheduleData);
     
      //eslint-disable-next-line
      //console.log(year.toString() + ' schedule received.');
      var weeks = await this.getWeeksFromSchedule(schedule.data);
     
      //eslint-disable-next-line
      //console.log(year.toString() + ' game week data received and parsed.');
      //eslint-disable-next-line
      //console.log('done fetching data');
      return weeks;
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  getPlayerDataFromGames (gameData = {}, awaykey = 0, homekey = 0) {
    //console.log('gameData:', gameData);
    let homePassing = gameData.home.stats.passing;
    let homeQBId    = 0;

    let awayPassing = gameData.away.stats.passing;
    let awayQBId    = 0;


    if (Object.keys(homePassing).length > 1) {
      // More than one potential QB. 
      for(let hp=0;hp<Object.keys(homePassing).length;hp++) {
        let key = Object.keys(homePassing)[hp];
        let passer = homePassing[key];
        // kind of arbitrary...oh well
        if (passer.attempts > 5) {
          homeQBId = key;
          break;
        }
      }
    } else {
      homeQBId = Object.keys(homePassing)[0];
    }

    if (Object.keys(awayPassing).length > 1) {
      // More than one potential QB. 
      for(let ap=0;ap<Object.keys(awayPassing).length;ap++) {
        let key = Object.keys(awayPassing)[ap];
        let passer = awayPassing[key];
        // kind of arbitrary...oh well
        if (passer.attempts > 5) {
          awayQBId = key;
          break;
        }
      }
    } else {
      awayQBId = Object.keys(awayPassing)[0];
    }

    let homeQB = {
      id: homeQBId,
      team: gameData.home.team,
      passing: {},
      fumbles: {},
      rushing: {}
    };

    let awayQB = {
      id: awayQBId,
      team: gameData.away.team,
      passing: {},
      fumbles: {},
      rushing: {}
    };
    
    homeQB.passing = gameData.home.stats.passing[homeQB.id];
    awayQB.passing = gameData.away.stats.passing[awayQB.id];

    if(gameData.home.stats.fumbles !== undefined && gameData.home.stats.fumbles[homeQB.id] !== undefined){
      homeQB.fumbles = gameData.home.stats.fumbles[homeQB.id];
    }

    if(gameData.away.stats.fumbles !== undefined && gameData.away.stats.fumbles[awayQB.id] !== undefined){
      awayQB.fumbles = gameData.away.stats.fumbles[awayQB.id];
    }

    if(gameData.home.stats.rushing !== undefined && gameData.home.stats.rushing[homeQB.id] !== undefined){
      homeQB.rushing = gameData.home.stats.rushing[homeQB.id];
    }

    if(gameData.away.stats.rushing !== undefined && gameData.away.stats.rushing[awayQB.id] !== undefined){
      awayQB.rushing = gameData.away.stats.rushing[awayQB.id];
    }

    // let home = new NFLPlayer(homeQB, homeQB.id);
    // let away = new NFLPlayer(awayQB, awayQB.id);
    // console.log('away qb', awayQBId);
    // console.log('home qb', homeQBId);

    return {
      home: new NFLPlayer(homeQB),
      away: new NFLPlayer(awayQB)
    }
  }

  async getWeeksFromSchedule (incomingSchedule = []) {
    var self = this;
    var weeks = {};
    
    if (incomingSchedule.length > 0) {
      for (let i=0;i<incomingSchedule.length;i++) {        
        var game = incomingSchedule[i];

        //eslint-disable-next-line
        //console.log('week ' + game.week.toString() + ': fetching game data');
        // We don't want to waste time parsing future games.
        if (game.year === self.season && game.week > self.week) continue;

        if (weeks[game.week] === undefined) {
          weeks[game.week] = [];
        }
                
        let gm = new NFLGame(game);
        let gameDetailURL = 'https://profootballapi.com/game';
        let gameDetailData = {
          api_key: self.apiKey,       
          game_id: gm.id
        };

        try {
          const gameDetail = await axios.post(gameDetailURL, gameDetailData);

          //eslint-disable-next-line
          //console.log('week ' + game.week.toString() + ': game data received');

          let QBs = this.getPlayerDataFromGames(gameDetail.data);

          // eslint-disable-next-line
          //console.log('qb data', QBs);

          QBs.home.stats.win = gm.home.score > gm.away.score;
          QBs.away.stats.win = gm.away.score > gm.home.score;

          gm.home.QB = QBs.home;
          gm.away.QB = QBs.away;
          weeks[game.week].push(gm); 
        } catch (err) {
          weeks[game.week].push({
            id: -1,
            message: 'server error retrieving game: ' + gm.id
          });
          continue;
        }   
      }

      return weeks;
    }
  }
}

class NFLPlayer {
  constructor (playerRow) {   
    if (playerRow.passing.attempts <= 5) return false;

    this.name                = playerRow.passing.name;    
    this.image               = '';
    this.jakeMulti           = 1/6;
    this.playerId            = playerRow.id;
    this.team                = playerRow.team;
    this.stats =  {    
      attempts:      typeof playerRow.passing !== undefined && typeof playerRow.passing.attempts      !== 'undefined' ? playerRow.passing.attempts : 0,
      completions:   typeof playerRow.passing !== undefined && typeof playerRow.passing.completions   !== 'undefined' ? playerRow.passing.completions : 0,
      passYards:     typeof playerRow.passing !== undefined && typeof playerRow.passing.yards         !== 'undefined' ? playerRow.passing.yards : 0,
      passTds:       typeof playerRow.passing !== undefined && typeof playerRow.passing.touchdowns    !== 'undefined' ? playerRow.passing.touchdowns : 0,
      ints:          typeof playerRow.passing !== undefined && typeof playerRow.passing.interceptions !== 'undefined' ? playerRow.passing.interceptions : 0,
      rushAttempts: 0,
      rushYards: 0,
      rushTds: 0,
      fumblesLost: 0,
      fumbles: 0,
      win: 0
    };

    if (playerRow.rushing !== undefined) {
      this.stats.rushAttempts = typeof playerRow.rushing.attempts !== 'undefined' ? playerRow.rushing.attempts : 0;
      this.stats.rushYards = typeof playerRow.rushing.yards       !== 'undefined' ? playerRow.rushing.yards : 0;
      this.stats.rushTds = typeof playerRow.rushing.touchdowns    !== 'undefined' ? playerRow.rushing.touchdowns : 0;
    }

    if (playerRow.fumbles !== undefined) {
      this.stats.fumblesLost = typeof playerRow.fumbles.fumbles_lost !== 'undefined' ? playerRow.fumbles.fumbles_lost : 0;
      this.stats.fumbles = typeof playerRow.fumbles.total_fumbles    !== 'undefined' ? playerRow.fumbles.total_fumbles : 0;
    }

    this.jakeScore = parseFloat(((parseInt(this.stats.fumblesLost) + parseInt(this.stats.ints)) * this.jakeMulti) * 100).toFixed(2) 
    if (isNaN(this.jakeScore)) this.jakeScore = '0.00';
  }
}

class NFLGame {
  constructor(gameData) {
    this.away = {
      win: gameData.away_score > gameData.home_score,
      score: gameData.away_score,
      team: gameData.away,
      QB: {}
    };

    this.home = {
      win: gameData.home_score > gameData.away_score,
      score: gameData.home_score,
      team: gameData.home,
      QB: {}
    };

    this.id     = gameData.id;
    this.year   = gameData.year;
    this.week   = gameData.week;
    this.date   = gameData.year.toString() + "-" + gameData.month.toString() + "-" + gameData.day.toString();
    this.final  = gameData.final == 1;    
  }
}