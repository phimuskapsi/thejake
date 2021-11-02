<template>
  <div>
    <v-container fluid style="height:100%" v-if="showUltimateTable">
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
        >
          <div>
            <v-select
              v-model="ultimateSelectedSeason"
              :items="ultimateSeasonSelect"
              label="Season"
              @change="updateUltimate()"
            ></v-select>
            <v-data-table
              :headers="headers"
              :items="ultimateJakes"
              :items-per-page="50"
              :single-expand="false"
              item-key="player"
              :expanded.sync="ultimateTableExpanded"
              show-expand
              class="elevation-2"
            >
              <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length">
                  <v-simple-table
                    dense
                    style="width:425px;float:left;margin-top:1em;margin-bottom:1em;margin-left:55px;margin-right:1em;border:1px solid #333;"
                  >
                    <tr>
                      <td
                        style="background-color:#e1ad21;font-size:12px;font-weight:600;width:30px;"
                      >
                        1<sup>st</sup>:
                      </td>
                      <td
                        style="width: calc(100% / 12);font-size:12px;font-weight:600;width:30px;"
                      >
                        {{ item.positions.first }}
                      </td>
                      <td
                        style="background-color:#bec2cb;font-size:12px;font-weight:600;width:30px;"
                      >
                        2<sup>nd</sup>:
                      </td>
                      <td
                        style="width: calc(100% / 12);font-size:12px;font-weight:600;width:30px;"
                      >
                        {{ item.positions.second }}
                      </td>
                      <td
                        style="background-color:#cd7f32;font-size:12px;font-weight:600;width:30px;"
                      >
                        3<sup>rd</sup>:
                      </td>
                      <td
                        style="width: calc(100% / 12);font-size:12px;font-weight:600;width:30px;"
                      >
                        {{ item.positions.third }}
                      </td>
                      <td
                        style="background-color:#a3bfff;font-size:12px;font-weight:600;width:30px;"
                      >
                        4<sup>th</sup>:
                      </td>
                      <td
                        style="width: calc(100% / 12);font-size:12px;font-weight:600;width:30px;"
                      >
                        {{ item.positions.fourth }}
                      </td>
                    </tr>
                  </v-simple-table>
                </td>
              </template>
            </v-data-table>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import NFLData from "../plugins/pffFunctions.js";
import SideNav from "./SideNav";

export default {
  components: { SideNav },
  data() {
    return {
      ultimateTableExpanded: [],
      headers: [
        {
          text: "Player:",
          align: "start",
          sortable: true,
          value: "player"
        },
        {
          text: "Team:",
          value: "team"
        },
        {
          text: "ATT:",
          value: "attempts"
        },
        {
          text: "COMP:",
          value: "completions"
        },
        {
          text: "TD:",
          value: "tds"
        },
        {
          text: "INT",
          value: "ints"
        },
        {
          text: "FUM",
          value: "fum_lost"
        },
        {
          text: "SACKS",
          value: "sacks"
        },
        {
          text: "QBR (avg):",
          value: "qbr_avg"
        },
        {
          text: "TruJake Total:",
          value: "jake_total"
        }
      ],
      NFLData: new NFLData(),
      ultimateSeasonSelect: [],
      ultimateSelectedSeason: 0,
      ultimateJakes: [],
      showUltimateTable: false
    };
  },
  methods: {
    async getData(season) {
      await this.NFLData.init();

      try {
        let player_req = await this.NFLData.getJakesUltimate(season);
        if (player_req && player_req.players) {
          this.ultimateJakes = player_req.players;
        }
      } catch (err) {
        //console.log(err);
      }
    },
    async updateUltimate() {
      await this.getData(this.ultimateSelectedSeason);
    }
  },
  mounted() {
    this.getData(this.NFLData.season).then(() => {
      localStorage.setItem("ultimate_season", this.NFLData.season);
      this.ultimateSeasonSelect = this.NFLData.seasons;
      this.ultimateSelectedSeason = this.NFLData.season;
      this.showUltimateTable = true;
    });
  }
};
</script>
