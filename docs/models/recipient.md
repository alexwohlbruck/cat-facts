## `Recipient` Model

A person who is currently subscribed to recieve facts.

| Key            | Type          | Description |
| -------------- | ------------- | ----------- |
| name           | String        | The name of the `Recipient` |
| number         | String        | U.S. phone number of the `Recipient`, 10 digits, numeric only |
| addedBy        | ObjectId      | The ID of the `User` who added the `Recipient` |
| subscriptions[]| Array[String] | A list of animal types that the recipient is subscribed to |