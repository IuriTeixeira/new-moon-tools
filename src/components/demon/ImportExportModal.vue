<script setup>
import { ref, onMounted, computed } from 'vue'


const props = defineProps({
  data: {
    type: Object,
  }
})

const emit = defineEmits(['close', 'ingest'])

const activeTab = ref(0);

const input = ref("");
const fname = ref("demon-planner");

const output = computed(() =>{
	return JSON.stringify(props.data.value);
})

const dropFile = ref({});

function copy() {
	navigator.clipboard.writeText(output.value);
	oruga.notification.open({
			message: 'Link copied to clipboard!',
			rootClass: 'toast-notification',
			position: 'top',
			duration: 2000
		})
}

function download() {
	let text = JSON.stringify(output.value);
	let filename = `${fname.value}.json`;
	let element = document.createElement('a');
	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();
	document.body.removeChild(element);     
}

function upload() {
	const f = dropFile.value;
	var reader = new window.FileReader()
	let fileText = reader.readAsText(f);
	let text = JSON.parse(fileText);
}

function ingest() {
	emit('ingest', input.value)
	emit('close')
}

</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Share Your Perfect Demon</p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
			<div class="container">
				<o-tabs v-model="activeTab" :expanded="true">
					<o-tab-item :value="0" label="Export">
						<o-field @click="copy" label="Click to Copy to Clipboard">
							<o-input type="textarea" class="is-fullwidth" style="resize:none;" disabled v-model="output"></o-input>
						</o-field>
						<o-field grouped>
							<o-input v-model="fname" placeholder="filename..." />
							<o-button variant="primary" label="Save" @click="download" />
						</o-field>
					</o-tab-item>
					<o-tab-item :value="1" label="Import">
						<o-field label="Paste Demon Planner Data Here">
							<o-input type="textarea" class="is-fullwidth" style="resize:none;" v-model="input"></o-input>
						</o-field>
						<o-button type="button" @click="ingest">Import</o-button>
						<div class="content"> or </div>
						<o-field>
							<o-upload v-model="dropFile" drag-drop :multiple="false">
								<section class="ex-center">
									<p>
										<o-icon icon="upload" size="is-large" />
									</p>
									<p>Drop your file here or click to upload</p>
								</section>
							</o-upload>
						</o-field>
						<div class="tags">
							<span>
								{{ dropFile.name }}
								<o-button
									icon-left="times"
									size="small"
									native-type="button"
									@click="upload()">
								</o-button>
							</span>
					</div>
					</o-tab-item>
				</o-tabs>
			</div>
    </section>
    <footer class="modal-card-foot">
      <o-button type="button" @click="$emit('close')">Close</o-button>
    </footer>
  </div>
</template>

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