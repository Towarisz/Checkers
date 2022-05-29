const express = require("express");
const { is } = require("express/lib/request");
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const PORT = 3000;
app.use(express.static("static"));
app.use(cors());
app.use(express.json());

app.use(
     express.urlencoded({
          extended: true,
     })
);

let players = [],
     playing = -1,
     time = 0,
     blackPawns = 8,
     whitePawns = 8,
     interval;

// Player state
// 0 - awaiting players
// 1 - ready to play
// 2 - playing
// 3 - awaiting move confirm
// 5 - player won/lost

app.listen(PORT, function () {
     console.log("start serwera na porcie " + PORT);
});

app.route("/", function (req, res) {
     res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.post("/login", function (req, res) {
     let color = players.length;
     let name = req.body.login;

     if (players.map((p) => p.name).includes(name)) {
          res.send(JSON.stringify({ isPlayer: false, error: 1 }));
          clearInterval(interval);
          time = 0;
     } else if (color < 2) {
          players.push({ name: name, color: color, state: 0, move: null });

          res.setHeader("content-type", "application/json");
          res.send(JSON.stringify({ isPlayer: true, color: color }));

          if (color == 1) {
               players.forEach((p) => (p.state = 1));
               playing = 0;
               interval = setInterval(() => {
                    time++;
               }, 1000);
          }
     } else {
          res.setHeader("content-type", "application/json");
          res.send(JSON.stringify({ isPlayer: false, error: 0 }));
     }
});

app.post("/reset", function (req, res) {
     players = [];
     playing = -1;
     clearInterval(interval);
     time = 0;
     res.setHeader("content-type", "application/json");
     res.send(JSON.stringify({}));
});

app.post("/update", function (req, res) {
     let p = players[req.body.isWhite ? 0 : 1];
     if (time >= 30) {
          clearInterval(interval);
          res.setHeader("content-type", "application/json");
          p.state = 5;
          res.send(
               JSON.stringify({
                    state: 5,
                    won: playing,
               })
          );
     } else if (blackPawns <= 0 || whitePawns <= 0) {
          res.setHeader("content-type", "application/json");
          p.state = 5;
          clearInterval(interval);
          res.send(
               JSON.stringify({
                    state: 5,
                    won: !playing,
               })
          );
     } else if (p.state == 3) {
          res.setHeader("content-type", "application/json");

          res.send(
               JSON.stringify({
                    state: 3,
                    move: p.move,
                    hasMove: playing == (!req.body.isWhite ? 0 : 1),
               })
          );

          p.state = 2;
     } else if (p.state == 2) {
          res.setHeader("content-type", "application/json");
          res.send(
               JSON.stringify({
                    state: 2,
               })
          );
     } else if (p.state == 1) {
          p.state = 2;
          res.setHeader("content-type", "application/json");
          res.send(
               JSON.stringify({
                    state: 1,
               })
          );
     } else {
          time = 0;
          res.setHeader("content-type", "application/json");
          res.send(
               JSON.stringify({
                    state: 0,
               })
          );
     }
});

app.post("/move", function (req, res) {
     time = 0;
     let e = players[!req.body.isWhite ? 0 : 1];
     e.state = 3;
     e.move = req.body;
     if (req.body.isTaking) {
          req.body.isWhite ? blackPawns-- : whitePawns--;
     }
     playing = req.body.isWhite ? (req.body.isTaking ? 0 : 1) : req.body.isTaking ? 1 : 0;
     res.setHeader("content-type", "application/json");
     res.send(JSON.stringify({}));
});
