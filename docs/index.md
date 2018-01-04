# API Documentation

Base URL for all routes
`https://cat-fact.herokuapp.com`

## Routes

### Get some cat facts

Retrieve one or more cat facts.

##### Endpoint
`GET /facts`

##### Query parameters

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| amount    | 1       | Number of cats to retrieve. If set to one, response will be a fact object. If many, response will be an array of facts. |

##### Example request
`GET /facts?amount=2`

##### Example response
```
[
	{
		"_id": "591f9894d369931519ce358f",
		"__v": 0,
		"text": "A female cat will be pregnant for approximately 9 weeks - between 62 and 65 days from conception to delivery.",
		"updatedAt": "2018-01-04T01:10:54.673Z",
		"deleted": false,
		"source": "api",
		"used": false
	},
	{
		"_id": "591f9854c5cbe314f7a7ad34",
		"__v": 0,
		"text": "It has been scientifically proven that stroking a cat can lower one's blood pressure.",
		"updatedAt": "2018-01-04T01:10:54.673Z",
		"deleted": false,
		"source": "api",
		"used": false
	}
]
```

### Get current user
`Authentication Required`

Returns the data of the currently logged in user.

##### Endpoint
`GET /users/me`

##### Example response
```
{
  "_id": "59057485ed3e3800204fc406",
  "updatedAt": "2018-01-04T02:41:45.729Z",
  "createdAt": "2017-04-30T05:22:13.595Z",
  "email": "johndoe@gmail.com",
  "__v": 0,
  "settings": {
    "theme": "light"
  },
  "isAdmin": false,
  "google": {
    "id": "{google_id}",
    "accessToken": "{google_oauth_access_token}",
    "refreshToken": "{google_oauth_refresh_token}"
  },
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

## Models

### Fact

A single cat fact, (nearly) guaranteed to be genuine and factual.

| Key       | Type          | Description |
| --------- | ------------- | ----------- |
| _id       | ObjectId      | Unique ID for the fact |
| _v        | Number        | Version number of the fact |
| user      | ObjectId      | ID of the user who added the fact |
| text      | String        | The fact itself |
| updatedAt | Timestamp     | Date in which fact was last modified |
| sendDate  | Timestamp     | If the fact is meant for one time use, this is the date that it is used |
| deleted   | Boolean       | Weather or not the fact has been deleted (Soft deletes are used) |
| source		| String (enum) | Can be `user` or `api`, indicates who added the fact to the DB |
| used      | Boolean       | Weather or not the fact has been sent by the CatBot. This value is reset each time every fact is used |


### User

A user who has created an account on the web app.

| Key            | Type          | Description |
| -------------- | ------------- | ----------- |
| _id            | ObjectId      | Unique ID for the user |
| _v             | Number        | Version number of the user |
| createdAt      | Timestamp     | Date in which user was last created |
| updatedAt      | Timestamp     | Date in which user was last modified |
| email          | String        | The email address of the user |
| name.first     | String        | The first name of the user |
| name.last      | String        | The last name of the user |
| isAdmin        | Boolean       | Weather or not the user has administrative privileges in the web console |
| settings.theme | String (enum) | Can be `light` or `dark`, indicates the theme preference in the web app |
| google.id      | String        | The ID of the google account associated with the user |
| google.accessToken | String    | The OAuth access token for accessing the user's Google account data |
| google.refreshToken | String   | The OAuth refresh token for accessing the user's Google account data |
