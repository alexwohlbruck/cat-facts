var cron = require('cron');
var factScraper = require.main.require('./app/cron/fact-scraper');

// Check for new facts once a day
new cron.CronJob('0 0 0 * * *', factScraper.scrape, null, true);
