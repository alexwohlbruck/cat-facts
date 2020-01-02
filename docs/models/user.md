## `User` Model

A user who has created an account on the web app.

| Key            | Type          | Description |
| -------------- | ------------- | ----------- |
| _id            | ObjectId      | Unique ID for the `User` |
| _v             | Number        | Version number of the `User` |
| createdAt      | Timestamp     | Date in which `User` was last created |
| updatedAt      | Timestamp     | Date in which `User` was last modified |
| email          | String        | The email address of the `User` |
| name.first     | String        | The first name of the `User` |
| name.last      | String        | The last name of the `User` |
| isAdmin        | Boolean       | Whether or not the `User` has administrative privileges in the web console |
| google.id      | String        | The ID of the google account associated with the `User` |
| google.accessToken | String    | The OAuth access token for accessing the `User`'s Google account data |
| google.refreshToken | String   | The OAuth refresh token for accessing the `User`'s Google account data |
