## `Fact` Model

A single animal fact, (nearly) guaranteed to be genuine and factual.

| Key               | Type          | Description |
| ----------------- | ------------- | ----------- |
| _id               | ObjectId      | Unique ID for the `Fact` |
| _v                | Number        | Version number of the `Fact` |
| user              | ObjectId      | ID of the `User` who added the `Fact` |
| text              | String        | The `Fact` itself |
| updatedAt         | Timestamp     | Date in which `Fact` was last modified |
| sendDate          | Timestamp     | If the `Fact` is meant for one time use, this is the date that it is used |
| deleted           | Boolean       | Whether the `Fact` has been soft-deleted |
| source            | String        | Source from which the fact was found. Typically a URL |
| type              | String        | Type of animal the `Fact` describes (e.g. 'cat', 'dog', 'horse')
| status.verified   | Boolean       | Whether the fact has been appproved or rejected. `null` indicates pending status |
| status.feedback   | String        | Reason for the fact being approved or rejected |
| status.sentCount  | Number        | The number of times the `Fact` has been sent by the CatBot |
