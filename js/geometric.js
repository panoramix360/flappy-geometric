window.onload = function() {

	var game = new Phaser.Game(800, 544, Phaser.AUTO, '', { preload: preload, create: create, update: update });

	// plano de fundo
	var background;
	var backgroundTimer;
	var BACKGROUND_TIMER = 230;

	var music;

	var player;
	// grupo das shurikens
	var shurikens;

	// controla o score do jogo
	var score = 0;
	var scoreText;

	// Texto que aparece ao perder
	var restartText;

	// grava o recorde do player
	var record = 0;
	var recordText;

	// controla os inputs
	var cursors;
	// Timer de quando a proxima shuriken vai aparecer
	var SHURIKEN_TIMER = 230;
	var shurikenTimer;

	// variavel para saber se o player está morto ou não
	var playerDead;

	function preload() {
		// carrega as imagens
		game.load.image('background', 'assets/background.png');
		game.load.image('shuriken', 'assets/shuriken.png');
		game.load.image('player', 'assets/player.png');

		game.load.audio('music', ['assets/music.ogg']);
	}

	function create() {

	    music = game.add.audio('music', 1, true);
	    music.play('', 0, 1, true);

	    // seta os objetos iniciais
	    initBackground();
		initPlayer();
		initShurikens();
		initScore();

		// inicializa a variável de input
		cursors = game.input.keyboard.createCursorKeys();
	}

	function update() {
		// se o player não estiver morto
		if(!playerDead) {
			// atualiza o background para se mover
			//updateBackground();
			// verifica se há colisões
			updateCollisions();
			updateBackground();
			//updatePlayerAnimation();
			// gera shurikens o tempo todo
			generateShurikensLoop();
			// recebe o input do jogador
			checkInputFromPlayer();
		} else {
			// espera o jogador apertar para cima
			if(askForRestart()) {
				// reinicia o jogo
				restartGame();
			}
		}
	}

	//=====================================
	// Métodos iniciais
	//=====================================
	function initBackground() {
		background = game.add.group();
		backgroundTimer = game.time.now + BACKGROUND_TIMER;
	}	

	function initPlayer() {
		player = game.add.sprite(100, 64, 'player');
		player.body.gravity.y = 25;
		// aumenta o tamanho do sprite
		player.scale.setTo(1, 1);
	}

	// cria um grupo de shurikens
	function initShurikens() {
		shurikens = game.add.group();
		shurikenTimer = game.time.now + SHURIKEN_TIMER;
	}

	function initScore() {
		scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
		recordText = game.add.text(game.world.width - 150, 16, 'Record: 0', { fontSize: '32px', fill: '#fff' });
	}
	
	//=====================================
	// Métodos UPDATE
	//=====================================
	function updateBackground() {
		if(game.time.now > backgroundTimer) {
			createOneSquare();
			if(score == 50) {
				BACKGROUND_TIMER = 200;
			} else if(score == 100) {
				BACKGROUND_TIMER = 180;
			}
			backgroundTimer = game.time.now + BACKGROUND_TIMER;
		}

		background.forEach(function(square) {
			square.angle += 10;
		});
	}

	function updateCollisions() {
		game.physics.collide(player, shurikens, destroyPlayer, null, this);

		// se o player sair da tela
		if(player.body.y >= game.world.height) {
			destroyPlayer(player, false);
		}

		// se o player sair da tela
		if(player.body.y <= 0) {
			player.body.y = 0;
		}
	}

	function updatePlayerAnimation() {
		player.angle += 0.2
	}

	function generateShurikensLoop() {
		if(game.time.now > shurikenTimer) {
			createOneShuriken();
			if(score == 50) {
				SHURIKEN_TIMER = 200;
			} else if(score == 100) {
				SHURIKEN_TIMER = 180;
			}

			shurikenTimer = game.time.now + SHURIKEN_TIMER;
		}

		shurikens.forEach(function(square) {
			square.angle += 20;
		});
	}

	function checkInputFromPlayer() {
		if(cursors.up.isDown) {
			player.body.velocity.y = -400;
		}
	}

	var countdown;
	
	//=====================================
	// Métodos de gameOver
	//=====================================
	function askForRestart() {
		if(restartText == null) {
			restartText = game.add.text(game.world.width / 2 - 125, game.world.height / 2 - 50, 'Press up to restart!', { fontSize: '32px', fill: '#fff' });
			countdown = game.time.now + 1500;
		}

		if(cursors.up.isDown && player.body.y > game.world.height && countdown <= game.time.now) {
			return true;
		}
	}

	function restartGame() {
		hideRestartText();

		playerDead = false;
		
		initPlayer();

		resetScoreAndRecord();
	}

	//=====================================
	// Métodos Utilitários
	//=====================================
	function destroyPlayer(player, shuriken) {
		if(!playerDead) {
			playerDead = true;

			if(shuriken) {
				shuriken.body.velocity.x = 200;
				shuriken.body.gravity.y = 15;
			}
		}
	}

	function createOneShuriken() {
		var randomY = Math.abs(game.rnd.integerInRange(14, game.world.height - 14));

		var shuriken = shurikens.create(game.world.width + 10, randomY, 'shuriken');
		shuriken.body.velocity.x = -800;
		shuriken.scale.setTo(1.8, 1.8);
		// adiciona o evento ao sair da tela
		shuriken.events.onOutOfBounds.add(destroyShuriken, this);
	}

	function createOneSquare() {
		var randomY = Math.abs(game.rnd.integerInRange(14, game.world.height - 14));

		var square = background.create(game.world.width + 10, randomY, 'background');
		square.body.velocity.x = -1000;
		square.scale.setTo(0.2, 0.2);
		// adiciona o evento ao sair da tela
		square.events.onOutOfBounds.add(destroySquare, this);
	}

	function destroyShuriken(shuriken) {
		if(shuriken.body.x < 14 && !playerDead) {
			score += 1;
			scoreText.content = 'Score: ' + score;
			shuriken.kill();
		}
	}

	function destroySquare(square) {
		if(square.body.x < 14) {
			square.kill();
		}
	}

	function resetScoreAndRecord() {
		if(score > record) record = score;
		recordText.content = 'Record: ' + record;

		score = 0;
		scoreText.content = 'Score: ' + score;
	}

	function hideRestartText() {
		restartText.content = "";
		restartText = null;
	}
};