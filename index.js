let ws = new WebSocket('ws://localhost:3000')

let audioContext;

function generateCharSheet(e) {
    var valid = true;
    var stats = [];
    var errorMsg = '';

    e.preventDefault();

    var name = document.getElementById('name-input').value;
    console.log('name:'+name);

    var statsNames = ['spd-stat-input', 'str-stat-input', 'res-stat-input', 'men-stat-input'];
    statsNames.forEach((value) => {
        var selector = 'input[name="'+value+'"]:checked'
        if(document.querySelector(selector) != null) {
            stats.push(document.querySelector(selector).value);
        }
    })

    if (name == null || name == '') {
        valid = false;
        errorMsg += 'Name is required <br />';
    }

    if (stats.length != 4) {
        valid = false;
        errorMsg += 'All stats must have a value <br />';
    } else if (stats.filter((val, index) => {return stats.indexOf(val) == index}).length != 4) {
        valid = false
        errorMsg += 'No two stats can have the same value <br />';
    }

    document.getElementById('error-message').innerHTML = errorMsg;
    if (!valid) {
    } else {
        document.getElementById('char-name').innerHTML = name;
        document.getElementById('spd-stat').innerHTML = stats.shift();
        document.getElementById('str-stat').innerHTML = stats.shift();
        document.getElementById('res-stat').innerHTML = stats.shift();
        document.getElementById('men-stat').innerHTML = stats.shift();

        document.getElementById('character-generator').setAttribute('class', 'hidden');
        document.getElementById('sheet').setAttribute('class', '')
		document.getElementById('char-name').setAttribute('class', '')
	}

	const AudioContext = window.AudioContext || window.webkitAudioContext;

	audioContext = new AudioContext();
	updateServer()

}

function wsHealthCheck() {
	if (ws.readyState != ws.OPEN || ws.readyState != ws.CONNECTING) {
		ws = new WebSocket('ws://localhost:3000')
	}
	setTimeout(wsHealthCheck, 5000)
}

function setWsListener() {
	console.log('...')
	if(ws.readyState == 0) {
		setTimeout(setWsListener, 500);
	} else {
		console.log('Setting listener')
		ws.onmessage = (data) => {
			if(data.data == 'HELL') {
				document.querySelector('body').setAttribute('class', 'real')
				setTimeout(playLaugh, 500)
			}
			console.log('Message received: '+data.data);
		}
	}
}

function playLaugh() {
// get the audio element
	const audioElement = document.querySelector('audio');

// pass it into the audio context
	if(!audioElement.played) {
		const track = audioContext.createMediaElementSource(audioElement);


		track.connect(audioContext.destination);
	}
	audioElement.play()
	// audioContext.close()
}

function gameOver() {
	setTimeout(()=>{
		updateServer()
		if(document.querySelectorAll('input[type=checkbox]:checked').length == 3) {
			document.getElementById('game-over').setAttribute('class', '')
			playLaugh()
		}
	},500)
}

function updateServer() {
	//Collate data
	let playerData = {}
	playerData.name = document.getElementById('char-name').innerText;
	playerData.health = 3-document.querySelectorAll('input[type=checkbox]:checked').length

	ws.send(JSON.stringify(playerData))
}

function rollDice() {
	let number = Math.ceil(Math.random()*6);
	document.getElementById('dice-roll').innerText = number
}

wsHealthCheck();
setWsListener();
document.getElementById('character-generator').addEventListener('submit', generateCharSheet);
document.querySelectorAll('label').forEach((node) => node.addEventListener('click',gameOver))
document.querySelectorAll('input[type=checkbox]').forEach((node) => node.addEventListener('click',gameOver))
