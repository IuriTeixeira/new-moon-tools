import Expertise from "@/data/expertise.json"
import _ from 'lodash'

const storage = Expertise;

export default {

    get(id=0){
        if (id > -1){
            let expertise = storage.find(d => d.id == id);
            return expertise;
        }
        return null
    },

    all(){
        return storage;
    },
}
