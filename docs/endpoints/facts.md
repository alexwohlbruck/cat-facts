## `Fact` endpoints

### Get some facts

Retrieve one or more `Facts`.

##### Endpoint
`GET /facts/random`

##### Query parameters

| Parameter   | Type                   | Default | Limit | Description |
| ----------- | ---------------------- | ------- | ----- | ----------- |
| animal_type | Comma-separated String | 'cat'   |       | Type of animal the fact will describe |
| amount      | Number                 | 1       | 500   | Number of `Facts` to retrieve. If set to one, response will be a fact object. If many, response will be an array of `Fact`s |

##### Example request
`GET /facts/random?animal=cat&amount=2`

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

---

### Get fact by its ID

### Endpoint
`GET /facts/:factID`

##### Example request
`GET /facts/591f98803b90f7150a19c229`

##### Example response
```
{
    "_id": "591f98803b90f7150a19c229",
    "__v": 0,
    "text": "In an average year, cat owners in the United States spend over $2 billion on cat food.",
    "updatedAt": "2018-01-04T01:10:54.673Z",
    "deleted": false,
    "source": "api",
    "used": false
}
```

---

### Get queued facts

These are user-submitted `Facts` that are waiting to be sent

##### Endpoint
`GET /facts`

##### Query parameters

| Parameter   | Type                   | Default | Limit | Description |
| ----------- | ---------------------- | ------- | ----- | ----------- |
| animal_type | Comma-separated String | 'cat'   |       | Type of animal the fact will describe |

##### Returns
An object containing an array of the pending `Facts`, as well as an array of `Facts` that the authenticated user submitted.

##### Example request
`GET /facts?animal_type=cat,horse`

##### Example response

```
{
  "all": [
    {
      "_id": "5887e1d85c873e0011036889",
      "text": "Cats make about 100 different sounds. Dogs make only about 10.",
      type": "cat",
      "user": {
        "_id": "5c7da4bd70008708fb17c88f",
        "name": {
          "first": "Alex",
          "last": "Wohlbruck"
        }
      },
      "upvotes": 2,
      "userUpvoted": true
    },
    {
      "_id": "5894af975cdc7400113ef7f9",
      "text": "The technical term for a cat’s hairball is a bezoar.",
      "type": "cat",
      "user": {
        "_id": "587288f6e6f85e64ae1c7ef7",
        "name": {
          "first": "Alex",
          "last": "Wohlbruck"
        }
      },
      "upvotes": 1,
      "userUpvoted": false
    }
  ],
  "me": [
	{
      "_id": "5b1186a73bc85f0b2eb98c25",
      "text": "Horses cannot get cavities.",
      "type": "cat",
      "used": true,
      "upvotes": [
        {
          "user": "587288f6e6f85e64ae1c7ef7"
        }
      ]
    }
  ]
```