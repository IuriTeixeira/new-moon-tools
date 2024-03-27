import Demons from "@/data/demons.json"
import _ from 'lodash'

const storage = Demons;

import skillService from "@/services/skillService.js"



export default {

    get(id=0){
        if (id != 0){
            let demon = storage.find(d => d.id == id);
            return demon;
        }
        return null
    },

    searchByName(name='', obtainableOnly=true){
        if (name !=''){
            let demons = storage.filter(function (item){
                return item.name != null && item.name.toLowerCase().includes(name.toLowerCase())
            })

            if (obtainableOnly) {
                demons = demons.filter(function (item){
                    return item.acquisition.contract || item.acquisition.fusion || item.acquisition.specialFusion || item.acquisition.itemReward || item.acquisition.eventReward
                })
            }
            
            return demons;
        }
        return [];
    },

    searchBySkill(skillId='', obtainableOnly=true){
        if (skillId !=''){
            let demons = [];
            for (const demon of storage){
                if (demon.skills.includes(skillId) || demon.acquiredSkills.some((item) => { return item.id === skillId})){
                    demons.push(demon);
                }
            }

            if (obtainableOnly) {
                demons = demons.filter(function (item){
                    return item.acquisition.contract || item.acquisition.fusion || item.acquisition.specialFusion || item.acquisition.itemReward || item.acquisition.eventReward
                })
            }

            return demons;
        }
        return [];
    }
}