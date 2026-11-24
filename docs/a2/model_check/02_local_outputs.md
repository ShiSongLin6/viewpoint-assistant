# Local executed outputs

Run on 2026-11-17 (Europe/London): `parsePrompt` from the local `prototype/viewpoint.js`, once per input, Node.js v22.16.0. These are the program's outputs, not correct answers.

HEAD: dff2af6ba5cf8408893467e6c7eb43e67dacf167

SHA-256: 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645

Distribution: 7 clear / 6 ambiguous / 7 none. This is not an accuracy figure.

| ID | Input | kind | theta | phi | Matched terms |
|---|---|---|---|---|---|
| 1 | a cat, top-down view | clear | null | 90 | top-down |
| 2 | a cat seen from above | ambiguous | — | — | from above |
| 3 | a cat looking up at the camera | ambiguous | — | — | looking up |
| 4 | a car door with a rear view mirror | clear | 180 | null | rear view |
| 5 | the cat turned away from the camera | none | — | — |  |
| 6 | shot from the camera behind the cat | ambiguous | — | — | shot from |
| 7 | an over the shoulder shot | ambiguous | — | — | over the shoulder |
| 8 | the camera at 30 degrees elevation | none | — | — |  |
| 9 | the cat from three-quarters behind | none | — | — |  |
| 10 | shot from the balcony above | ambiguous | — | — | from the balcony |
| 11 | a close-up of the cat's face | none | — | — |  |
| 12 | a cat, 45 degree angle | clear | null | 45 | 45 degree |
| 13 | slightly high angle | clear | null | 50 | high angle |
| 14 | portrait | none | — | — |  |
| 15 | a three-quarter rear view | clear | 135 | null | three-quarter rear |
| 16 | a 3/4 rear view | clear | 180 | null | rear view |
| 17 | a rear view | clear | 180 | null | rear view |
| 18 | a portrait facing the camera | none | — | — |  |
| 19 | a side-on view | none | — | — |  |
| 20 | the cat seen from below | ambiguous | — | — | from below |

Full return values:

```json
[
  {
    "id": 1,
    "input": "a cat, top-down view",
    "kind": "clear",
    "theta": null,
    "phi": 90,
    "terms": [
      "top-down"
    ],
    "label": "top-down"
  },
  {
    "id": 2,
    "input": "a cat seen from above",
    "kind": "ambiguous",
    "reason": "The phrase \"from above\" suggests somewhere above the subject but does not give one exact angle.",
    "terms": [
      "from above"
    ],
    "candidates": [
      {
        "theta": 0,
        "phi": 55
      },
      {
        "theta": 325,
        "phi": 40
      },
      {
        "theta": 35,
        "phi": 40
      }
    ]
  },
  {
    "id": 3,
    "input": "a cat looking up at the camera",
    "kind": "ambiguous",
    "reason": "The phrase \"looking up\" suggests somewhere below the subject but does not give one exact angle.",
    "terms": [
      "looking up"
    ],
    "candidates": [
      {
        "theta": 0,
        "phi": -45
      },
      {
        "theta": 325,
        "phi": -25
      },
      {
        "theta": 35,
        "phi": -25
      }
    ]
  },
  {
    "id": 4,
    "input": "a car door with a rear view mirror",
    "kind": "clear",
    "theta": 180,
    "phi": null,
    "terms": [
      "rear view"
    ],
    "label": "back view"
  },
  {
    "id": 5,
    "input": "the cat turned away from the camera",
    "kind": "none",
    "terms": []
  },
  {
    "id": 6,
    "input": "shot from the camera behind the cat",
    "kind": "ambiguous",
    "reason": "The prompt mentions \"shot from\" but no viewpoint word I can map to an angle.",
    "terms": [
      "shot from"
    ],
    "candidates": [
      {
        "theta": 0,
        "phi": 10
      },
      {
        "theta": 45,
        "phi": 30
      },
      {
        "theta": 0,
        "phi": 90
      }
    ]
  },
  {
    "id": 7,
    "input": "an over the shoulder shot",
    "kind": "ambiguous",
    "reason": "The phrase \"over the shoulder\" suggests behind and above the subject but does not give one exact angle.",
    "terms": [
      "over the shoulder"
    ],
    "candidates": [
      {
        "theta": 160,
        "phi": 25
      },
      {
        "theta": 200,
        "phi": 25
      },
      {
        "theta": 180,
        "phi": 40
      }
    ]
  },
  {
    "id": 8,
    "input": "the camera at 30 degrees elevation",
    "kind": "none",
    "terms": []
  },
  {
    "id": 9,
    "input": "the cat from three-quarters behind",
    "kind": "none",
    "terms": []
  },
  {
    "id": 10,
    "input": "shot from the balcony above",
    "kind": "ambiguous",
    "reason": "The phrase \"from the balcony\" suggests somewhere above the subject but does not give one exact angle.",
    "terms": [
      "from the balcony"
    ],
    "candidates": [
      {
        "theta": 0,
        "phi": 55
      },
      {
        "theta": 325,
        "phi": 40
      },
      {
        "theta": 35,
        "phi": 40
      }
    ]
  },
  {
    "id": 11,
    "input": "a close-up of the cat's face",
    "kind": "none",
    "terms": []
  },
  {
    "id": 12,
    "input": "a cat, 45 degree angle",
    "kind": "clear",
    "theta": null,
    "phi": 45,
    "terms": [
      "45 degree"
    ],
    "label": "45° high angle"
  },
  {
    "id": 13,
    "input": "slightly high angle",
    "kind": "clear",
    "theta": null,
    "phi": 50,
    "terms": [
      "high angle"
    ],
    "label": "high angle"
  },
  {
    "id": 14,
    "input": "portrait",
    "kind": "none",
    "terms": []
  },
  {
    "id": 15,
    "input": "a three-quarter rear view",
    "kind": "clear",
    "theta": 135,
    "phi": null,
    "terms": [
      "three-quarter rear"
    ],
    "label": "three-quarter rear view"
  },
  {
    "id": 16,
    "input": "a 3/4 rear view",
    "kind": "clear",
    "theta": 180,
    "phi": null,
    "terms": [
      "rear view"
    ],
    "label": "back view"
  },
  {
    "id": 17,
    "input": "a rear view",
    "kind": "clear",
    "theta": 180,
    "phi": null,
    "terms": [
      "rear view"
    ],
    "label": "back view"
  },
  {
    "id": 18,
    "input": "a portrait facing the camera",
    "kind": "none",
    "terms": []
  },
  {
    "id": 19,
    "input": "a side-on view",
    "kind": "none",
    "terms": []
  },
  {
    "id": 20,
    "input": "the cat seen from below",
    "kind": "ambiguous",
    "reason": "The phrase \"from below\" suggests somewhere below the subject but does not give one exact angle.",
    "terms": [
      "from below"
    ],
    "candidates": [
      {
        "theta": 0,
        "phi": -45
      },
      {
        "theta": 325,
        "phi": -25
      },
      {
        "theta": 35,
        "phi": -25
      }
    ]
  }
]
```
