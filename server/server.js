import express from "express";
import cors from "cors";
import redis from "redis";
import crypto from "crypto";
import cookieParser from "cookie-parser";

import * as utils from "./server-utils.js";

const app = express();
const port = process.env.SERVER_PORT ?? 8080; 

/**
 * @description this creates a database connection when given redis information and returns the context.
 * @param {string} hostname 
 * @param {number} port 
 * @returns a redis database context to perform actions on and modify.
 */
function createDatabaseContext(hostname, port = 6379) {
    try {
        const configObject = {
            host: hostname,
            port: port,
            socket: {
                host: hostname,
                port: port
            }
        }

        const context = redis.createClient(configObject);

        console.log(`Created context for ${configObject.host} redis instance.`);
        console.log(configObject);

        return context;  
    } catch (e) {
        console.error("Failed creating database context!");
        console.error(e);
        process.abort();
    }
}

/* Middleware */
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET ?? "cookie"));

const playerSessionContext = createDatabaseContext(process.env.REDIS_SESSION_HOSTNAME ?? "localhost", process.env.REDIS_SESSION_PORT ?? 6379);
const playerDataContext = createDatabaseContext(process.env.REDIS_DYNAMIC_DATA_HOSTNAME ?? "localhost", process.env.REDIS_DYNAMIC_DATA_PORT ?? 6380);

playerSessionContext.on('error', err => console.log('Redis error', err));

/**
 * @desc this route handles querying for all current player positions.
 */
app.get('/api/getPlayers', async (req, res) => {
    const result = await utils.getAllPlayerData(playerDataContext);
    res.send(result);
});

/**
 * @description Whenever a new user joins we want to create a new player for the session and generate some starter information for them.
 */
app.get('/api/createPlayer', async (req, res) => {
    /* We do not want to create new users if they are already in the game */
    if (req.cookies['sessionID'] !== undefined) {
        res.status(400);
        res.send('You are already in the game silly!');
        return;
    }
    
    let sessionID = crypto.randomUUID();
    let value = await playerSessionContext.get(sessionID);

    while (value !== null) {
        sessionID = crypto.randomUUID; 
        value = await playerSessionContext.get(value);
    }

    const randomColor = () => {
        return Math.round(Math.random() * 255);
    }

    const [r, g, b] = [randomColor(), randomColor(), randomColor()];

    const sessionInformation = {
        color: `rgb(${r}, ${g}, ${b})`,
    };

    // let our session live for 1 hour.
    res.cookie('sessionID', sessionID, { maxAge: 1000 * 60 * 60, httpOnly: true });

    // put the session into the session information database.
    await utils.createSession(playerSessionContext, sessionInformation, sessionID);
    // create another new session into the dynamic data database.
    await utils.createSession(playerDataContext, {x: 0, y: 0}, sessionID);

    res.send(JSON.stringify(sessionInformation));
});

app.get('/', (req, res) => {
    res.status(403).send('<h1><b>403 Not allowed</b></h1><br>Sorry :(');
});

/**
 * @desc Connect to our databases and then listen for user connections!
 */
Promise.all([playerSessionContext.connect(), playerDataContext.connect()]).then(() => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
});

// playerSessionContext.connect().then(async () => {
//     await playerSessionContext.set('players', '');
// });