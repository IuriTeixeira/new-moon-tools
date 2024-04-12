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
            return item.name.toLowerCase() == name.toLowerCase() && (
                item.family === "Technique" || 
                item.family === "Arcane Art"|| 
                item.family === "Special Skill"
            )
        })

        return skill;
    },

    all(){
        return storage;
    },

    searchByName(name=''){
        if (name !=''){
            let skills = storage.filter(function (item){
                return item.name != null && item.name.length > 0 && item.name.toLowerCase().includes(name.toLowerCase()) && (
                    item.family === "Technique" || 
                    item.family === "Arcane Art"|| 
                    item.family === "Special Skill"
                )
            })
            return skills;
        }
        return [];
    }
}
