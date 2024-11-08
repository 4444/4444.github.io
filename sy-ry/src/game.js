// Constants
const SKY_SCALE_FACTOR = 1.5;
const JUMP_VELOCITY = -250;
const GRAVITY = 300;
const PLAYER_SCALE = 2;
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 35;
const HEART_VELOCITY = 200;
const HEART_SCALE_DECREMENT = 0.01;
const HEART_MAX_SIZE = 3;
const BOX_WIDTH = 50;
const BOX_HEIGHT = 50;
let GODMODE = true;

// Global variables
let platforms;
let player;
let cursors;
let spriteLists = [
    ['sya', 'sya2', 'sya3', 'sya4', 'sya5', 'sya6'], // 0: sya
    ['ry', 'ry2', 'ry3', 'ry4'],     // 1: ry
    ['cibuy']                        // 2: cibuy
];
let currentSpriteListIndex = 0; // Default to sya's sprite list
let currentSpriteIndex = 0;

let checkpoints = [
    { x: 2370, y: 448, isActive:true, sprite:null},
    { x: 5081, y: 592, isActive:true, sprite:null},
    { x: 6518, y: 352, isActive:true, sprite:null},
    { x: 8086, y: 544, isActive:true, sprite:null},
    { x: 9897, y: 592, isActive:true, sprite:null},
    { x: 11371, y: 592, isActive:true, sprite:null},
    { x: 16000, y: 584, isActive:true, sprite:null},
    { x: 18000, y: 584, isActive:true, sprite:null}
]; // Example checkpoint;
let currentCheckpoint = { x: 352, y: 480 }; // Default checkpoint


let collectibles;

let gamePaused = true; // Flag to pause the game
let portal;


let boxes;

// Phaser configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#90b7c6'
};

const game = new Phaser.Game(config);

// Preload assets
function preload() {
    // Create loading text
    const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading... Sabar sayang', { fontSize: '32px', fill: '#fff' });
    loadingText.setOrigin(0.5);

    // Progress bar
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    const barWidth = 320;
    const barHeight = 50;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(this.scale.width / 2 - barWidth / 2, this.scale.height / 2 + 30, barWidth, barHeight);

    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        const innerBarWidth = barWidth - 20;
        const innerBarHeight = barHeight - 20;
        progressBar.fillRect(this.scale.width / 2 - innerBarWidth / 2, this.scale.height / 2 + 40, innerBarWidth * value, innerBarHeight);
    });

    this.load.on('complete', () => {
        loadingText.destroy();
        progressBar.destroy();
        progressBox.destroy();
    });

    this.load.audio('backgroundMusic', 'assets/bersamamu.mp3');
    this.load.audio('backgroundMusic2', 'assets/cantik.mp3');
    this.load.audio('checkpoint_sound', 'assets/checkpoint.wav');
    this.load.audio('jump_sound', 'assets/jump.wav');
    this.load.audio('bounce_sound', 'assets/bounce.mp3');
    this.load.audio('heart_sound', 'assets/heart.wav');
    this.load.audio('death_sound', 'assets/death.wav');
    this.load.audio('powerup_sound', 'assets/powerup.wav');
    this.load.audio('toggle_sound', 'assets/toggle.wav');
    this.load.image('box', 'assets/box.png');
    this.load.image('finish', 'assets/finish.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.image('sky', 'assets/summer.jpg');
    this.load.image('clouds', 'assets/clouds.jpg');
    this.load.image('island', 'assets/romantic.jpg');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('platform2', 'assets/platform2.png');
    this.load.image('platform3', 'assets/platform3.png');
    this.load.image('trampolin', 'assets/trampolin.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.image('checkpoint', 'assets/checkpoint.png');
    this.load.image('checkpoint_off', 'assets/checkpoint_off.png');
    this.load.spritesheet('sya', 'assets/sya_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('sya2', 'assets/sya2_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('sya3', 'assets/sya3_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('sya4', 'assets/sya4_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('sya5', 'assets/sya7_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('sya6', 'assets/sya8_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('ry', 'assets/ry_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('ry2', 'assets/ry2_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('ry3', 'assets/ry3_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('ry4', 'assets/ry4_sprites.png', { frameWidth: 35, frameHeight: 35, margin: 1, spacing: 1 });
    this.load.spritesheet('cibuy', 'assets/cibuy_sprites.png', { frameWidth: 35, frameHeight: 35 });
}

let trampoline;
let trampoline2;

// Create game objects
function create() {
    this.music = this.sound.add('backgroundMusic', { loop: true });
    this.music.play();
    this.checkpointSound = this.sound.add('checkpoint_sound');
    this.jumpSound = this.sound.add('jump_sound');
    this.bounceSound = this.sound.add('bounce_sound');
    this.heartSound = this.sound.add('heart_sound');
    this.deathSound = this.sound.add('death_sound');
    this.powerupSound = this.sound.add('powerup_sound');
    this.toggleSound = this.sound.add('toggle_sound');

    setupBackground.call(this);
    setupPlayerSprites.call(this, 'sya');
    setupPlayerSprites.call(this, 'sya2');
    setupPlayerSprites.call(this, 'sya3');
    setupPlayerSprites.call(this, 'sya4');
    setupPlayerSprites.call(this, 'sya5');
    setupPlayerSprites.call(this, 'sya6');
    setupPlayerSprites.call(this, 'ry');
    setupPlayerSprites.call(this, 'ry2');
    setupPlayerSprites.call(this, 'ry3');
    setupPlayerSprites.call(this, 'ry4');
    setupCatSprites.call(this, 'cibuy');
    setupPlayer.call(this);
    setupPlatforms.call(this);
    setupInput.call(this);

    const finishImage = this.add.image(21111, 200, 'finish');
    const cibuyyyyyyy = this.add.sprite(21003, 296.5, 'idle_cibuy').setScale(PLAYER_SCALE).setFlipX(true);
    cibuyyyyyyy.anims.play('idle_cibuy', true);

    const ryyyy = this.add.sprite(20930.999999999967, 296.5, 'idle_ry').setScale(PLAYER_SCALE).setFlipX(false);
    ryyyy.anims.play('idle_ry', true);

    boxes = this.physics.add.group({
        defaultKey: 'box',
        maxSize: 10,
        runChildUpdate: true
    });

    boxes.children.iterate(box => {
        box.setCollideWorldBounds(true);
        box.setBounce(0);  // Make sure boxes don't bounce
        box.setImmovable(false); // Ensure the box can be pushed
    });

    checkpoints.forEach(checkpoint => {
        checkpoint.sprite = this.add.sprite(checkpoint.x, checkpoint.y, 'checkpoint_off');
    });
    
    // Add initial boxes
    addBox.call(this, 2750, 450);
    addBox.call(this, 5000, 555);
    
    
    // Enable collision between player and boxes
    this.physics.add.collider(player, boxes);
    this.physics.add.collider(boxes, platforms);

    this.add.text(
        16000,
        400,
        'Level 2',
        { fontSize: '32px', fill: '#fff' }
    );
    // Create the trigger object (e.g., a portal)
    portal = this.physics.add.sprite(11905, 555, 'portal'); // Adjust position and sprite key

    // Set portal to be immovable and invisible (optional)
    portal.setImmovable(true);
    portal.setVisible(true); // Set to false if you want it invisible
    portal.setAlpha(0.5); // Optional: make it semi-transparent
    portal.setOrigin(0.5, 0.5);

    // Create an overlap detector between player and portal
    this.physics.add.overlap(player, portal, transitionToLevel2, null, this);

    // Add the trampoline sprite
    trampoline = this.physics.add.sprite(18187, 550, 'trampolin');

    // Set trampoline to be immovable
    trampoline.setImmovable(false);
    trampoline.setPosition(18187,560);

    // Add collision between player and trampoline
    this.physics.add.overlap(player, trampoline, trampolineBounce, null, this);

    trampoline2 = this.physics.add.sprite(18187, 550, 'trampolin');

    // Set trampoline to be immovable
    trampoline2.setImmovable(false);
    trampoline2.setPosition(18883, 344);

    // Add collision between player and trampoline
    this.physics.add.overlap(player, trampoline2, trampolineBounce, null, this);
}

function trampolineBounce(player, trampoline) {
    // Modify player velocity to simulate a bounce
    // Adjust the velocity based on the trampoline's bounce effect
    player.setVelocityY(-500); // This will make the player bounce up
    this.bounceSound.play();
}

function transitionToLevel2(player, portal) {
    // Optionally, play an animation or sound effect here
    console.log(portal);
    console.log(player);

    this.cameras.main.setBackgroundColor('#000000');

    this.music.stop();

    this.music = this.sound.add('backgroundMusic2', { loop: true });
    this.music.play();

    // Switch to Level 2
    player.setVelocity(0,0);
    player.setPosition(16000,560);
}

let pauseGraphics;
let startButton;
let buttonText;
let buttonWidth = 200;
let buttonHeight = 60;

// Update game state
function update() {
    portal.angle += 1;
    trampoline.setPosition(18187,560);
    const came = this.cameras.main;

    if (player.x < 15000 && player.x > 2233) {
        this.sky1.setTexture('clouds');
        this.sky2.setTexture('clouds');
    }
    else if (player.x < 15000) {
        this.sky1.setTexture('sky');
        this.sky2.setTexture('sky');
    }
    else {
        this.sky1.setTexture('island');
        this.sky2.setTexture('island');
    }

    updateBackground.call(this);

    if (gamePaused) {
        // Create the pause overlay and button if they don't already exist
        if (!pauseGraphics) {
            pauseGraphics = this.add.graphics();
            pauseGraphics.fillStyle(0x000000, 1);
            pauseGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
            
            // Create the start button
            startButton = this.add.rectangle(
                came.width / 2,
                came.height / 2,
                buttonWidth,
                buttonHeight,
                0x4CAF50
            );
            startButton.setStrokeStyle(3, 0x388E3C); // Border color and thickness

            // Create button text
            buttonText = this.add.text(
                came.width / 2,
                came.height / 2,
                'Start Game',
                { fontSize: '24px', fill: '#fff' }
            );
            buttonText.setOrigin(0.5);

            // Make the button interactive
            startButton.setInteractive();
            startButton.on('pointerdown', () => {
                console.log('Button clicked'); // For debugging
                gamePaused = false; // Unpause the game
                pauseGraphics.destroy(); // Clear the pause screen graphics
                startButton.destroy(); // Remove the button
                buttonText.destroy(); // Remove the button text
                pauseGraphics = null;
                startButton = null;
                buttonText = null;
                // Ensure other necessary cleanup happens here
            });

            // Handle hover effect
            startButton.on('pointerover', () => {
                startButton.setFillStyle(0x66BB6A); // Lighter green on hover
            });
            startButton.on('pointerout', () => {
                startButton.setFillStyle(0x4CAF50); // Original green color
            });
        } else {
            // Update positions if already created
            pauseGraphics.clear();
            pauseGraphics.fillStyle(0x000000, 1);
            pauseGraphics.fillRect(came.scrollX, came.scrollY, this.scale.width, this.scale.height);

            if (startButton) {
                startButton.setPosition(came.scrollX + came.width / 2, came.scrollY + came.height / 2);
            }

            if (buttonText) {
                buttonText.setPosition(came.scrollX + came.width / 2, came.scrollY + came.height / 2);
            }
        }
        return;
    }

    updatePlayer.call(this);
    updateHearts.call(this);

    // Check for player reaching a checkpoint
    checkpoints.forEach(checkpoint => {
        if (checkpoint.isActive && Phaser.Geom.Rectangle.ContainsPoint(checkpoint.sprite.getBounds(), player)) {
            // Play sound
            this.checkpointSound.play();

            // Update current checkpoint
            currentCheckpoint = { x: checkpoint.x, y: checkpoint.y };
            checkpoint.sprite.setTexture('checkpoint');

            // Disable this checkpoint now.
            checkpoint.isActive = false;
        }
    });

    // Handle box pushing
    boxes.children.iterate(box => {
        if (box.body.velocity.y <= 0) {
            box.body.setGravityY(GRAVITY);
        }

        if (box.y > 1500 || (box.originalX == 2750 && box.x > 2960) ) { // If the box falls off the map or failsave if it gets stuck in the wall
            box.setVelocity(0, 0);
            box.setPosition(box.originalX, box.originalY);
            this.toggleSound.play();
        }

        if (box.originalX == 2750) {
            if (box.x > 2945) {
                box.setVelocityX(0);
                box.setPosition(2945, box.y);
            }
        }

        // Check if the player is touching the box from the sides
        const playerTouchingBoxSide = (player.body.touching.right && box.body.touching.left) || (player.body.touching.left && box.body.touching.right);
        const playerTouchingBoxTopOrBottom = player.body.touching.down || player.body.touching.up;

        if (playerTouchingBoxSide && !playerTouchingBoxTopOrBottom) {
            if (player.body.touching.right && box.body.touching.left) {
                box.setVelocityX(50);
            } else if (player.body.touching.left && box.body.touching.right) {
                box.setVelocityX(-50);
            }
        } else {
            box.setVelocityX(0);
        }
    });

    // Get the camera's viewport bounds
    const camera = this.cameras.main;
    const viewport = {
        left: camera.scrollX,
        right: camera.scrollX + camera.width,
        top: camera.scrollY,
        bottom: camera.scrollY + camera.height
    };

    // Check if player is out of bounds
    if (player.y > 1500) {

        // Reset player velocity
        player.body.setVelocity(0,0);

        // Reset player position to the last checkpoint
        player.setPosition(currentCheckpoint.x, currentCheckpoint.y - 16);

        this.deathSound.play();
    }
}

function addBox(x, y) {
    let box = this.physics.add.sprite(x, y, 'box').setScale(1);
    box.originalX = x;
    box.originalY = y;
    box.setVelocity(0,0);
    box.setDisplaySize(BOX_WIDTH, BOX_HEIGHT);
    box.body.setGravityY(GRAVITY);
    boxes.add(box);
}

// Setup background
function setupBackground() {
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    this.sky1 = this.add.image(0, 0, 'sky').setOrigin(0, 0).setDisplaySize(gameWidth * SKY_SCALE_FACTOR + 1, gameHeight * SKY_SCALE_FACTOR);
    this.sky2 = this.add.image(gameWidth-2, 0, 'sky').setOrigin(0, 0).setDisplaySize(gameWidth * SKY_SCALE_FACTOR + 1, gameHeight * SKY_SCALE_FACTOR);

    this.textures.get('sky').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('sky').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('clouds').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('clouds').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('island').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('island').setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function setupCatSprites(spriteKey) {

    this.anims.create({ 
        key: 'idle_' + spriteKey, 
        frames: [{ key: spriteKey, frame: 0 }, { key: spriteKey, frame: 1 }],
        frameRate: 1, 
        repeat: -1 
    });

    this.anims.create({
        key: 'walk_' + spriteKey,
        frames: [{ key: spriteKey, frame: 0 }, { key: spriteKey, frame: 1 }],
        frameRate: 6, 
        repeat: -1 
    });

    this.anims.create({
        key: 'jump_' + spriteKey,
        frames: [{ key: spriteKey, frame: 0 }, { key: spriteKey, frame: 1 }],
        frameRate: 6, 
        repeat: -1 
    });

    this.textures.get(spriteKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

// Setup player sprites
function setupPlayerSprites(spriteKey) {

    this.anims.create({ 
        key: 'idle_' + spriteKey, 
        frames: Array.from({ length: 8 }, (_, i) => ({ key: spriteKey, frame: i == 7 ? 1 : 0 })),
        frameRate: 6, 
        repeat: -1 
    });

    this.anims.create({
        key: 'walk_' + spriteKey,
        frames: [{ key: spriteKey, frame: 6 }, { key: spriteKey, frame: 5 }, { key: spriteKey, frame: 6 }, { key: spriteKey, frame: 7 }],
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'jump_' + spriteKey,
        frames: [{ key: spriteKey, frame: 8 }],
        frameRate: 1,
        repeat: -1
    });

    this.textures.get(spriteKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

// Setup player
function setupPlayer() {
    player = this.physics.add.sprite(currentCheckpoint.x, currentCheckpoint.y, 'sya').setScale(PLAYER_SCALE);
    player.anims.play('idle_' + spriteLists[currentSpriteListIndex][currentSpriteIndex], true);
    player.body.setGravityY(GRAVITY);

     // Adjust the hitbox size and offset
     player.body.setSize(player.width * 0.5, player.height * 0.8); // Adjust these values as needed
     player.body.setOffset(player.width * 0.25, player.height * 0.15); // Adjust these values as needed

    player.hearts = this.physics.add.group({ defaultKey: 'heart', maxSize: HEART_MAX_SIZE });
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
}

function setupPlatforms() {
    platforms = this.physics.add.staticGroup();

    // Define the revised horizontal level layout
    const levelLayout = [                                 
        "                                                                                                                                XX                                                 XXXXXXXXXXXXXXXXX                   P                                                                                                           XX                                                         G                      GGGGX   XGGGG          GGGGGGG                                                                               X       ",
        "P                                    PPPPP               XXXXXX      X  X  P  XXXXX  PPP                                PPX       PPPPPX                                           XXPPPXPXXXPXXPXXX                   P                                XXXXXXXXXXX                                                                XX                                                        GGGGGGGGGGGGG         GG            GG  GGG G                                                                                                         X           ",   
        "P                         PPPPPP     P   P               XXXXX   PP  XXXX              P                                  P         P   X                                          XPXXXXXPXPXXPXPXX                   P                                XXXXXXXXXXX                                                                XX                                                       GGG           GG     GG                                                                                                      X       ",   
        "P              PPP       P    PP    P   PPPPPPP          XXXX                          PP                 X                 XXX     P    X                                         XPPPXXXXPXXXPXPXX                                                    XXXXXXXXXXX                                                                XX                              X                   GGGGGG               GG  GG                                                                                                      X        ",   
        "PPPPPPPPPPPPPPP   PP  PPPP    PPPPPPP   PPPPPPP   XXXXXXXXXX                           PPPP               X                       XXP     X               PP                       XXXXPXXXPXXPPPPPX                                                    XXXXXXXXXXX                                                                XX                        XX                        GGGGG                  GG                                                                                              X        ",
        "                    P P                                                                 PPPPPPP           X                      P  P      X         XX           XXX              XPPPXXXXPXXPXXXPX                   P                                XXXXXXXXXXX                                                                XX                       X          X               GGGG                                                                                                                  X        ",
        "                     P                                                                   PPPPPP  PPPPPPP  XXX  PPP                  P       XPPPPPP              P  PPPP  P     P                      PPPP          PPPP        XXXXXXXXPPPPPPPPPPPPPPPXXXXXXXXXXX                                                                XXGGGGGGGGG       XGGGGG                  GGGGGGGGGGGGGG                                                                                                                                        ", 
        "                                                                                          PPPPP                    X  X  X  XXXXXXXXP                               PPPP     XX  P                    P    X                 P                          XXXXXXXXXXX                                                                XX            XX                                                                                                                                                                          ", 
        "                                                                                           PPP                                                                      PPPP          PPPPPPPPPPPPPPPPPPPP       PP    X     X                              XXXXXXXXXXX                                                                XX                                                                                                                                                                               ",
    ];

    const PLATFORM_WIDTH = 48; // Width of each platform block
    const PLATFORM_HEIGHT = 48; // Height of each platform block
    const SCALE = 1; // No scaling in this case
    const START_X = 256; // Starting X coordinate
    const START_Y = 256+96; // Starting Y coordinate

    for (let y = 0; y < levelLayout.length; y++) {
        for (let x = 0; x < levelLayout[y].length; x++) {
            if (levelLayout[y][x] === 'P') {
                // Add a platform block to the group with starting coordinates from START_X and START_Y
                platforms.create(START_X + (x * PLATFORM_WIDTH), START_Y + (y * PLATFORM_HEIGHT), 'platform').setScale(SCALE).refreshBody();
            }
            else if (levelLayout[y][x] === 'X') {
                platforms.create(START_X + (x * PLATFORM_WIDTH), START_Y + (y * PLATFORM_HEIGHT), 'platform2').setScale(SCALE).refreshBody();
            }
            else if (levelLayout[y][x] === 'G') {
                platforms.create(START_X + (x * PLATFORM_WIDTH), START_Y + (y * PLATFORM_HEIGHT), 'platform3').setScale(SCALE).refreshBody();
            }
        }
    }

    // Adjust collision for player and platforms
    this.physics.add.collider(player, platforms);
}





// Setup input
function setupInput() {
    cursors = this.input.keyboard.createCursorKeys();
    
    this.input.keyboard.on('keyup-C', () => {
        toggleSprite();
        this.powerupSound.play();
    });

    let keys = this.input.keyboard.addKeys('F9, F2, F1, F4');

    this.input.keyboard.on('keydown', (event) => {
        if (keys.F2.isDown) {
            currentSpriteListIndex = 1; // Switch to ry's sprite list
            currentSpriteIndex = 0; // Reset the sprite index
        }
        else if (keys.F1.isDown) {
            currentSpriteListIndex = 2; // Switch to cibuy's sprite list
            currentSpriteIndex = 0; // Reset the sprite index
        }
        else if (keys.F4.isDown) {
            currentSpriteListIndex = 0; // Switch to sya's sprite list
            currentSpriteIndex = 0; // Reset the sprite index
        }
    });
}

// Update background
function updateBackground() {
    const camX = this.cameras.main.scrollX;
    const gameWidth = this.sys.game.config.width;

    if (camX > this.sky1.x + gameWidth * SKY_SCALE_FACTOR) {
        this.sky1.x = this.sky2.x + gameWidth * SKY_SCALE_FACTOR;
    } else if (camX < this.sky1.x && camX < this.sky2.x - gameWidth) {
        this.sky2.x = this.sky1.x - gameWidth * SKY_SCALE_FACTOR;
    }

    if (this.sky1.x > this.sky2.x) {
        [this.sky1, this.sky2] = [this.sky2, this.sky1];
    }
}

// Update player
function updatePlayer() {
    player.body.setVelocityX(0);
    let moved = false;

    if (GODMODE) {
        //transitionToLevel2.call(this, player, null);
        // GODMODE = false;
        // player.x = 21003;
        // player.y = 0;
        // return;
        player.setVelocityY(0);
        let godModeSpeed = 3000;
        if (cursors.left.isDown) {
            player.x -= godModeSpeed * game.loop.delta / 1000;
        } else if (cursors.right.isDown) {
            player.x += godModeSpeed * game.loop.delta / 1000;
        }
        if (cursors.up.isDown) {
            player.y -= godModeSpeed * game.loop.delta / 1000;
        } else if (cursors.down.isDown) {
            player.y += godModeSpeed * game.loop.delta / 1000;
        }
        return;   
    }

    if (cursors.left.isDown && !cursors.right.isDown) {
        player.body.setVelocityX(-160);
        player.setFlipX(true);
        moved = true;
    } else if (cursors.right.isDown && !cursors.left.isDown) {
        player.body.setVelocityX(160);
        player.setFlipX(false);
        moved = true;
    }

    let isTouchingGround = player.body.touching.down;
    let isTouchingBox = player.body.touching.down && this.physics.overlap(player, boxes);

    if (cursors.space.isDown && player.body.touching.down && !player.jumpKeyDown) {
        player.body.setVelocityY(JUMP_VELOCITY);
        player.jumpKeyDown = true;
        moved = true;
        this.jumpSound.play();
    }

    // Make sure the Y velocity is capped
    if (player.body.velocity.y > 400) {
        player.body.velocity.y = 400;
    }

    if (cursors.space.isUp) {
        player.jumpKeyDown = false;
    }

    if (!player.body.touching.down) {
        player.anims.play('jump_' + spriteLists[currentSpriteListIndex][currentSpriteIndex], true);
        moved = true;
    } else if (moved) {
        player.anims.play('walk_' + spriteLists[currentSpriteListIndex][currentSpriteIndex], true);
    } else {
        player.anims.play('idle_' + spriteLists[currentSpriteListIndex][currentSpriteIndex], true);
    }
    // Update hearts
    player.hearts.children.each((heart) => {
        if (heart.active) {
            heart.scale -= HEART_SCALE_DECREMENT;
            if (heart.scale <= 0) {
                heart.setActive(false).setVisible(false).setScale(1).setVelocityX(0).setPosition(player.x, player.y);
            }
        } else {
            heart.setPosition(player.x, player.y);
        }
    });
}

// Update hearts
function updateHearts() {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X))) {
        let heart = player.hearts.get(player.x, player.y);
        if (heart) {
            heart.setActive(true).setVisible(true).setScale(1);
            heart.setVelocityY(0);
            heart.setGravityY(0);
            heart.setVelocityX(player.flipX ? -HEART_VELOCITY : HEART_VELOCITY);
            this.heartSound.play();
        }
    }

    player.hearts.children.each((heart) => {
        if (heart.active) {
            heart.scale -= HEART_SCALE_DECREMENT;
            if (heart.scale <= 0) {
                heart.setActive(false).setVisible(false).setScale(1).setVelocityX(0).setPosition(player.x, player.y);
                heart.setVelocityY(0);
                heart.setGravityY(0);
            }
        }
    }, this);
}

function toggleSprite() {
    currentSpriteIndex = (currentSpriteIndex + 1) % spriteLists[currentSpriteListIndex].length;
}