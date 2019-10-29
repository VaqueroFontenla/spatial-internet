const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const iplocation = require('iplocation').default;
const EventSource = require('eventsource');
const isIp = require('is-ip');

const adapter = new FileSync('../assets/data.json')
const db = low(adapter);

const ipAPIURL = 'https://ipapi.co/json';

const wikimediaStreamURL = 'https://stream.wikimedia.org/v2/stream/recentchange';

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });
const connections = [];
    wss.on('connection', function connection(ws) {
        connections.push(ws)
});

var i = 1;

db.defaults({entries: []}).write()

async function onMessage(e) {
	let data, location;

	try {
		data = JSON.parse(e.data)
	} catch (err) {
		console.log('Error parsing data', err);
		return;
	}

	const ipAddress = data.user;

	if (!data || !isIp(ipAddress)) {
		return;
	}

	try {
		location = await iplocation(ipAddress, [ipAPIURL]);
	} catch (err) {
		console.log('IP Location Error:', err);
		return;
	}

	// We receive around 10k edits per hour

	const item = {
		data,
		location
    };
    

	const geoItem = {
        ip: item.location.ip,
        lat: item.location.latitude,
        lon: item.location.longitude,
        ObjectID: i++
    }

    connections.map( ws => ws.send(JSON.stringify(geoItem)));
	db.get('entries').push(item).write();
}

function init() {
	console.log('Connecting to ', wikimediaStreamURL);

	var es = new EventSource(wikimediaStreamURL)
	es.addEventListener('message', onMessage)
}



init();