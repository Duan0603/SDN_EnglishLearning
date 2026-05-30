import 'dotenv/config'
import {app} from "./src/app.js"

const PORT = process.env.PORT || 3017

const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

//tat server

process.on("SIGINT", () => {
    server.close(() => {
        console.log("Exit server successfully")
        process.exit(0)
    });
});

process.on("SIGUSR2", () => {
    server.close(() => {
        console.log(`nodemon restart server...`);
        process.kill(process.pid, "SIGUSR2");
    });
});