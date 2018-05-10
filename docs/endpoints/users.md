## `User` Endpoints

*Authentication required*

### Get current user

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
  "phone": "2025550111",
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