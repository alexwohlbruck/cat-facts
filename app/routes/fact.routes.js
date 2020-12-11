const express = require('express');
const router = express.Router();

const strings = require.main.require('./app/config/strings.js');
const { isAuthenticated, logApiRequest } = require('../middleware');

const Fact = require.main.require('./app/models/fact');
const User = require.main.require('./app/models/user');

router.get('/', async(req, res) => {
    try {
        const facts = await Fact.find().limit(5);
        return res.status(200).json(facts);
    } catch (err) {
        return res.status(err.status || 400).json(err);
    }
})

// Get submitted facts
router.get('/me', async(req, res) => {

    const animalType = req.query.animal_type ? req.query.animal_type.split(',') : ['cat'];

    try {
        const data = await Fact.find({
                user: req.user._id,
                type: { $in: animalType }
            })
            .select('text type')
            .populate('user', 'name')
            .limit(10)

        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json(err);
    }
});

// Get a random fact
router.get('/random', logApiRequest, async(req, res) => {

    const animalType = req.query.animal_type ? req.query.animal_type.split(',') : ['cat'];
    const amount = req.query.amount;

    if (amount > 500) {
        return res.status(405).json({ message: 'Limited to 500 facts at a time' });
    }

    try {
        const facts = await Fact.getFact({ amount, animalType });
        return res.status(200).json(facts);
    } catch (err) {
        return res.status(err.status).json(err);
    }
});

// Get fact by ID
router.get('/:factID', logApiRequest, async(req, res) => {
    try {
        const fact = await Fact.findById(req.params.factID).populate('user', 'name photo');

        if (!fact) {
            return res.status(404).json({ message: 'Fact not found' });
        }

        return res.status(200).json(fact);
    } catch (err) {
        return res.status(400).json(err);
    }
});

// Submit a fact
router.post('/', isAuthenticated, async(req, res) => {

    if (!req.body.factText) {
        return res.status(400).json({ message: "Missing body paramter: factText" });
    }
    if (!req.body.animalType) {
        return res.status(400).json({ message: "Missing body parameter: animalType" });
    }

    const io = req.app.get('socketio');

    let text = req.body.factText;

    text = text.charAt(0).toUpperCase() + text.slice(1); // Capitalize
    text += text[text.length - 1] == "." ? "" : "."; // Add period to end

    const fact = new Fact({
        user: req.user._id,
        text,
        type: req.body.animalType
    });

    try {
        const savedFact = await fact.save();

        const populatedFact = await User.populate(savedFact, { path: 'user', select: 'name' });

        io.emit('fact', populatedFact);

        return res.status(200).json(populatedFact);
    } catch (err) {
        if (err.code === 11000) {
            err.message = strings.fact.exists;
            return res.status(409).json(err);
        }
        return res.status(400).json(err);
    }
});

module.exports = router;