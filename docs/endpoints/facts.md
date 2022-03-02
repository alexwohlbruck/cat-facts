## `Fact` endpoints

### Get some facts

Retrieve one or more `Facts`.

##### Endpoint
`GET /facts/random`

##### Query parameters

| Parameter   | Type                   | Default | Limit | Description                                                                                                                                           |
| ----------- | ---------------------- | ------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| animal_type | Comma-separated String | 'cat'   |       | Type of animal the fact will describe                                                                                       |
| amount      | Number                 | 1       | 500   | Number of `Facts` to retrieve. If set to one, response will be a fact object. If many, response will be an array of `Fact`s |

##### Example request
`GET /facts/random?animal_type=cat&amount=2`

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
		"sentCount": 5
	},
	{
		"_id": "591f9854c5cbe314f7a7ad34",
		"__v": 0,
		"text": "It has been scientifically proven that stroking a cat can lower one's blood pressure.",
		"updatedAt": "2018-01-04T01:10:54.673Z",
		"deleted": false,
		"source": "api",
		"sentCount": 3
	}
]
```

---

### Get fact by its ID

Retrieve fact by its ID. 

### Endpoint
`GET /facts/:factID`

##### Query parameters

| Parameter   | Type                   | Default | Limit | Description |
| ----------- | ---------------------- | ------- | ----- | ----------- |
| animal_type | Comma-separated String | 'cat'   |       | Type of animal the fact will describe |

##### Example request
`GET /facts/591f98803b90f7150a19c229`

##### Example response
```json
{
    "_id": "591f98803b90f7150a19c229",
    "__v": 0,
    "text": "In an average year, cat owners in the United States spend over $2 billion on cat food.",
    "updatedAt": "2018-01-04T01:10:54.673Z",
    "deleted": false,
    "source": "api",
}
```

---

### Get queued facts

These are `Facts` belonging to the authenticated user.

##### Endpoint
`GET /facts/me`

##### Query parameters

| Parameter   | Type                   | Default | Limit | Description |
| ----------- | ---------------------- | ------- | ----- | ----------- |
| animal_type | Comma-separated String | 'cat'   |       | Type of animal the fact will describe |

##### Returns
An array of `Facts` that the authenticated user has submitted.

##### Example request
`GET /facts?animal_type=cat,horse`

##### Example response

```
[
  {
    "type": "cat",
    "_id": "590b9d90229d260020af0b06",
    "user": {
      "name": {
        "first": "Alex",
        "last": "Wohlbruck"
      },
      "_id": "5a9ac18c7478810ea6c06381"
    },
    "text": "Evidence suggests domesticated cats have been around since 3600 B.C., 2,000 years before Egypt's pharaohs."
  },
  {
    "type": "cat",
    "_id": "591f7aab0cf1d60ee8afcd62",
    "text": "The cat's clavicle, or collarbone, does not connect with other bones but is buried in the muscles of the shoulder region. This lack of a functioning collarbone allows them to fit through any opening the size of their head.",
    "user": {
      "name": {
        "first": "Alex",
        "last": "Wohlbruck"
      },
      "_id": "5a9ac18c7478810ea6c06381"
    }
  }
]
```
