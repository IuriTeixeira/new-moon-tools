import Levels from "@/data/levels.json"
import Dungeons from "@/data/dungeons.json"
import Expertise from "@/data/expertise.json"
import Fields from "@/data/fields.json"

import expertiseService from "@/services/expertiseService.js"

import OptionDefaults from  "@/data/options.json"
import _ from 'lodash'
export default {
    getLevels(){
        return _.cloneDeep(Levels);
    },
    getDungeons(){
        return _.cloneDeep(Dungeons);
    },
    getExpertise(){
        return _.cloneDeep(Expertise);
    },
    getFields(){
        return _.cloneDeep(Fields);
    },

    getAppleDefaults(){
        var options = _.cloneDeep(OptionDefaults)
        return options.apple;
    },

    getBookDefaults(){
        var options = _.cloneDeep(OptionDefaults)
        return options.book;
    },

    getExpertiseDefaults(){
        var options = _.cloneDeep(OptionDefaults)
        return options.expertise;
    },

    getMoonphaseDefaults(){
        var options = _.cloneDeep(OptionDefaults)
        return options.moonphase;
    },

    getTimedDemonDefaults(){
        var options = _.cloneDeep(OptionDefaults)
        return options.timeddemons;
    },

    toExpertiseQueryParams(expertiseList, optionsList) {
        var urlParams = new URLSearchParams();
        Object.keys(expertiseList).forEach(function (v) {
            let slim = Number.parseInt(expertiseList[v].value);
            if (slim !== 0) urlParams.append(expertiseList[v].id, slim)
        })
        Object.keys(optionsList).forEach(function (v) {
            if (v === "level") {
                let slim = Number.parseInt(optionsList[v].value);
                if (slim !== 1) urlParams.append(optionsList[v].queryParam, slim)
            } else {
                let slim = Number.parseInt(optionsList[v].value / 1000);
                if (slim !== 0) urlParams.append(optionsList[v].queryParam, slim)
            }
        })
        return urlParams.toString();
    },
    fromExpertiseQueryParams(url) {
        const expertise = expertiseService.all();
        const selection = [];
        expertise.forEach(e => {
            let obj = {};
            obj.id = e.id,
            obj.name = e.name,
            obj.description = e.description,
            obj.value = 0,
            obj.max = Number.parseInt( e.maxClass.toString() + e.maxRank.toString())
            if (e.singularExpertise.length === 0 && e.name !== "--Unused--"){
                selection.push(obj);
            }
            });

        selection.forEach(function (item) {
            let queryValue = url.get(item.id)
            if (queryValue !== null) {
                let hydrated = Number.parseInt(queryValue);
                item.value = hydrated;
            }
        })

        let od = this.getExpertiseDefaults();
        Object.keys(od).forEach(function (item) {
            let queryValue = url.get(od[item].queryParam)
            if (queryValue !== null) {
                if (od[item].name === "Level") {
                    let hydrated = Number.parseInt(queryValue)
                    od[item].value = hydrated;
                } else {
                    let hydrated = Number.parseInt(queryValue) * 1000
                    od[item].value = hydrated;
                }
            }
        })

        var response = {
            expertise: selection,
            options: od
        }
        return response
    },
}