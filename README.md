![Cat Facts logo](http://i.imgur.com/9RGJ5Ea.png)

Using a combination of Node.js, Angular, and Tasker, this app will combine APIs and Services from the web to do just one thing... send cat facts.

## Features
- Add and view your personal list of fact recipients
- Send a cat fact via text message every day
- Countdown clock until next fact is sent
- Catbot that auto-replies when recipients text back
- View the catversation between Catbot and your recipients
- Submit your own interesting facts
- Quick copy-and-paste-able cat facts with the "Get Fact" button
- Add recipients by talking to the Catbot!
- Import all of your Google contacts at once
- Admin console panel for managing the app
- Twitter bot
- Developer API

## Support Cat Facts
Cat Facts is ad free and available to use without cost. Help me keep it running by [donating here](http://bit.ly/2tC599V). :)

## Getting Started

### Official website
[Visit](https://cat-fact.herokuapp.com) the site  and start messing with your friends!

### API Documentation
[Start developing!](https://alexwohlbruck.github.io/cat-facts/docs)

[Docs homepage](https://alexwohlbruck.github.io/cat-facts)

### Other sites
Follow Cat Facts on [Twitter](https://twitter.com/datos_de_gatos)

Talk to the DialogFlow bot [here](https://bot.dialogflow.com/d7b47381-1453-4b31-a20c-9825de80cf88)

### Setup
If you want to set up your own version of Cat Facts, follow the instructions in this [guide](https://alexwohlbruck.github.io/cat-facts/docs/setup)

## Homelab / Docker

This repo includes a `Dockerfile` and `docker-compose.yml` for running the Node.js backend (which also serves the AngularJS static site from `public/`).

### Quick start (recommended layout under `/opt`)

1. Clone (or pull) the repo into `/opt/cat-facts`.
2. Create `/opt/cat-facts/.env` from the template:

   - Copy `homelab.env.example` to `.env`
   - Fill in your MongoDB Atlas credentials and other secrets

3. Start the container:

   - `docker compose up -d --build`
   - App will listen on port `3000` by default (override with `HOST_PORT=xxxx`)

### Reverse proxy / HTTPS redirect

In production the app can redirect HTTP → HTTPS based on `x-forwarded-proto` (for platforms like Heroku or homelabs behind a TLS-terminating reverse proxy).

- If you are **not** behind such a proxy, keep `FORCE_HTTPS_REDIRECT=false` (default in `docker-compose.yml`).
- If you **are** behind a proxy that terminates TLS and sets `x-forwarded-proto=https`, you can set `FORCE_HTTPS_REDIRECT=true`.
