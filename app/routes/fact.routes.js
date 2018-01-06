const express = require('express');
const router = express.Router();

const Fact = require.main.require('./app/models/fact');
const User = require.main.require('./app/models/user');
const Upvote = require.main.require('./app/models/upvote');

const strings = require.main.require('./app/config/strings.js');

// Get a random fact
router.get('/', async (req, res) => {
	try {
		const facts = await Fact.getFact({amount: req.query.amount});
		return res.status(200).json(facts);
	} catch (err) {
		return res.status(err).json(err);
	}
});

router.get('/:factID', async (req, res) => {
	try {
		const fact = await Fact.findById(req.params.factID);
		
		if (!fact) {
			return res.status(404).json({message: 'Fact not found'});
		}
		
		return res.status(200).json(fact);
	} catch (err) {
		return res.status(400).json(err);
	}
});

// Get submitted facts
router.get('/submitted', async (req, res) => {
	
	// Define states of pipeline
	var matchAll = {$match: {used: false, source: 'user', sendDate: {$exists: false}}},
		matchMe = {$match: {user: req.user ? req.user._id : 'Not authenticated - dummy query'}},
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
	
	try {
		const data = await Promise.props({
			all: Fact.aggregate([
				matchAll, lookupUsers, projectUsers, lookupUpvotes, projectUpvotes
			]),
			me: Fact.aggregate([
				matchMe, lookupUpvotes, projectUpvotes
			])
		});
		
		return res.status(200).json(data);
	}
	catch (err) {
        return res.status(400).json(err);
	}
});

// Submit a fact
router.post('/submitted', async (req, res) => {
    if (!req.user) {
    	return res.status(401).json({message: strings.unauthenticated});
    }
    
    if (!req.body.text) {
    	return res.status(400).json({message: "Provide a cat fact"});
    }
    
    const io = req.app.get('socketio');
    
    const fact = new Fact({
        user: req.user._id,
        text: req.body.text
    });
	    
	try {
	    const savedFact = await fact.save();
	    
		const populatedFact = await User.populate(savedFact, {path: 'user', select: 'name'});
	    	
		io.emit('fact', populatedFact);
		
	    return res.status(200).json(populatedFact);
	}
        
    catch (err) {
    	if (err.code === 11000) {
    		err.message = strings.fact.exists;
    		return res.status(409).json(err);
    	}
        return res.status(400).json(err);
    }
});

// Upvote a fact
router.post('/submitted/:factID/upvote', async (req, res) => {
    if (!req.user) {
    	return res.status(401).json({message: strings.unauthenticated});
    }
    
    if (!req.params.factID) {
    	return res.status(400).json({message: "Provide a fact ID"});
    }
    
    try {
	    const fact = await Fact.findById(req.params.factID);
	    
		if (!fact) {
			return res.status(404).json({message: "That fact doesn't exist"});
		}
		
		if (fact.user.equals(req.user._id)) {
			return res.status(400).json({message: "You can't upvote your own fact"});
		}
		
		const io = req.app.get('socketio');
	
		const upvote = new Upvote({
			user: req.user._id,
			fact: req.params.factID
		});
		
		await upvote.save();
		
		io.emit('fact:upvote', {fact: fact, user: req.user});
	    
	    return res.status(201).send();
	}
        
    catch (err) {
        return res.status(400).json(err);
    }
});

// Unvote (un-upvote) a fact
router.delete('/submitted/:factID/upvote', async (req, res) => {
	if (req.user) {
		return res.status(401).json({message: strings.unauthenticated});	
	}
	
    if (!req.params.factID) {
    	return res.status(400).json({message: "Provide a fact ID"});
    }
    
    const io = req.app.get('socketio');
    
    try {
	    await Upvote.findOneAndRemove({fact: req.params.factID, user: req.user._id});
	    
    	io.emit('fact:unvote', {fact: {_id: req.params.factID}, user: req.user});
	    	
    	return res.status(204).send();
    }
    
    catch (err) {
    	return res.stauts(400).json(err);
    }
});

module.exports = router;