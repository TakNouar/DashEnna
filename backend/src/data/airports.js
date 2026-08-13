const fs = require('fs');
const path = require('path');

const p1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'airports_p1.json'), 'utf8'));
const p2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'airports_p2.json'), 'utf8'));

const AIRPORTS = [...p1, ...p2];

module.exports = { AIRPORTS };
