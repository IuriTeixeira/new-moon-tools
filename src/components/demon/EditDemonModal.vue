<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Editing </p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field label="Set Level">
          <o-input type="number" min=1 max=99 v-model="options.level"></o-input>
        </o-field>
    </section>
    <footer class="modal-card-foot">
      <o-button type="button" @click="$emit('close')">Close</o-button>
    </footer>
  </div>
</template>

<script>

</script>

<style lang="scss" scoped>
  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
    overflow: hidden;
  }
	
  @media screen and (min-width: 769px) {
    .modal-card {
      margin: 0 auto;
      max-height: calc(100vh - 40px);
      width: 50%
    }
  }
  .modal-card {
    margin: 0 20px;
    max-height: calc(100vh - 160px);
    overflow: auto;
    position: relative;
    width: 400px !important;
  }
</style>