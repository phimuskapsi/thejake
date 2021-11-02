<template>
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
            <v-list-item-title
              style="cursor:pointer !important;text-decoration:underline;"
            >
              <router-link to="/">Current Stats</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title
              style="cursor:pointer !important;text-decoration:underline;"
            >
              <router-link to="/graf">Graf</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title
              style="cursor:pointer !important;text-decoration:underline;"
            >
              <router-link to="/history">Historical Stats</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title
              style="cursor:pointer !important;text-decoration:underline;"
            >
              <router-link to="/tables">Stat Tables</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </template>
  </v-navigation-drawer>
</template>
