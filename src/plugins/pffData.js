import axios from 'axios';
import * as moment from 'moment';

export default class NFLData {
  constructor () {
    this.now = moment();
    this.start = '';
    this.player = {};
    this.players = [];
    this.winLossCache = [];
    this.jakes = [];
    this.weekGames = [];
    this.week = 0;
    this.season = 0;
  }

  async init () {
    var self = this;
    await self.getCurrentWeek();
  }

  async calcDefStats() {
    try {
      var teamsResp = await fetch(`http://lvh.me:3000/api/v1/get/jakes/def/`);
      var teamsRespJSON = await teamsResp.json();
      var history_teams = teamsRespJSON.history;

      var team_totals = {};
      var team_season_totals = {};
      var team_jakes_totals = {};
      
      for(var t=0;t<history_teams.length;t++) {
        var team = history_teams[t];
        var team_color = await JSON.parse(team.winner_color);
        console.log('starting team: ' + team.winner);
          
        if(!team_totals[team.winner_id]) team_totals[team.winner_id] = { total: 0, name: team.winner, color: team_color.dark_color_ref + ' ' + team_color.light_color_ref };
        if(!team_jakes_totals[team.player_id]) team_jakes_totals[team.player_id] = {};
        if(!team_jakes_totals[team.player_id][team.winner_id]) team_jakes_totals[team.player_id][team.winner_id] = { total: 0, team: team.loser, name: team.player, winner: team.winner, color: team_color.helmet_color_ref };

        if(!team_season_totals[team.season]) team_season_totals[team.season] = {};
        if(!team_season_totals[team.season][team.winner_id]) team_season_totals[team.season][team.winner_id] = { total: 0, name: team.winner, color: team_color.helmet_color_ref };


        team_totals[team.winner_id].total++;
        team_season_totals[team.season][team.winner_id].total++;
        team_jakes_totals[team.player_id][team.winner_id].total++;
      }

      var tt = [];
      for(var k in team_totals) {
        tt.push(team_totals[k]);
      }

      tt.sort((a,b) => {
        return  b.total - a.total
      });

      //console.log(sortable);

      return { team_totals: tt, team_season_totals: team_season_totals, team_jakes_totals: team_jakes_totals, ok: true };
    } catch (err) {
      return { ok: false };
    }
  }

  async getCurrentWeek() {
    try {
      let req = await fetch('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
      let json = await req.json();

      this.week = json.week.number;
      this.season = json.season.year;

      return true;
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  async getJakesByWeek (season = 0, week = 0) {    
    var players = [];

    let getSeason = season > 0 ? season : this.season;
    let getWeek = week > 0 ? week : this.week;
    try {
      let jakeReq = await fetch(`http://lvh.me:3000/api/v1/get/jakes/${getSeason}/${getWeek}`);
      players = await jakeReq.json();

      if (players.jakes.length > 0) { 
        return { success: true, players: players.jakes };
      }

      throw {success: false, msg: 'no players found'};
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  async getJakesBySeason(season = 0) {    
    var players = [];    
    let getSeason = season > 0 ? season : this.season;    
    try {
      let jakeReq = await fetch(`http://lvh.me:3000/api/v1/get/jakes/${getSeason}`);
      players = await jakeReq.json();

      if (players.length > 0) { 
        return { success: true, players: players.jakes };
      }

      throw {success: false, msg: 'no players found'};
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  async getJakesHistory () {    
    var players = [];

    try {
      let jakeReq = await fetch(`http://lvh.me:3000/api/v1/get/jakes_history/`);
      players = await jakeReq.json();

      if (players.jakes.length > 0) { 
        return { success: true, players: players.jakes };
      }

      throw {success: false, msg: 'no players found'};
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  } 

  async getPlayersByWeek (season = 0, week = 0) {    
    var players = [];

    let getSeason = season > 0 ? season : this.season;
    let getWeek = week > 0 ? week : this.week;
    try {
      let playerReq = await fetch(`http://lvh.me:3000/api/v1/get/player_stats/${getSeason}/${getWeek}`);
      players = await playerReq.json();

      if (players.players.length > 0) { 
        return { success: true, players: players.players };
      }

      throw {success: false, msg: 'no players found'};
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  async getPlayersBySeason(season = 0) {    
    var players = [];    
    let getSeason = season > 0 ? season : this.season;    
    try {
      let playerReq = await fetch(`http://lvh.me:3000/api/v1/get/player_stats/${getSeason}`);
      players = await playerReq.json();

      if (players.players.length > 0) { 
        return { success: true, players: players.players };
      }

      throw {success: false, msg: 'no players to fetch'};
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }

  async updateCurrentWeek(season = 0, week = 0) {
    try {
      var selected_season = this.season;
      var selected_week = this.week;

      if(season > 0) selected_season = season;
      if(week > 0) selected_week = week;

      var latestWeekResp = await fetch(`http://lvh.me:3000/api/v1/update/currentweek/${selected_season}/${selected_week}`);
      var latestWeek = await latestWeekResp.json();
      return latestWeek;
      
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
    }
  }
}