## `Fact` endpoints

### Get some cat facts

Retrieve one or more cat facts.

##### Endpoint
`GET /facts/random`

##### Query parameters

| Parameter | Default | Limit | Description |
| --------- | ------- | ----- | ----------- |
| amount    | 1       | 100   | Number of cats to retrieve. If set to one, response will be a fact object. If many, response will be an array of facts. |

##### Example request
`GET /facts/random?amount=2`

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

### Get fact by ID

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

### Get pending facts

These are user-submitted facts that are waiting to be sent

##### Endpoint
`GET /facts`


##### Returns
An object containing an array of the pending facts, as well as an array of facts that the authenticated user submitted.

##### Example response

```
{
  "all": [
    {
      "_id": "5887e1d85c873e0011036889",
      "text": "Cats make about 100 different sounds. Dogs make only about 10.",
      "upvotes": [
        {
          "user": "588e677c06ac2b00110e59ae"
        },
        {
          "user": "588e6e8806ac2b00110e59c3"
        }
      ]
    },
    {
      "_id": "5894af975cdc7400113ef7f9",
      "text": "The technical term for a cat’s hairball is a bezoar.",
      "user": {
        "_id": "587288f6e6f85e64ae1c7ef7",
        "name": {
          "first": "Alex",
          "last": "Wohlbruck"
        }
      },
      "upvotes": [
        {
          "user": "5872812829f7f43cacb0c4de"
        }
      ]
    }
  ],
  "me": [
	{
      "_id": "590b9d90229d260020af0b06",
      "text": "Evidence suggests domesticated cats have been around since 3600 B.C., 2,000 years before Egypt's pharaohs.",
      "used": false,
      "upvotes": [
        {
          "user": "587288f6e6f85e64ae1c7ef7"
        }
      ]
    }
  ]
```