# API Documentation

Base URL for all endpoints
`https://cat-fact.herokuapp.com`

*The response time will likely be a few seconds long on the first request, because this app is running on a free Heroku dyno. Subsequent requests will behave as normal.*

## Endpoints
[`/facts`](endpoints/facts.md)
Retrieve and query facts

[`/users`](endpoints/users.md)*
Get user data

<sub> * Requires authentication. As of now, this can only be achieved by logging in manually on the website. </sub>

## Models
[`Fact`](models/fact.md)
An animal fact

[`User`](models/user.md)
A user of the Cat Facts site