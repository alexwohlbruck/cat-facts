module.exports = {
    oauth: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    },
    session: {
        secret: process.env.SESSION_SECRET
    },
    ifttt: {
        apiKey: process.env.IFTTT_API_KEY
    },
    dbPassword: process.env.DB_PASSWORD
};