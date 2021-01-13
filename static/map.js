const width = window.innerWidth - 1074;

const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth - width,
    height: (window.innerWidth - width) / 1.821

});

const palmont = new Konva.Layer();
const rockport = new Konva.Layer();

let teamInfo = {};
let areaInfo = {};

function loadJSONFiles(source, callback) {
    const request = new XMLHttpRequest();
    request.overrideMimeType('application/json');
    request.open('GET', source, true);
    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4 && request.status == '200') {
            callback(request.responseText);
        }
    });
    request.send(null);
}

function loadTextures(sources, callback) {
	let textures = {};
	let loadedTextures = 0;
	let numTextures = 0;

	for (let src in sources) {
		numTextures++;
	}
	for (let src in sources) {
		textures[src] = new Image();
		textures[src].onload = () => {
      		if (++loadedTextures >= numTextures) {
        		callback(textures);
      		}
	}
	textures[src].src = sources[src];
	}
}

let palmontPoints = {
	'silverton' : silvertonPoints,
	'fortuna' : fortunaPoints,
	'kempton' : kemptonPoints,
	'td_palmont' : tdPalmontPoints,
};

let rockportPoints = {
	'rosewood' : rosewoodPoints,
	'gray_point' : grayPointPoints,
	'camden' : camdenPoints,
	'td_rockport' : tdRockportPoints,
};


let areaInfoBlock = document.getElementById('area-info-block'),
	trackList = document.getElementById('track-list'),
	areaName = document.getElementById('area-name'),
	controlInfo = document.getElementById('control-info'),
	teamInfoBlock = document.querySelector('#team-info-block tbody'),
	cursor = document.getElementById('cursor');

let isNeutral = false;

function showInfo(area, areaInfo) {
	// console.log(area.id)
	areaName.innerText = areaInfo[area.attrs.id - 1]['area_name'];
	controlInfo.innerText = areaInfo[area.attrs.id - 1]['control'];

	let trackArr = areaInfo[area.attrs.id - 1]['tracks'];
	let teamLogo = null;
	
	if (trackArr.length == 0 || areaInfo[area.attrs.id - 1]['control'] == '') {
		controlInfo.innerText = 'NEUTRAL AREA';
		teamLogo = 'neutral.png';
		isNeutral = true;
	}
	else {
		teamLogo = teamInfo[areaInfo[area.attrs.id - 1]['control']]['logo'];	
		isNeutral = false;		
	}

    for (let i = 0; i < trackArr.length; i++)
		trackList.innerHTML += `<li style='background-image:url(static/logos/${ teamLogo })'>${ trackArr[i] }</li>`;

    areaInfoBlock.style.display = 'block';
}

// проверка на принадлежность района к какий-либо команде
function whoControls(areaInfo, teamInfo, area) {
	let textureKey = 'NEUTRAL';

	for (let key in teamInfo) {
		if (teamInfo[key]['control_id'].includes(areaInfo[area]['id'])) {
			textureKey = teamInfo[key]['name']; // название команды также в качестве ключа текстур
			return textureKey;
		}
	}

	return textureKey;
}

function drawTerritory(city, territoryPoints, areaInfo, teamInfo, textures) {

	let textureKey = 'NEUTRAL';
	let arrArea = [];

	for (let i = 0; i < territoryPoints.length; i++) {
		textureKey = whoControls(areaInfo, teamInfo, i);

		arrArea[i] = drawArea(territoryPoints[i], textureKey, textures, i + 1);
		city.add(arrArea[i]);

		// in context
		arrArea[i].on('mouseover', function() {
		    this.stroke('gold');
		    showInfo(this, areaInfo);

		    // stage.container().style.cursor = 'crosshair';
		    if (isNeutral)
		    	cursor.src = 'static/main_pictures/def-cursor.png';
		    else
		    	cursor.src = 'static/main_pictures/cursor.gif';
		    // this.strokeWidth(4);
		    this.moveToTop(); // поднимаем по z-index
		    city.draw();
		});

		arrArea[i].on('mouseleave', function() {
	    	this.stroke('black');
	    	// stage.container().style.cursor = 'default';
	    	cursor.src = 'static/main_pictures/def-cursor.png';
	    	trackList.innerHTML = '';
	    	areaInfoBlock.style.display = 'none';
	    	city.draw();
		});
	}

	stage.add(city);
}

function drawArea(areaPoints, textureKey, textures, id) {
	let area = new Konva.Line({
		points: areaPoints,
		fillPatternImage: textures[textureKey],
		stroke: 'black',
		strokeWidth: 2.5,
		closed: true,
		// opacity: .85,
		lineJoin: 'bevel',
		id: id
	});

	return area;
}

// stage.add(palmont);

function drawMap() {
	console.log('done3')
	let textureSources = {};

	for (let key in teamInfo) {
		textureSources[key] = 'static/textures/' + teamInfo[key]['texture'];
	}

	textureSources['NEUTRAL'] = 'static/textures/neutral.png';

	loadTextures(textureSources, (textures) => {
		drawTerritory(palmont, palmontPoints['silverton'], areaInfo['silverton'], teamInfo, textures);
		drawTerritory(palmont, palmontPoints['fortuna'], areaInfo['fortuna'], teamInfo, textures);
		drawTerritory(palmont, palmontPoints['kempton'], areaInfo['kempton'], teamInfo, textures);
		drawTerritory(palmont, palmontPoints['td_palmont'], areaInfo['td_palmont'], teamInfo, textures);
		
		drawTerritory(rockport, rockportPoints['rosewood'], areaInfo['rosewood'], teamInfo, textures);
		drawTerritory(rockport, rockportPoints['gray_point'], areaInfo['gray_point'], teamInfo, textures);
		drawTerritory(rockport, rockportPoints['camden'], areaInfo['camden'], teamInfo, textures);
		drawTerritory(rockport, rockportPoints['td_rockport'], areaInfo['td_rockport'], teamInfo, textures);
	});
}


let promise = new Promise((resolve, reject) => {
	loadJSONFiles('static/team-info.json', (data) => {
        teamInfo = JSON.parse(data);
        console.log('done1')
        resolve();
    });
	
});

promise.then(() => {
	return new Promise((resolve, reject) => {
		loadJSONFiles('static/area-info.json', (data) => {
	        areaInfo = JSON.parse(data);
	        console.log('done2')
	        resolve();
	    });
	});
}).then(() => {
	drawMap();
	showLeaderBoard();
});

function drawText(city, text, x, y, size) {
	let textObj = new Konva.Text({
        x: x,
        y: y,
        text: text,
        fontSize: size,
        fontFamily: 'Calibri',
        fill: '#aaa',
      });
	city.add(textObj);
	stage.add(city);
}

drawText(palmont, 'SILVERTON', 215, 45, 16);
drawText(palmont, 'FORTUNA', 145, 190, 16);
drawText(palmont, 'KEMPTON', 130, 480, 16);
drawText(palmont, 'TOWNDOWN \n PALMONT', 540, 398, 12);
drawText(rockport, 'ROSEWOOD', 875, 40, 16);
drawText(rockport, 'GRAY \n POINT', 1015, 205, 16);
drawText(rockport, 'CAMDEN BEACH', 930, 524, 16);
drawText(rockport, 'TOWNDOWN ROCKPORT', 530, 575, 16);


function showLeaderBoard() {
	
	function getScore(team) {
		let score = 0;
		for (let key in areaInfo) {
			for (let i = 0; i < areaInfo[key].length; i++){
				if (teamInfo[team]['control_id'].includes(areaInfo[key][i]['id'])) {
					score += areaInfo[key][i]['tracks'].length;
					// console.log(areaInfo[key][i]['tracks']);
				}
				// if (areaInfo[key][i]['id'] == 4) 
				// console.log(areaInfo[key][i]['tracks'].length, areaInfo[key][i]['id'])
			}
		}
		return score;
	}

	let sortObj = [];
	let i = 0;
	for (let key in teamInfo) {
		sortObj[i] = {'name' : key, 'score' : getScore(key)}
		i++;
	}
	sortObj.sort((a, b) => b.score - a.score);
	console.log(sortObj)

	let isLeader = '';
	for (let i = 0; i < sortObj.length; i++) {
		if (i == 0) {
			isLeader = 'leader';
		}
		teamInfoBlock.innerHTML += `<tr><td class='name ${ isLeader }' style='background-image:url(static/logos/${ teamInfo[sortObj[i]['name']]['logo'] })'>${ sortObj[i]['name'] }</td>
					<td class='score'>${ sortObj[i]['score'] }</td></tr>`;
		isLeader = '';
	}
}

document.documentElement.addEventListener('mousemove', (e) => {
	// let x = e.pageX - e.target.offsetLeft,
	// 	y = e.pageY - e.target.offsetTop;
		cursor.style.display = 'block';
		cursor.style.left = (e.pageX - 18) + 'px';
		cursor.style.top = (e.pageY - 18) + 'px';
});

document.documentElement.addEventListener('mouseleave', (e) => {
	cursor.style.display = 'none';
});


// container.addEventListener('mousemove', (e) => {
// 	let x = e.pageX - e.target.offsetLeft,
// 		y = e.pageY - e.target.offsetTop;
// 		corr.innerText = x + ' : ' +y;
// });