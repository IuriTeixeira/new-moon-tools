import Skills from "@/data/skills.json"
import _ from 'lodash'

const storage = Skills;

export default {

    get(id=0){
        if (id != 0){
            let skill = storage.find(d => d.id == id);
            return skill;
        }
        return null
    },

    getByName(name=''){
        const skill = storage.find((item)=>{
            return item.name.toLowerCase() == name.toLowerCase()
        })

        return skill;
    },

    searchByName(name=''){
        if (name !=''){
            let skills = storage.filter(function (item){
                return item.name != null && item.name.length > 0 && item.name.toLowerCase().includes(name.toLowerCase()) 
            })
            return skills;
        }
        return [];
    }
}