import Tile from "./Tile.js";
import Pawn from "./Pawn.js";

class Game {
     constructor() {
          this.selectedPawn = null;
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
          this.renderer = new THREE.WebGLRenderer();
          this.renderer.setClearColor(0x29293d);
          this.renderer.setSize(window.innerWidth, window.innerHeight);

          this.raycaster = new THREE.Raycaster();
          this.mouseVector = new THREE.Vector2();

          this.camera.position.set(100, 100, 0);
          this.camera.lookAt(this.scene.position);

          this.hasMove = false;
          this.isMoving = false;
          this.isTaking = false;
          this.isWhite = true;
          this.isPlaying = false;

          document.getElementById("root").append(this.renderer.domElement);

          this.render();
     }

     load() {
          this.checkerboardTemplate = [];
          this.checkerboardObj = [];
          for (let r = 0; r < 8; r++) {
               let row = [];
               for (let c = 0; c < 8; c++) {
                    row.push((c + r) % 2);
                    const material = new THREE.MeshBasicMaterial({
                         map: new THREE.TextureLoader().load("textures/texture.jpeg"),
                         color: 0xffffff,
                         side: THREE.DoubleSide,
                         opacity: 1,
                    });

                    let tile = new Tile((c + r) % 2 != 1, material);
                    let pos = Game.GetPosition(r, c);
                    tile.position.set(pos.x, 0, pos.z);
                    this.scene.add(tile);
                    this.checkerboardObj.push(tile);
               }
               this.checkerboardTemplate.push(row);
          }

          this.pawnsTable = [];
          this.pawnsObjTable = [];
          for (let r = 0; r < 8; r++) {
               let row = [];
               for (let c = 0; c < 8; c++) {
                    if ((r < 2 || r > 5) && (c + r) % 2 == 1) {
                         row.push(r > 4 ? 1 : 2);

                         let pawn = new Pawn(r > 4, this);

                         this.pawnsObjTable.push(pawn);
                         let pos = Game.GetPosition(r, c);

                         pawn.position.set(pos.x, 2, pos.z);
                         this.scene.add(pawn);
                    } else row.push(0);
               }
               this.pawnsTable.push(row);
          }

          this.hasMove = true;
          if (!this.isWhite) {
               this.camera.position.set(-100, 100, 0);
               this.camera.lookAt(this.scene.position);
               this.hasMove = false;
          }

          window.ui.updateTable();
     }

     render = () => {
          requestAnimationFrame(this.render);
          this.renderer.render(this.scene, this.camera);
          TWEEN.update();
     };

     resize() {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
     }

     getLegalMoves(from) {
          let possibleMoves = [],
               proto = [];
          proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z - 1 });
          proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z + 1 });
          proto.push({ x: from.x + (this.isWhite ? -2 : 2), z: from.z - 2 });
          proto.push({ x: from.x + (this.isWhite ? -2 : 2), z: from.z + 2 });

          proto.forEach((pos) => {
               if (pos.x >= 0 && pos.x < 8 && pos.z >= 0 && pos.z < 8) {
                    if (this.pawnsTable[pos.x][pos.z] == 0 && Math.abs(pos.x - from.x) == 1 && Math.abs(pos.z - from.z) == 1) {
                         possibleMoves.push({ x: pos.x, z: pos.z, isTaking: [] });
                    } else if (this.isWhite && this.pawnsTable[pos.x][pos.z] == 0 && this.pawnsTable[(pos.x + from.x) / 2][(pos.z + from.z) / 2] == 2 && Math.abs(pos.x - from.x) == 2 && Math.abs(pos.z - from.z) == 2) {
                         possibleMoves.push({ x: pos.x, z: pos.z, isTaking: [(pos.x + from.x) / 2, (pos.z + from.z) / 2] });
                    } else if (!this.isWhite && this.pawnsTable[pos.x][pos.z] == 0 && this.pawnsTable[(pos.x + from.x) / 2][(pos.z + from.z) / 2] == 1 && Math.abs(pos.x - from.x) == 2 && Math.abs(pos.z - from.z) == 2) {
                         possibleMoves.push({ x: pos.x, z: pos.z, isTaking: [(pos.x + from.x) / 2, (pos.z + from.z) / 2] });
                    }
               }
          });
          return possibleMoves;
     }

     raycast(e) {
          this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

          this.raycaster.setFromCamera(this.mouseVector, this.camera);

          const intersects = this.raycaster.intersectObjects(this.scene.children);

          if (intersects.length == 0 && this.selectedPawn != null && !this.isMoving && this.hasMove) {
               this.isMoving = true;
               this.selectedPawn.deselect();
               this.selectedPawn = null;
          }

          if (intersects.length > 0 && !this.isMoving && this.hasMove) {
               const obj = intersects[0].object;

               if (obj instanceof Pawn && obj != this.selectedPawn && obj.isWhite == this.isWhite) {
                    if (this.selectedPawn != null) {
                         this.isMoving = true;
                         this.getLegalMoves(Game.FindOnGrid(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)).forEach((el) => {
                              let a = Game.GetPosition(el.x, el.z);

                              let selectedTile = this.checkerboardObj.find((p) => {
                                   return p.position.x == a.x && p.position.z == a.z;
                              });

                              selectedTile.deselect();
                         });
                         this.selectedPawn.deselect();
                    }
                    this.selectedPawn = obj;
                    this.isMoving = true;
                    obj.select();
                    this.getLegalMoves(Game.FindOnGrid(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)).forEach((el) => {
                         let a = Game.GetPosition(el.x, el.z);

                         let selectedTile = this.checkerboardObj.find((p) => {
                              return p.position.x == a.x && p.position.z == a.z;
                         });
                         selectedTile.select();
                    });
               } else if (this.selectedPawn != null && obj instanceof Tile && !obj.isWhite) {
                    let from = Game.FindOnGrid(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite);
                    let to = Game.FindOnGrid(obj.position.x, obj.position.z, this.isWhite);
                    if (this.getLegalMoves(from).filter((d) => d.x == to.x && d.z == to.z).length > 0) {
                         this.isMoving = true;
                         this.hasMove = false;

                         this.getLegalMoves(Game.FindOnGrid(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)).forEach((el) => {
                              let a = Game.GetPosition(el.x, el.z);

                              let selectedTile = this.checkerboardObj.find((p) => {
                                   return p.position.x == a.x && p.position.z == a.z;
                              });

                              selectedTile.deselect();
                         });

                         this.pawnsTable[from.x][from.z] = 0;
                         this.pawnsTable[to.x][to.z] = this.isWhite ? 1 : 2;

                         this.selectedPawn.moveTo(obj.position, false);

                         if (Math.abs(to.x - from.x) == 2 && Math.abs(to.z - from.z) == 2) {
                              this.pawnsTable[(to.x + from.x) / 2][(to.z + from.z) / 2] = 0;
                              let a = Game.GetPosition((to.x + from.x) / 2, (to.z + from.z) / 2);
                              this.scene.remove(this.pawnsObjTable.find((p) => p.position.x == a.x && p.position.z == a.z));
                         }

                         window.ui.updateTable();
                         window.net.move(from, to, Math.abs(to.x - from.x) == 2 && Math.abs(to.z - from.z) == 2 ? 1 : 0);
                         this.selectedPawn = null;
                    }
               } else {
               }
          }
     }

     enemyMove(from, to) {
          window.ui.resetTimer();
          this.isMoving = true;

          let posPawn = Game.GetPosition(from.x, from.z);
          let posDest = Game.GetPosition(to.x, to.z);
          this.pawnsTable[from.x][from.z] = 0;
          this.pawnsTable[to.x][to.z] = !this.isWhite ? 1 : 2;

          let pawn = this.pawnsObjTable.find((p) => p.position.x == posPawn.x && p.position.z == posPawn.z);

          window.ui.updateTable();
          pawn.fullMove(posDest, false);

          if (Math.abs(to.x - from.x) == 2 && Math.abs(to.z - from.z) == 2) {
               this.pawnsTable[(to.x + from.x) / 2][(to.z + from.z) / 2] = 0;
               let a = Game.GetPosition((to.x + from.x) / 2, (to.z + from.z) / 2);
               this.scene.remove(this.pawnsObjTable.find((p) => p.position.x == a.x && p.position.z == a.z));
          }
     }

     static FindOnGrid(x, z) {
          return {
               x: (35 + x) / 10,
               z: (35 - z) / 10,
          };
     }

     static GetPosition(x, z) {
          return {
               x: (x - 3.5) * 10,
               z: (3.5 - z) * 10,
          };
     }

     sameSign(num1, num2) {
          return (num1 >= 0 && num2 >= 0) || (num1 < 0 && num2 < 0);
     }
}

export default Game;
