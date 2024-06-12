class userInterface extends Phaser.Scene {
    constructor(){
        super("userInterface")
    }
    init(playerHeight){
        this.playerHeight = playerHeight;
    }
    preload(){

    }
    create() {
        // Create the height counter text
        this.heightCounter = this.add.text(10, 10, 'Height: 0', { fontSize: '16px', fill: '#fff' }).setScale(2);

        // Listen for the height counter update event
        this.scene.get('Platformer').events.on('updateHeightCounter', this.updateHeightCounter, this);
    }

    updateHeightCounter(playerHeight) {
        // Update the height counter text
        this.heightCounter.setText('Height: ' + playerHeight);
    }
}