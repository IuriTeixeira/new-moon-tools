<script setup>
import { computed, onMounted, ref } from 'vue'
import { useOruga } from "@oruga-ui/oruga-next";

import DemonSummary from "@/components/fusion/DemonSummary.vue"

import demonService from "@/services/demonService";
import skillService from "@/services/skillService";

const demon = demonService.get(569);

//-- Data
const activeTab = ref("0");


</script>


<template>
  <div id="expertise">
    <section class="hero is-warning is-bold">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-2 has-text-centered">
              <figure class="image is-128x128 is-inline-block">
                <img alt="New Moon logo" src="@/assets/logo.png" />
              </figure>
            </div>
            <div class="column is-10">
              <!-- Left side -->
              <h1 class="title">Demon Fusion Simulator</h1>
              <p class="subtitle">In Beta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">

				<o-tabs v-model="activeTab" class="is-fullwidth" type="boxed">
					<o-tab-item value="0" label="Demon Summary">
						<DemonSummary
							:demon="demon"
						/>
					</o-tab-item>
					<o-tab-item value="1" label="Double Fusion">
					</o-tab-item>
					<o-tab-item value="2" label="Triple Fusion">
					</o-tab-item>
				</o-tabs>
      </div>
    </section>
  </div>
</template>

<style lang="scss">

</style>