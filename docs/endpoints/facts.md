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
```json

  {
    "used": false,
    "source": "api",
    "type": "cat",
    "deleted": false,
    "_id": "591f98783b90f7150a19c19f",
    "__v": 0,
    "text": "A cat's jaw has only up and down motion; it does not have any lateral, side to side motion, like dogs and humans.",
    "updatedAt": "2020-01-02T02:02:48.616Z",
    "createdAt": "2018-01-04T01:10:54.673Z",
    "status": {
      "verified": true,
      "sentCount": 1
    },
    "user": "5a9ac18c7478810ea6c06381"
  },
  {
    "used": false,
    "source": "user",
    "type": "cat",
    "deleted": false,
    "_id": "58e007cc0aac31001185ecf5",
    "user": "58e007480aac31001185ecef",
    "text": "Cats are the most popular pet in the United States: There are 88 million pet cats and 74 million dogs.",
    "__v": 0,
    "updatedAt": "2020-01-02T02:02:48.616Z",
    "createdAt": "2018-03-01T21:20:02.713Z",
    "status": {
      "verified": true,
      "sentCount": 1
    }
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
```json
{
  "used": false,
  "source": "api",
  "type": "cat",
  "deleted": false,
  "_id": "591f98803b90f7150a19c229",
  "__v": 0,
  "text": "In an average year, cat owners in the United States spend over $2 billion on cat food.",
  "updatedAt": "2020-01-02T02:02:48.616Z",
  "createdAt": "2018-01-04T01:10:54.673Z",
  "status": {
    "verified": true,
    "sentCount": 1
  },
  "user": "5a9ac18c7478810ea6c06381"
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

```json
{
  "all": [
    {
      "_id": "5b01a447c6914f0014cc9a30",
      "text": "The special sensory organ called the Jacobson's organ allows a cat to have 14 times the sense of smell of a human. It consists of two fluid-filled sacs that connect to the cat's nasal cavity and is located on the roof of their mouth behind their teeth.",
      "type": "cat",
      "user": {
        "_id": "5a9ac18c7478810ea6c06381",
        "name": {
          "first": "Alex",
          "last": "Wohlbruck"
        }
      },
      "upvotes": 4,
      "userUpvoted": false
    },
    {
      "_id": "58e008800aac31001185ed07",
      "text": "Wikipedia has a recording of a cat meowing, because why not?",
      "type": "cat",
      "user": {
        "_id": "58e007480aac31001185ecef",
        "name": {
          "first": "Kasimir",
          "last": "Schulz"
        }
      },
      "upvotes": 3,
      "userUpvoted": false
    }
  ],
  "me": [
    {
      "_id": "591d9bb2227c1a0020d26826",
      "text": "The CIA spent US$20 million in the 60s training cats to spy on the Soviets. The first spy cat was hit by a taxi.",
      "type": "cat",
      "used": true,
      "upvotes": 17,
      "userUpvoted": false
    }
  ]
}
```