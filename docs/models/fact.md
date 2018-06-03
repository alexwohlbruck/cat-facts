## `Fact` Model

A single animal fact, (nearly) guaranteed to be genuine and factual.

| Key       | Type          | Description |
| --------- | ------------- | ----------- |
| _id       | ObjectId      | Unique ID for the `Fact` |
| _v        | Number        | Version number of the `Fact` |
| user      | ObjectId      | ID of the `User` who added the `Fact` |
| text      | String        | The `Fact` itself |
| updatedAt | Timestamp     | Date in which `Fact` was last modified |
| sendDate  | Timestamp     | If the `Fact` is meant for one time use, this is the date that it is used |
| deleted   | Boolean       | Weather or not the `Fact` has been deleted (Soft deletes are used) |
| source    | String (enum) | Can be `'user'` or `'api'`, indicates who added the fact to the DB |
| used      | Boolean       | Weather or not the `Fact` has been sent by the CatBot. This value is reset each time every `Fact` is used |
| type      | String        | Type of animal the `Fact` describes (e.g. 'cat', 'dog', 'horse')