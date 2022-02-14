<template>
  <!-- Load stuf in here if authed -->

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
        >
          <div>
            <v-data-table
              :headers="headers"
              :items="jakesByScore"
              :items-per-page="50"
              class="elevation-2"
            >
            </v-data-table>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <amplify-authenticator>
            Test
          </amplify-authenticator>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <!-- No login -->
</template>

<script>
export default {
  name: "TheWorst",
  data() {
    return {
      headers: [
        {
          text: "Player:",
          align: "start",
          sortable: true,
          value: "name"
        },
        {
          text: "Team:",
          value: "team"
        },
        {
          text: "Season:",
          value: "season"
        },
        {
          text: "Week:",
          value: "week"
        },
        {
          text: "Ints:",
          value: "ints"
        },
        {
          text: "Fum:",
          value: "fumbles"
        },
        {
          text: "Score:",
          value: "score"
        },
        {
          text: "TruJake:",
          value: "ultimate"
        },
        {
          text: "Position:",
          value: "position"
        }
      ],
      jakes: {}
    };
  },
  methods: {
    async getTableData() {
      try {
        this.jakes = await this.NFLData.getJakesByWeek(2021, 13);
      } catch (err) {
        // eslint-disable-next-line
        console.log("Error:", err);
      }
    }
  },
  mounted() {
    this.showLoading = true;
    this.getTableData().then(() => {
      this.showLoading = false;
    });
  }
};
</script>
