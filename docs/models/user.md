## `User` Model

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
