import mongoose from 'mongoose'
import * as os from "node:os";
import * as process from "node:process";

const _SECOND = 5000

export const countConnect = () => {
    return mongoose.connections.length
}

// check overload
export const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length;
        const memoryUsed = process.memoryUsage().rss

        const maxConnection = numCores * 5

        console.log(`Active connection: ${numConnection}`)
        console.log(`memory usage: ${memoryUsed / 1024 / 1024} Mb`)

        if(numConnection > maxConnection){
            console.log(`Connection overload detected`)
        }
    }, _SECOND)
}