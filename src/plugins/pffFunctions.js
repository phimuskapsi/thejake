import axios from "axios";
import e from "cors";
import { cp } from "fs";
import * as moment from "moment-timezone";

export default class NFLData {
  constructor() {
    this.now = moment();
    this.start = "";
    this.player = {};
    this.players = [];
    this.winLossCache = [];
    this.jakes = [];
    this.weekGames = [];
    this.week = 0;
    this.season = 0;
  }

  async init() {
    let self = this;
    await self.getCurrentWeek();
  }

  async calcDefStats() {
    try {
      let teamsResp = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/def/`
      );
      let teamsRespJSON = await teamsResp.json();
      let history_teams = teamsRespJSON.history;

      let team_totals = {};
      let team_season_totals = {};
      let team_jakes_totals = {};

      for (let t = 0; t < history_teams.length; t++) {
        let team = history_teams[t];
        let team_color = await JSON.parse(team.winner_color);
        console.log("starting team: " + team.winner);

        if (!team_totals[team.winner_id])
          team_totals[team.winner_id] = {
            total: 0,
            name: team.winner,
            color: team_color.dark_color_ref + " " + team_color.light_color_ref
          };
        if (!team_jakes_totals[team.player_id])
          team_jakes_totals[team.player_id] = {};
        if (!team_jakes_totals[team.player_id][team.winner_id])
          team_jakes_totals[team.player_id][team.winner_id] = {
            total: 0,
            team: team.loser,
            name: team.player,
            winner: team.winner,
            color: team_color.helmet_color_ref
          };

        if (!team_season_totals[team.season])
          team_season_totals[team.season] = {};
        if (!team_season_totals[team.season][team.winner_id])
          team_season_totals[team.season][team.winner_id] = {
            total: 0,
            name: team.winner,
            color: team_color.helmet_color_ref
          };

        team_totals[team.winner_id].total++;
        team_season_totals[team.season][team.winner_id].total++;
        team_jakes_totals[team.player_id][team.winner_id].total++;
      }

      let tt = [];
      for (let k in team_totals) {
        tt.push(team_totals[k]);
      }

      tt.sort((a, b) => {
        return b.total - a.total;
      });

      //console.log(sortable);

      return {
        team_totals: tt,
        team_season_totals: team_season_totals,
        team_jakes_totals: team_jakes_totals,
        ok: true
      };
    } catch (err) {
      return { ok: false };
    }
  }

  async getCurrentWeek() {
    try {
      let req = await fetch(
        "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
      );
      let json = await req.json();

      this.week = json.week.number;
      this.season = json.season.year;

      // Get the calendar to figure out where we are.
      let leagueData = json.leagues[0];
      let calendar = leagueData.calendar;
      let seasonType = parseInt(leagueData.season.type.type); // 1= Pre, 2= Reg, 3= Post, 4= Off

      // If we are in the pre-season skip
      if (seasonType === 1)
        return {
          success: true,
          msg: "we're in the pre-season...stay tuned..."
        };
      // If we are in the off-season skip
      if (seasonType === 4)
        return {
          success: true,
          msg: "we're in the off-season...stay tuned..."
        };

      let currentDate = moment();
      let currentWeek = parseInt(
        calendar[seasonType - 1].entries.find(
          entry =>
            moment(entry.startDate) <= currentDate &&
            moment(entry.endDate) >= currentDate
        ).value
      );

      // If we are in the post-season, ESPN re-numbers their weeks from 1-5 (WC, Div, Conf, ProBowl, SuperBowl)
      if (seasonType === 3) currentWeek += 17;

      this.week = currentWeek;

      return true;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getESPNSchedule(season, week, seasonType, returnContent = false) {
    let espnSchedule = await fetch(
      `https://secure.espn.com/core/nfl/schedule?year=${season}&week=${week}&seasontype=${seasonType +
        1}&xhr=1&render=false`
    );
    let espnScheduleData = await espnSchedule.json();
    return returnContent
      ? espnScheduleData.content
      : espnScheduleData.content.schedule;
  }

  async setupSeasonData(season, getAllSeasons = false, update = false) {
    let startYear = getAllSeasons ? 2008 : season;
    let seasons = [];

    for (let y = startYear; y <= season; y++) {
      let espnContent = await this.getESPNSchedule(y, 1, 1, true);
      let calendar = espnContent.calendar;

      let seasonData = {
        pre_start: moment(calendar[Object.keys(calendar)[0]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        pre_end: moment(calendar[Object.keys(calendar)[0]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        reg_start: moment(calendar[Object.keys(calendar)[1]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        reg_end: moment(calendar[Object.keys(calendar)[1]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        post_start: moment(calendar[Object.keys(calendar)[2]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        post_end: moment(calendar[Object.keys(calendar)[2]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        season: y
      };

      seasons.push(seasonData);
    }

    if (update) {
      var url = `http://xperimental.io:4200/api/v1/add/pff/seasons`;
      var updated_season_resp = await fetch(url, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(seasons)
      });

      var updated_season = await updated_season_resp.json();
    }

    return seasons;
  }

  async getSchedule(
    season,
    week,
    seasonType,
    returnSchedule = true,
    update = true,
    last_updated = null
  ) {
    try {
      let schedule = await this.getESPNSchedule(season, week, seasonType);

      // Just return the schedule object, if this is false then we want actual game info.
      if (returnSchedule) return schedule;
      let game_data = [];
      let game_dates = Object.keys(schedule);
      for (let d = 0; d < game_dates.length; d++) {
        let game_date = schedule[game_dates[d]];
        let games = game_date.games;

        for (let g = 0; g < games.length; g++) {
          let game = games[g];
          let away_team = game.competitions[0].competitors.find(
            competitor => competitor.homeAway === "away"
          );
          let home_team = game.competitions[0].competitors.find(
            competitor => competitor.homeAway === "home"
          );

          if (away_team.abbreviation === "WSH") away_team.abbreviation = "WAS";
          if (home_team.abbreviation === "WSH") home_team.abbreviation = "WAS";
          if (away_team.abbreviation === "LAR") away_team.abbreviation = "LA";
          if (home_team.abbreviation === "LAR") home_team.abbreviation = "LA";
          if (away_team.abbreviation === "CLE") away_team.abbreviation = "CLV";
          if (home_team.abbreviation === "CLE") home_team.abbreviation = "CLV";
          if (away_team.abbreviation === "BAL") away_team.abbreviation = "BLT";
          if (home_team.abbreviation === "BAL") home_team.abbreviation = "BLT";
          if (away_team.abbreviation === "HOU") away_team.abbreviation = "HST";
          if (home_team.abbreviation === "HOU") home_team.abbreviation = "HST";
          if (away_team.abbreviation === "ARI") away_team.abbreviation = "ARZ";
          if (home_team.abbreviation === "ARI") home_team.abbreviation = "ARZ";

          let teamIdAR = await fetch(
            `http://xperimental.io:4200/api/v1/get/pff/team/${
              away_team.abbreviation
            }/${season}`
          );
          let teamIdAJ = await teamIdAR.json();
          let awayteamId = teamIdAJ.team[0].franchise_id;

          let teamIdHR = await fetch(
            `http://xperimental.io:4200/api/v1/get/pff/team/${
              home_team.abbreviation
            }/${season}`
          );

          let teamIdHJ = await teamIdHR.json();
          let hometeamId = teamIdHJ.team[0].franchise_id;
          let isTie =
            away_team.score === home_team.score && game.status.type.completed;

          let new_game = {
            id: game.id,
            date: moment(game.date)
              .tz("America/New_York")
              .format("Y-m-d HH:mm"),
            status: game.competitions[0].status,
            name: game.name,
            score_away: away_team.score,
            score_home: home_team.score,
            away_team_id: awayteamId,
            home_team_id: hometeamId,
            season: season,
            week: week,
            espn_game_id: game.id,
            active: game.status.type.completed,
            winner: home_team.winner ? "home" : isTie ? "tie" : "away",
            loser_id: home_team.winner ? awayteamId : isTie ? 0 : hometeamId,
            winner_id: home_team.winner ? hometeamId : isTie ? 0 : awayteamId,
            last_updated: last_updated
          };

          if (update) {
            var url = `http://xperimental.io:4200/api/v1/add/pff/game`;
            var updated_game_resp = await fetch(url, {
              method: "post",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(new_game)
            });

            var updatedGame = await updated_game_resp.json();
            new_game.updated = updatedGame.success;
          } else {
            new_game.updated = false;
          }

          new_game.home_team_abbr = home_team.abbreviation;
          new_game.away_team_abbr = away_team.abbreviation;
          game_data.push(new_game);
        }
      }

      return game_data;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesByWeek(season = 0, week = 0) {
    let players = [];

    let getSeason = season > 0 ? season : this.season;
    let getWeek = week > 0 ? week : this.week;
    try {
      let jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/${getSeason}/${getWeek}`
      );
      players = await jakeReq.json();

      if (players.jakes.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesBySeason(season = 0) {
    let players = [];
    let getSeason = season > 0 ? season : this.season;
    try {
      let jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/${getSeason}`
      );
      players = await jakeReq.json();

      if (players.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesHistory() {
    let players = [];

    try {
      let jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes_history/`
      );
      players = await jakeReq.json();

      if (players.jakes.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getPlayersByWeek(season = 0, week = 0) {
    let players = [];

    let getSeason = season > 0 ? season : this.season;
    let getWeek = week > 0 ? week : this.week;
    try {
      let playerReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/player_stats/${getSeason}/${getWeek}`
      );
      players = await playerReq.json();
      if (players.players.length > 0) {
        return { success: true, players: players.players };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getPlayersBySeason(season = 0) {
    let players = [];
    let getSeason = season > 0 ? season : this.season;
    try {
      let playerReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/player_stats/${getSeason}`
      );
      players = await playerReq.json();

      if (players.players.length > 0) {
        return { success: true, players: players.players };
      }

      throw { success: false, msg: "no players to fetch" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async updateCurrentWeek(season = 0, week = 0) {
    try {
      let selected_season = this.season;
      let selected_week = this.week;

      if (season > 0) selected_season = season;
      if (week > 0) selected_week = week;

      let latestWeekResp = await fetch(
        `http://xperimental.io:4200/api/v1/update/currentweek/${selected_season}/${selected_week}`
      );
      let latestWeek = await latestWeekResp.json();
      return latestWeek;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }
}
