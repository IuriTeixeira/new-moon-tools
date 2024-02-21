import Skills from "@/data/skills.json"
import _ from 'lodash'

const storage = Skills;

export default {

    get(id=0){
        if (id != 0){
            let skill = storage.find(d => d.ID == id);
            return skill;
        }
        return null
    },

    searchByName(name=''){
        if (name !=''){
            let skills = storage.filter(function (item){
                return item.Name.toLowerCase().includes(name.toLowerCase()) 
            })
            return skills;
        }
        return null;
    }
}