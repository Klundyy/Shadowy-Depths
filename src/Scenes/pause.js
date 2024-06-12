class pauseMenu extends Phaser.Scene {
    constructor(){
        super("pauseMenu")
    }
    init(){
        
    }
    preload(){

    }
    create(){
        this.escKey = this.input.keyboard.addKey('ESC');
        let win = this.add.bitmapText(450, 350, "rocketSquare", "Game Paused").setScale(2);
        let retry = this.add.bitmapText(467, 450, "rocketSquare", "Click or ESC to resume");
    }
    update(){
        this.input.on('pointerdown', (pointer) =>{
            this.scene.resume("Platformer");
            this.scene.stop();
        })
        if(Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.resume("Platformer");
            this.scene.stop();
        }
    }
}