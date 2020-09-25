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

  async getJakesByWeek (season = 0, week = 0) {    
    var players = [];

    let getSeason = season > 0 ? season : this.season;
    let getWeek = week > 0 ? week : this.week;
    try {
      let jakeReq = await fetch(`http://lvh.me:3000/api/v1/get/jakes/${getSeason}/${getWeek}`);
      players = await jakeReq.json();

      if (players.jakes.length > 0) { 
        return players.jakes;
      }

      throw 'no players found.';
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
        return players;
      }

      throw 'no players found.';
    } catch (err) {
      //eslint-disable-next-line
      console.log('error:', err);
      return err;
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