<template>
  <tr>
    <th>{{dungeon.name}}</th>
    <td>{{Number(dungeon.apples* modifier).toLocaleString()}}</td>
    <td>{{Number(runs).toLocaleString()}}</td>
    <td v-if="displayCell">{{Number(runs * dungeon.reports).toLocaleString()}}</td>
    <td v-if="displayCell">{{Number(runs * (dungeon.reports / 20)).toLocaleString()}}</td>
  </tr>
</template>

<script>
export default {
  name: "Dungeon",
  components: {
  },
  props: {
    dungeon: {
      type: Object,
      required: true,
    },
    apples:{
      type: Number,
      required: true
    },
    options:{
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  computed:{
    modifier(){
      return this.$parent.options.talisman ? 1.2 : 1;
    },
    runs(){
      return Math.ceil(this.apples / (this.dungeon.apples * this.modifier))
    },
    displayCell: function(){
      if(this.options.reports){
        return true;
      }
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
