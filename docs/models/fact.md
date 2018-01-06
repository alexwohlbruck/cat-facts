## `Fact` Model

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
| source    | String (enum) | Can be `user` or `api`, indicates who added the fact to the DB |
| used      | Boolean       | Weather or not the fact has been sent by the CatBot. This value is reset each time every fact is used |