class winScreen extends Phaser.Scene {
    constructor(){
        super("winScreen")
    }
    init(collectibles){
        this.collectibles = isNaN(collectibles) ? 0 : collectibles;
    }
    preload(){
        this.my = {sprite: {}, text: {}};
    }
    create(){
        let my = this.my;
        let win = this.add.bitmapText(660, 350, "rocketSquare", "You Win");
        let retry = this.add.bitmapText(580, 450, "rocketSquare", "Click to retry");
        let highscore = this.add.bitmapText(450, 550,"rocketSquare", "You collected  " + this.collectibles + "/2 items");
    }
    update(){
        let my = this.my;
        this.input.on('pointerdown', (pointer) =>{
            this.scene.start("Platformer");
        }
        )
    }
}