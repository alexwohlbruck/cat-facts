const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');
const random = require('mongoose-simple-random');
const { animalTypes } = require('../config/strings.js');

const ApiLogSchema = new Schema({
	host: String,
	body: String,
	clientIp: String,
	originalUrl: String
}, {
	timestamps: true
});

const ApiLog = mongoose.model('ApiLog', ApiLogSchema);

module.exports = ApiLog;