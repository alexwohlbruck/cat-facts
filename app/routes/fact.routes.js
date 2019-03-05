const express = require('express');
const router = express.Router();

const strings = require.main.require('./app/config/strings.js');
const { isAuthenticated } = require('../middleware');

const Fact = require.main.require('./app/models/fact');
const User = require.main.require('./app/models/user');
const Upvote = require.main.require('./app/models/upvote');


// Get submitted facts
router.get('/', async (req, res) => {
	
	const animalType = req.query.animal_type ? req.query.animal_type.split(',') : ['cat'];
	
	// Define states of pipeline
	const matchAll = {
		$match: {
			used: false,
			// source: 'user',
			sendDate: {
				$exists: false
			},
			type: {
				$in: animalType
			}
		}
	},
	matchMe = {
		$match: {
			user: req.user ? req.user._id : 'Not authenticated - dummy query',
			type: {
				$in: animalType
			}
		}
	},
	lookupUsers = {$lookup: {
		from: 'users',
		localField: 'user',
		foreignField: '_id',
		as: 'user'
	}},
	projectUsers = {$project: {
		text: 1,
		type: 1,
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
		used: 1,
		type: 1
	}},
	countUpvotes = [
		{$addFields: {
			upvotes: { $size: "$upvotes" },
			userUpvoted: {
				$in: [ req.user._id, "$upvotes.user" ]
			}
		}},
		{$sort: {
			upvotes: -1
		}}
	];
	
	try {
		const data = await Promise.props({
			all: Fact.aggregate([
				matchAll,
				lookupUsers,
				projectUsers,
				lookupUpvotes,
				projectUpvotes,
				...countUpvotes
			]),
			me: Fact.aggregate([
				matchMe,
				lookupUpvotes,
				projectUpvotes,
				...countUpvotes
			])
		});
		
		return res.status(200).json(data);
	}
	catch (err) {
        return res.status(400).json(err);
	}
});

// Get a random fact
router.get('/random', async (req, res) => {
	
	const animalType = req.query.animal_type ? req.query.animal_type.split(',') : ['cat'];
	const amount = req.query.amount;
	
	if (amount > 500) {
		return res.status(405).json({message: 'Limited to 500 facts at a time'});
	}
	
	try {
		const facts = await Fact.getFact({amount, animalType});
		return res.status(200).json(facts);
	} catch (err) {
		return res.status(err).json(err);
	}
});

// Get fact by ID
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

// Submit a fact
router.post('/', isAuthenticated, async (req, res) => {
    
    if (!req.body.factText) {
    	return res.status(400).json({message: "Missing body paramter: factText"});
    }
    if (!req.body.animalType) {
    	return res.status(400).json({message: "Missing body parameter: animalType"});
    }
    
    const io = req.app.get('socketio');
    
    const fact = new Fact({
        user: req.user._id,
        text: req.body.factText,
        type: req.body.animalType
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
router.post('/:factID/upvote', isAuthenticated, async (req, res) => {
    
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
router.delete('/:factID/upvote', isAuthenticated, async (req, res) => {
	
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