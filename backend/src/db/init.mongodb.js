import mongoose from "mongoose";
import {countConnect} from "../helper/checkConnect.js";

class Database {
    constructor() {
        this.connect()
    }

    connect(type = 'mongodb') {
        if(1 === 1){
            mongoose.set("debug", true);
            mongoose.set("debug", {color: true})
        }

        // Read env var here (after dotenv has loaded)
        const connectString = process.env.DATABASE_URL;

        mongoose.connect(connectString, {
            maxPoolSize: 50
        })
            .then(() => console.log("Connect success to MongoDB: ", countConnect()))
            .catch((err) => console.error("Error while connect to MongoDB: ", err));
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
export default instanceMongodb