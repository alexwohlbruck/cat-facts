const express = require('express');
const router = express.Router();

const IFTTTService = require.main.require('./app/services/ifttt.service.js');

const User = require.main.require('./app/models/user');
const VerificationCode = require.main.require('./app/models/verification-code');
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

router.post('/me/profile/phone/verification-code', async (req, res) => {
    if (!req.user) return res.status(401).json({message: strings.unauthenticated});
    
    const inputData = {
        user: req.user._id,
        type: 'phone',
        data: req.body.phone
    };
    const verificationCode = new VerificationCode(inputData);
    
    try {
        const result = await verificationCode.save();
        
    	IFTTTService.sendSingleMessage({
    	    number: req.body.phone,
    	    message: `${result.code} is your Cat Facts verification code.`
    	});
        
        return res.status(200).json({
            message: "Created verification code",
            ...inputData
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }
});

router.put('/me/profile/phone', async (req, res) => {
    if (!req.user) return res.status(401).json({message: strings.unauthenticated});
    if (!req.body.verificationCode) return res.status(401).json({message: strings.noVerificationCode});
    
    const submittedCode = req.body.verificationCode.trim();
    const verificationCode = await VerificationCode.findOne({code: submittedCode});
    
    if (!verificationCode) return res.status(404).json({message: strings.invalidVerificationCode});
    
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {$set: {
        phone: verificationCode.data
    }}, {
        new: true
    });
    
    await VerificationCode.findByIdAndRemove(verificationCode._id);
    
    return res.status(200).json(updatedUser);
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