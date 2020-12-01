<template>
    <div style="min-height:4px">
        <v-progress-linear
        :active="show"
        :color="color"
        :indeterminate="query"
        v-model="percent"
        ></v-progress-linear>
    </div>
</template>
<script>
export default {
  props: {
    color: String,
    percent: Number,
    query: Boolean,
    show: Boolean
  },
};
</script>
<style>

</style>