import Demons from "@/data/demons.json"
import _ from 'lodash'

const storage = Demons;

export default {

    get(id=0){
        if (id != 0){
            let demon = storage.find(d => d.id == id);
            return demon;
        }
        return null
    },

    searchByName(name=''){
        if (name !=''){
            let demons = storage.filter(function (item){
                return item.name.toLowerCase().includes(name.toLowerCase())
            })
            
            return demons;
        }
        return [];
    }
}