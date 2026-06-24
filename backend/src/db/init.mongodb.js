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

        // MONGOOSE_URL: standalone MongoDB — no Replica Set required (auth/user routes)
        // Fallback to DATABASE_URL for backward compatibility
        const connectString = process.env.MONGOOSE_URL || process.env.DATABASE_URL;

        if (!connectString) {
            console.error('[Mongoose] No database URL found. Set MONGOOSE_URL in .env');
            return;
        }

        // Strip replicaSet param — Mongoose works with standalone MongoDB
        let standaloneUrl = connectString.replace(/[?&]replicaSet=[^&]*/g, '').replace(/\?$/, '');

        // Ensure directConnection=true is present for local development to bypass replica set discovery issues
        if ((standaloneUrl.includes('localhost') || standaloneUrl.includes('127.0.0.1')) && !standaloneUrl.includes('directConnection=true')) {
            const separator = standaloneUrl.includes('?') ? '&' : '?';
            standaloneUrl += `${separator}directConnection=true`;
        }

        console.log("[Mongoose] Connecting to:", standaloneUrl);

        mongoose.connect(standaloneUrl, {
            maxPoolSize: 50
        })
            .then(() => console.log("[Mongoose] Connect success to MongoDB:", countConnect()))
            .catch((err) => console.error("[Mongoose] Error connecting to MongoDB:", err));
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