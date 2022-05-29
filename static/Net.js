class Net {
     constructor() {
          this.playerWhiteLoggedIn = false;
          this.playerBlackLoggedIn = false;
          this.intervalid = 0;
     }

     login(onLogin) {
          const login = document.getElementById("login-input").value;

          console.log("login");

          if (login != "") {
               const body = JSON.stringify({ login: login });

               const headers = { "Content-Type": "application/json" };

               fetch("/login", { method: "post", body, headers })
                    .then((response) => response.json())
                    .then((data) => {
                         if (data.isPlayer) {
                              onLogin(login, data.color);
                              window.game.isWhite = data.color == 0;
                              document.getElementById("login-errors").innerHTML = "";
                         } else {
                              switch (data.error) {
                                   case 0:
                                        document.getElementById("login-errors").innerHTML = "two players already in game";
                                        break;
                                   case 1:
                                        document.getElementById("login-errors").innerHTML = "user with that name is already in the game";
                                        break;
                                   default:
                                        document.getElementById("login-errors").innerHTML = "unknown error";
                              }
                         }
                    });
          }

          clearInterval(this.intervalid);
          this.intervalid = setInterval(this.update, 1000);
     }

     update() {
          let body = null;

          if (!window.game.isPlaying) {
               body = JSON.stringify({
                    isPlaying: window.game.isPlaying,
                    isWhite: window.game.isWhite,
               });
          } else {
               body = JSON.stringify({
                    isPlaying: window.game.isPlaying,
                    isWhite: window.game.isWhite,
               });
          }

          const headers = { "Content-Type": "application/json" };

          fetch("/update", { method: "post", body, headers })
               .then((response) => response.json())
               .then((data) => {
                    if (data.state == 5) {
                         window.ui.showEndGameScreen(data.won == window.game.isWhite ? "Won" : "Lost");
                    } else if (data.state == 3) {
                         console.log("Recieved Move:", data);
                         window.game.hasMove = true;
                         window.game.enemyMove(data.move.from, data.move.to);
                    } else if (data.state == 2) {
                    } else if (data.state == 1) {
                         console.log("game start");

                         document.getElementById("display").style.display = "none";
                         window.game.load();
                         window.ui.resetTimer();
                         window.ui.startTimer();
                    } else {
                    }
               });
     }

     move(from, to, taking) {
          const body = JSON.stringify({
               isWhite: window.game.isWhite,
               isTaking: taking,
               from: from,
               to: to,
          });
          window.ui.resetTimer();
          const headers = { "Content-Type": "application/json" };

          fetch("/move", { method: "post", body, headers })
               .then((response) => response.json())
               .then((data) => {});
     }

     reset() {
          const body = JSON.stringify({ reset: "reset" });
          const headers = { "Content-Type": "application/json" };

          document.getElementById("login-errors").innerHTML = "players reset";

          fetch("/reset", { method: "post", body, headers })
               .then((response) => response.json())
               .then((data) => {
                    clearInterval(this.intervalid);
                    console.log("Reset");
               });
     }
}

export default Net;
