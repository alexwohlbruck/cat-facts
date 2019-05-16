const { semanticJoin } = require('../config/functions');

module.exports = {
    welcomeMessage: (animalTypes = ['cat']) => {
        const animalsList = animalTypes.map(animal => {
            return `${animal[0].toUpperCase()}${animal.slice(1)}s`;
        });
        const animalsListCapital = animalsList.map(animal => {
            return animal.toUpperCase();
        });
        
        return `Thanks for signing up for ${semanticJoin(animalsList)} Facts! You will now receive fun facts about ${semanticJoin(animalsListCapital)} every day! =^.^=`;
    },
    animalTypes: [
        'cat',
        'dog',
        'snail',
        'horse'
    ],
    unauthenticated: "Sign in first",
    unauthorized: "You aren't allowed to do that!",
    noVerificationCode: "Please provide a verification code",
    invalidVerificationCode: "That verification code is invalid",
    error: "Purr-don me, an error occured. Try again later!",
    fact: {
        exists: "That fact has already been added!"
    },
    recipient: {
        exists: "That person is already being facted"
    },
    invalidNumber: "That phone number is invalid!",
    userPhotoUrl: "https://cat-fact.herokuapp.com/img/res/avatars/user-face.png",
};