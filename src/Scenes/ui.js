class userInterface extends Phaser.Scene {
    constructor(){
        super("userInterface")
    }
    init(playerHeight){
        this.playerHeight = playerHeight;
    }
    preload(){

    }
    create(){
        this.heightCounter = this.add.text(10, 10, 'Height: 0', { fontSize: '16px', fill: '#fff' }).setScrollFactor(0).setScale(2);
    }
    update(){
        this.heightCounter.setText('Height: ' + this.playerHeight);
    }
}