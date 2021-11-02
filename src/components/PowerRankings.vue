<template>
  <div>
    <v-container fluid style="height:100%">
      <v-row no-gutters>
        <v-col md="3" lg="2" xl="2" class="d-none d-md-block">
          <side-nav></side-nav>
        </v-col>
        <v-col cols="12" class="d-md-none"> </v-col>
        <v-col
          xl="10"
          lg="10"
          md="9"
          sm="12"
          style="padding: 0em 2em !important;"
          v-if="showGraf"
        >
          <div>
            <v-select
              v-model="selectedSeason"
              :items="seasonsSelect"
              label="Season"
              @change="updateChart()"
            ></v-select>
          </div>
          <div style="width: 100%;height:1000px;">
            <zingchart
              :data="powerRankSeasonChart"
              :height="'100%'"
            ></zingchart>
          </div>
          <!--
          <div style="width: 100%;height:100%;">
            <zingchart
              :data="powerRankSeasonChart2"
              width="100%"
              height="100%"
            ></zingchart>-->
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import SideNav from "./SideNav";
import "zingchart/modules-es6/zingchart-rankflow.min.js";

export default {
  components: { SideNav },
  data() {
    return {
      powerRankSeasonChart: {},
      powerRankSeasonChart2: {},
      rankingsData: [],
      rankingsForChart: [],
      showGraf: true,
      seasonsSelect: [],
      selectedSeason: 0,
      weeks: [],
      weeks_raw: []
    };
  },
  methods: {
    async getData(season, update = true) {
      this.showGraf = false;
      let pr_data = await this.$NFLData.getESPNPowerRankings(false, season);
      this.rankingsData = pr_data.rankings;

      if (update) {
        this.setupChart();
        this.showGraf = true;
      }
    },
    async loadData() {
      localStorage.setItem("graf_season", this.$NFLData.season);
      localStorage.setItem("graf_week", this.$NFLData.week);
      this.seasonsSelect = this.$NFLData.seasons;
      this.selectedSeason = this.$NFLData.season;
      await this.getData(this.$NFLData.season);
    },
    async setupChart() {
      let series_temp = [];
      let series_temp2 = [];

      for (let r = 0; r < this.rankingsData.length; r++) {
        let ranking = this.rankingsData[r];
        let ranks = JSON.parse(ranking.ranks);

        series_temp.push({
          text: ranking.teamName,
          values: ranks
        });

        series_temp2.push({
          text: ranking.abbreviation,
          full_text: ranking.teamName,
          ranks: ranks,
          rank: ranks[ranks.length - 1]
        });
      }

      for (let w = 1; w <= 17; w++) {
        this.weeks.push(`Week #${w}`);
        this.weeks_raw.push(w);
      }

      this.powerRankSeasonChart = {
        type: "line",
        title: {
          text: "GRAF",
          "font-size": "24px",
          "adjust-layout": true
        },
        plot: {
          aspect: "spline",
          stacked: false
        },
        legend: {
          layout: "float",
          "background-color": "none",
          "border-width": 0,
          shadow: 0,
          align: "center",
          "adjust-layout": true,
          "toggle-action": "remove",
          item: {
            padding: 7,
            marginRight: 17,
            cursor: "hand"
          }
        },
        "scale-x": {
          label: {
            text: "Week #"
          },
          item: {
            "font-size": 10
          },
          values: "1:17:1"
        },
        "scale-y": {
          label: {
            text: "Ranking"
          },
          mirrored: true,
          values: "1:32:1",
          used: true
        },
        "crosshair-x": {
          "line-color": "#efefef",
          "plot-label": {
            "border-radius": "5px",
            "border-width": "1px",
            "border-color": "#f6f7f8",
            padding: "10px",
            "font-weight": "bold"
          },
          "scale-label": {
            "font-color": "#000",
            "background-color": "#f6f7f8",
            "border-radius": "5px"
          }
        },
        series: series_temp
      };

      this.powerRankSeasonChart2 = {
        options: {
          "col-space": 25,
          "row-space": 25,
          colorType: "palette",
          palette: [
            "#F05133",
            "#F0163A",
            "#000000",
            "#CE1138",
            "#146AA2",
            "#e65f20",
            "#FFCC33",
            "#0b60ad",
            "#50c878",
            "#002b5c",
            "#fdb827",
            "#7399C6",
            "#4A2583",
            "#753BBD",
            "#00275D"
          ],
          style: {
            labelOverall: {
              text: "OVERALL RANK"
            },
            itemOverall: {
              fontWeight: "bold",
              text: "%full_text"
            }
          }
        },
        plotarea: {
          margin: "45px 20px 20px 30px"
        },
        type: "rankflow",
        title: {
          text: "GRAF2",
          "font-size": "24px",
          "adjust-layout": true
        },
        "scale-x": {
          labels: this.weeks,
          values: this.weeks_raw
        },
        series: series_temp2
      };
    },
    async updateChart() {
      await this.getData(this.selectedSeason);
    }
  },
  mounted() {
    this.loadData().then(() => {
      this.showGraf = true;
    });
  }
};
</script>
