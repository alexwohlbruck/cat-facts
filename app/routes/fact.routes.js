const express = require('express');
const router = express.Router();

const Fact = require.main.require('./app/models/fact');
const User = require.main.require('./app/models/user');
const Upvote = require.main.require('./app/models/upvote');

const FactService = require.main.require('./app/services/fact.service');
const strings = require.main.require('./app/config/strings.js');

// Get simple fact fact
router.get('/', function(req, res) {
	FactService.getFact().then(function(message) {
		return res.json({
			displayText: message
		});
	});
});

// Get submitted facts
router.get('/submitted', function(req, res) {
	
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	
	// Define states of pipeline
	var matchAll = {$match: {used: false, source: 'user'}},
		matchMe = {$match: {user: req.user._id}},
		lookupUsers = {$lookup: {
			from: 'users',
			localField: 'user',
			foreignField: '_id',
			as: 'user'
		}},
		projectUsers = {$project: {
			text: 1,
			user: { $arrayElemAt: ['$user', 0], }
		}},
		lookupUpvotes = {$lookup: {
			from: 'upvotes',
			localField: '_id',
			foreignField: 'fact',
			as: 'upvotes'
		}},
		projectUpvotes = {$project: {
			text: 1,
			user: { _id: 1, name: 1 },
			upvotes: { user: 1 },
			used: 1
		}};
	
	Promise.props({
		all: Fact.aggregate([
			matchAll, lookupUsers, projectUsers, lookupUpvotes, projectUpvotes
		]),
		me: Fact.aggregate([
			matchMe, lookupUpvotes, projectUpvotes
		])
	}) .then(function(data) {
		return res.status(200).json(data);
	}, function(err) {
        return res.status(400).json(err);
	});
});

// Submit a fact
router.post('/submitted', function(req, res) {
    if (req.user) {
        if (!req.body.text) return res.status(400).json({message: "Provide a cat fact"});
        
        const io = req.app.get('socketio');
        
        const fact = new Fact({
            user: req.user._id,
            text: req.body.text
        });
        
        fact.save()
        .then(function(fact) {
        	return User.populate(fact, {path: 'user', select: 'name'});
        })
        .then(function(fact) {
        	io.emit('fact', fact);
            return res.status(200).json(fact);
        })
        .catch(function(err) {
            return res.status(400).json(err);
        });
    } else {
        return res.status(401).json({message: strings.unauthenticated});
    }
});

// Upvote a fact
router.post('/submitted/:factID/upvote', function(req, res) {
    if (req.user) {
        if (!req.params.factID) return res.status(400).json({message: "Provide a fact ID"});
        
        Fact.findById(req.params.factID)
		.then(function(fact) {
        	if (!fact) return res.status(404).json({message: "That fact doesn't exist"});
        	if (fact.user.equals(req.user._id)) return  res.status(400).json({message: "You can't upvote your own fact"});
        
        	const io = req.app.get('socketio');
        
			const upvote = new Upvote({
				user: req.user._id,
				fact: req.params.factID
			});
			
			return upvote.save().then(function() {
				io.emit('fact:upvote', {fact: fact, user: req.user});
			});
        })
        
        .then(function(upvote) {
            return res.status(201).send();
        }, function(err) {
            return res.status(400).json(err);
        });
    } else {
    	return res.status(401).json({message: strings.unauthenticated});
    }
});

// Unvote (un-upvote) a fact
router.delete('/submitted/:factID/upvote', function(req, res) {
	if (req.user) {
        if (!req.params.factID) return res.status(400).json({message: "Provide a fact ID"});
        
        const io = req.app.get('socketio');
        
        Upvote.findOneAndRemove({fact: req.params.factID, user: req.user._id}).then(function() {
        	io.emit('fact:unvote', {fact: {_id: req.params.factID}, user: req.user});
        	
        	return res.status(204).send();
        }, function(err) {
        	return res.stauts(400).json(err);
        });
	} else {
    	return res.status(401).json({message: strings.unauthenticated});
    }
});

module.exports = router;