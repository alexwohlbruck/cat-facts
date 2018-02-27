const express = require('express');
const router = express.Router();

const User = require.main.require('./app/models/user');
const strings = require.main.require('./app/config/strings.js');

router.get('/me', (req, res) => {
	if (req.user) return res.status(200).json(req.user);
	return res.status(401).json(false);
});

router.put('/me/settings', async (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	
	const query = prefixObjectKeys(req.body, 'settings.');
	
	try {
    	const user = await User.update({_id: req.user._id}, {$set: query});
	    return res.status(200).json(user);
	} catch (err) {
	    return res.status(400).json(err);
	}
});

module.exports = router;


// https://stackoverflow.com/questions/17200122/prepending-namespace-to-all-of-a-json-objects-keys
function prefixObjectKeys(obj, prefix){

    if (typeof obj !== 'object' || !obj){
        return false;
    }

    var keys = Object.keys(obj),
        keysLen = keys.length;
        prefix = prefix || '';

    for (var i=0; i<keysLen; i++){

        obj[prefix + keys[i]] = obj[keys[i]];
        if (typeof obj[keys[i]] === 'object'){
            prefixObjectKeys(obj[prefix + keys[i]], prefix);
        }
        delete obj[keys[i]];
    }

    return obj;
}