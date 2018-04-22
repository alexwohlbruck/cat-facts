# How to set up Cat Facts on your own device

##### Requirements:
- An Android phone with SMS capabilities
- [Tasker](https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm) (Android app for automation)
- [Node.js](https://nodejs.org)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) for deployment

##### Copy the repository into your workspace:
1. Clone the repository from GitHub 
    `git clone https://github.com/alexwohlbruck/cat-facts.git`

2. Install NPM modules
    `npm install`

##### Set up services and APIs

3. Create your service tokens
    - Heroku Hosting (Skip this if you want to use your own web hosting)
        1. Log in or Sign up at https://heroku.com
        2. Create a new app and name it whatever you like. This name has to be unique and not in use
        3. You can either connect the app to a GitHub repository or use Heroku's own Git service via the CLI:
            - With the Heroku CLI: Follow the instructions on the Deploy tab in Heroku
            - With Connect to GitHub: Sign into GitHub and pick your repository to connect. Enable auto-deploys if you'd like
    - Google Developers Platform (For Google Sign in and OAuth)
        1. Log in to https://console.developers.google.com
        2. Create a new project and name it "Cat Facts"
        3. In the Dashboard, click "Enable API". Here you can search for APIs needed for the project
        4. Enable the Google+ API and the Google People API
        5. Go the the Credentials section and create an OAuth 2.0 Client ID
        6. Add the domain name where your project is hosted as an Authorized Javascript Origin, for example:
            `https://cat-fact.herokuapp.com`
            If you're using Heroku for hosting, the domain should be `https://your-app-name.herokuapp.com`
        7. In the Authorized redirect URI's section, add two more URLs with the callback URLS like so:
            `https://{what-ever-you-used-as-the-domain-above}.com/auth/google/callback`
            `https://{what-ever-you-used-as-the-domain-above}.com/auth/google/contacts/callback`
        8. Take note of the Client ID and Client Secret, we'll use them later
    - IFTTT (Communication from server to your device)
        1. Download the IFTTT app to your Android phone and sign in
        2. Connect the Maker Webhooks and Android SMS services to your account
        3. Add the [CatBot Applet](https://ifttt.com/applets/48787297d-send-catbot-message) and turn it on
        4. Go to the [Maker Webhooks page](https://ifttt.com/maker_webhooks) and click "Documentation"
        5. Take note of your service key, displayed at the top
    - mLab MongoDB database (Skip this if you want to use your own Mongo database)
        1. Sign up or log in to [mLab](https://mlab.com)
        2. Create a new database by clicking the "Create new" button
        3. Choose the AWS Provider and under the Single-node tab, choose the free Sandbox option
        4. Name your database "cat-facts" and create it
        5. Open the database and create a user for your database. Remember the username and password (this is different than the user/pass combo you used to login to mLab)
    - Api.ai account (For conversational chatbot)
        1. Visit [Api.ai](https://api.ai)'s website and sign in using your Google account
        2. Download the [Cat Facts Api.ai agent from Google Drive](https://drive.google.com/file/d/0B4rWYiw5-JZtZEF4cnBQczM1cFE/view?usp=sharing)
        3. Create a new agent and name it "Cat Facts"
        4. Once it's created, click on the gear by the agent name to access it's settings
        5. Under the "Export and Import" tab, click "Restore from ZIP" and upload the agent file. You should now have access to the full dashboard.
        6. Now go to the "General" tab and keep note of the client access token. You will need this for later as well.
        7. Under the "Fufillment" section of the console, make sure webhook is enabled, and update the URL to the same domain name you used earlier, followed by `/webhook`, example:
            `https://{what-ever-you-used-as-the-domain-above}.com/webhook`

4. Add tokens and other credentials to your config vars
    - Add the following config variables to your project (In the Settings tab of the Heroku console and in your development environment if you want to use one):

		| Name 					  | Value																							|
		| ----------------------- | ----------------------------------------------------------------------------------------------- |
		| APIAI_ACCESS_TOKEN      | {Your api.ai access token}                                                                      |
		| BASE_URL               | {Your heroku app's domain name}																	|
		| DB_USERNAME             | {Your mLab database's user account name}														|
		| DB_PASSWORD            | {Your mLab database's user account password}														|
		| ENCRYPTION_ALGORITHM    | `aes-256-ctr`																					|
		| ENCRYPTION_KEY          | {Generate a key using the password generator}													|
		| GENERAL_ACCESS_TOKEN    | {Generate a key using the password generator}													|
		| GOOGLE_CLIENT_ID       | {Your Client ID from the Google Developer's Platform												|
		| GOOGLE_CLIENT_SECRET   | {Your Client Secret from the Google Developer's Platform}										|
		| IFTTT_API_KEY           | {The service key provided by the IFTTT Maker Webhooks service}									|
		| NODE_ENV                | {"production" for your heroku config and "development" for your own development environment}	|
		| SESSION_SECRET          | {Generate a key using the password generator}													|
		
	LastPass Random Password Generator: https://lastpass.com/generatepassword.php
	
5. Deploy your app
    1. In the Deploy tab of the Heroku console, re-deploy the app, and check it's status in the Activity tab
    2. You should be able to visit your Cat-Facts clone at the domain you have been using
    3. To test that it's working, try to sign in. If all is well, continue to the next step

##### Connect your phone to Cat Facts

6. Set up Tasker automation
    Tasker is an Android app that can help you automate your phone based on "Profiles" and "Tasks". Download the app to your Android phone and follow the instructions below:
    1. Create a new Profile by clicking the plus button, and choose Time
    2. In the "from" section, choose a time for the Cat Facts to send every day. Then disable the "to" option
    3. Click the back button, and on the next screen click "New Task"
    4. Name the task "CatBot Many" and click the Check box
    5. Add the following actions to this task:
        1. HTTP Get
            - Server:Port: `{Your heroku app's domain name}`
            - Path: `/catbot/daily`
            - Attributes: `code={Your general access token from config vars}`
        2. JavaScriptlet
            - Code: 
	            ```
	            var data = JSON.parse(global('HTTPD'));
	            var recipients = data.recipients.join(',');
	            var fact = data.fact;
	            setGlobal('DAILYFACT', fact);
	            setGlobal('RECIPIENTS', recipients);
	            ```
        3. For
            - Variable: `%RECIPIENT`
            - Items: `%RECIPIENTS`
        4. Send SMS
            - Number: `%RECIPIENT`
            - Message: `%DAILYFACT`
        5. Wait
            - Seconds: 2
        6. End For
    6. Go back to the Profiles tab and create an event based profile for "Recieved Text Any"
    7. Create a task for this profile called "CatBot Single"
    8. This task will include these actions:
        1. HTTP Post
            - Server:Port: `{Your heroku app's domain name}`
            - Path: `/catbot/message?query=%SMSRB&number=%SMSRF&name=%SMSRN`
            - Content Type: `text/plain`
        2. JavaScriptlet
            - Code:
                ```
                var data = JSON.parse(global('HTTPD'));
                var response = data.response.text;
                var delay = data.delay;
                var number = data.number;
                setGlobal('DELAY', delay);
                setGlobal('CATBOTRESPONSE', response);
                setGlobal('CATBOTRESPONSENUMBER', number);
                ```
        3. Wait
            - Seconds (Click the "shuffle" icon to enter a value): `%DELAY`
        4. Send SMS
            - Number: `%CATBOTRESPONSENUMBER`
            - Message: `%CATBOTRESPONSE`
    9. Click the back button and exit the app to save changes
    10. To test if Tasker is working, open the "CatBot Many" task and click the green arrow to run it. Cat Facts should be sent to all the recipients that are saved in your database

7. Modify Android sms sending limit
    1. Android will block tasker from sending too many messages at once. You will need to use the Android Debug Bridge (ADB) tool from the Android Platform SDK to fix this
    2. Go to the [Android Developers website](https://developer.android.com/studio/releases/platform-tools.html) and download the SDK tools
    3. Once the tools have been installed, head to the `platform-tools` directory on your machine where the adb application is located
    4. Open the command line in this directory and run this command `adb shell settings put global sms_outgoing_check_max_count 1000000000`
    5. The SMS outgoing limit is now increased to 1000000000 messages at once, that ought to cover it

##### That's it!
    
And in those few easy steps (lolwut), you should have a clone of the Cat Facts codebase and you can now make any changes that your heart desires.