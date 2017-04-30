module.exports = {
    oauth: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URL: process.env.BASE_URL + '/auth/google/contacts/callback'
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY,
        algorithm: process.env.ENCRYPTION_ALGORITHM
    },
    session: {
        secret: process.env.SESSION_SECRET
    },
    ifttt: {
        apiKey: process.env.IFTTT_API_KEY
    },
    dbPassword: process.env.DB_PASSWORD
};