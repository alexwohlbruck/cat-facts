## `User` Endpoints

*Authentication required*

### Get current user

Returns the data of the currently logged in `User`.

##### Endpoint
`GET /users/me`

##### Example response
```json
{
  "name": {
    "first": "Alex",
    "last": "Wohlbruck"
  },
  "google": {
    "id": "{google_id}",
    "accessToken": "{google_oauth_access_token}",
    "refreshToken": "{google_oauth_refresh_token}"
  },
  "photo": "https://lh3.googleusercontent.com/a-/AOh14GhYgUCf9yFuj-Xt6_X_cDz-5gSusrGde-lerdKqXxA=s50",
  "isAdmin": false,
  "deleted": false,
  "_id": "5a9ac18c7478810ea6c06381",
  "updatedAt": "2020-04-24T07:23:08.045Z",
  "createdAt": "2017-01-10T12:00:35.952Z",
  "email": "alexwohlbruck@gmail.com",
  "ip": "{your last IP address}",
  "__v": 0,
  "phone": "{your phone number, if set}"
}
```