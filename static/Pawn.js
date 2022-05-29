class Pawn extends THREE.Mesh {
     static pawnGeometry = new THREE.CylinderGeometry(5, 5, 2, 24);

     constructor(white, creator) {
          let pawnWhite = new THREE.MeshBasicMaterial({
               color: 0x444444,
               side: THREE.DoubleSide,
               map: new THREE.TextureLoader().load("textures/texture.jpeg"),
               opacity: 1,
          });

          let pawnBlack = new THREE.MeshBasicMaterial({
               color: 0xff0000,
               side: THREE.DoubleSide,
               map: new THREE.TextureLoader().load("textures/texture.jpeg"),
               opacity: 1,
          });

          super(Pawn.pawnGeometry, white ? pawnWhite : pawnBlack);
          this.isWhite = white;
          this.isPromoted = false;
          this.game = creator;
          console.log("Created Pawn.");
     }

     select() {
          this.material.color.setHex(0xffff00);

          new TWEEN.Tween(this.position)
               .to(
                    {
                         x: this.position.x,
                         y: 5,
                         z: this.position.z,
                    },
                    400
               )
               .repeat()
               .easing(TWEEN.Easing.Cubic.Out)
               .onUpdate(() => {})
               .onComplete(() => {
                    this.game.isMoving = false;
               })
               .start();
     }

     deselect() {
          this.material.color.setHex(this.isWhite ? 0xaaaaaa : 0xff0000);

          new TWEEN.Tween(this.position)
               .to(
                    {
                         x: this.position.x,
                         y: 2,
                         z: this.position.z,
                    },
                    400
               )
               .repeat()
               .easing(TWEEN.Easing.Cubic.Out)
               .onUpdate(() => {})
               .onComplete(() => {
                    this.game.isMoving = false;
               })
               .start();
     }

     moveTo(pos, taking) {
          new TWEEN.Tween(this.position)
               .to(
                    {
                         x: pos.x,
                         z: pos.z,
                    },
                    400
               )
               .repeat()
               .easing(TWEEN.Easing.Cubic.Out)
               .onUpdate(() => {})
               .onComplete(() => {
                    window.game.isMoving = false;
                    if (!taking) {
                         this.deselect();
                    }
               })
               .start();
     }

     fullMove(pos, taking) {
          new TWEEN.Tween(this.position)
               .to(
                    {
                         x: this.position.x,
                         y: 5,
                         z: this.position.z,
                    },
                    400
               )
               .repeat()
               .easing(TWEEN.Easing.Cubic.Out)
               .onUpdate(() => {})
               .onComplete(() => this.moveTo(pos, taking))
               .start();
     }
}

export default Pawn;
