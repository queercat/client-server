import express from "express";
import cors from "cors";
import redis from "redis";

const app = express();

/* Middleware */
app.use(cors())

// Create our redis client.
const client = redis.createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

app.get('/', (req, res) => {
    res.send('hi');
});

app.listen(8000);

await client.disconnect();