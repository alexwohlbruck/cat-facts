## `Fact` endpoints

### Get some cat facts

Retrieve one or more cat facts.

##### Endpoint
`GET /facts`

##### Query parameters

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| amount    | 1       | Number of cats to retrieve. If set to one, response will be a fact object. If many, response will be an array of facts. |

##### Example request
`GET /facts?amount=2`

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