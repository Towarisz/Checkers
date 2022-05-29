class Tile extends THREE.Mesh {
     static tileGeometry = new THREE.BoxGeometry(10, 2, 10);

     constructor(white, mesh) {
          super(Tile.tileGeometry, mesh);
          this.isWhite = white;
          !white ? this.material.color.setHex(0x000000) : this.material.color.setHex(0xffffff);
          console.log("Created Tile.");
     }
     select() {
          this.material.color.setHex(0xffff00);
     }
     deselect() {
          this.material.color.setHex(0x000000);
     }
}

export default Tile;
