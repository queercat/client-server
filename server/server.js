import express from "express";
import cors from "cors";

const app = express();

app.use(cors())

app.get('/', (req, res) => {
    res.send('<h1>hi</h1>');
});

app.listen(8000);