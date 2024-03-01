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
			message: 'Demon Planner Data copied to clipboard!',
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

async function upload() {
	const f = dropFile.value;
	const response = await parseJsonFile(f);
	emit('ingest', response)
	emit('close')
}

async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = event => resolve(JSON.parse(event.target.result))
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
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
				<o-tabs v-model="activeTab" class="is-fullwidth" type="boxed">
					<o-tab-item :value="0" label="Export">
						<div class="columns">
							<div class="column">
								<o-field @click="copy" label="Copy Planner Data">
									<o-input type="textarea" class="is-fullwidth" style="resize:none; cursor:crosshair !important;" disabled v-model="output"></o-input>
								</o-field>
							</div>
							<div class="is-divider-vertical" data-content="OR"></div>
							<div class="column">
								<o-field label="Save plan to File">
									<o-input v-model="fname" placeholder="filename..." />
									<o-button variant="primary" label="Save" @click="download" />
								</o-field>
							</div>
						</div>
					</o-tab-item>
					<o-tab-item :value="1" label="Import">
						<div class="columns">
							<div class="column">
								<o-field label="Paste Planner Data">
									<o-input type="textarea" class="is-fullwidth" style="resize:none;" v-model="input"></o-input>
								</o-field>
								<o-button type="button" class="is-fullwidth" variant="primary" @click="ingest">Import</o-button>
							</div>
							<div class="is-divider-vertical" data-content="OR"></div>
							<div class="column">
								<o-field label="Import a File">
									<o-upload v-model="dropFile" drag-drop :multiple="false" style="height:128px;">
										<section class="upload-text-center">
											<p style="margin-top: 16px;">
												<o-icon icon="upload" size="is-large" />
											</p>
											<p>Drop your file here or click to upload</p>
										</section>
									</o-upload>
									</o-field>
									<div class="tags" v-if="dropFile.name">
										<span>
											{{ dropFile.name }}
											<o-tooltip label="Upload this File" variant="primary" position="top">
												<o-button
													icon-left="upload"
													size="small"
													variant="primary"
													class="is-circular"
													@click="upload()">
												</o-button>
											</o-tooltip>
										</span>
								</div>
							</div>
						</div>
					</o-tab-item>
				</o-tabs>
			</div>
    </section>
    <footer class="modal-card-foot">
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
    width: 600px !important;
  }

	.is-fullwidth {
		width:100%;
	}
	
	.upload-text-center {
		text-align: center;
	}
</style>