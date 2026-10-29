# Studybuddy

A small, local flashcard study page. It runs in your browser and reads question sets from JSON files on your device.

## Open it

Open `index.html` in a modern browser. No server, account, or build step is needed.

## Load a question set

Click **Add question set** (or **Choose a JSON file**) and select a `.json` file. You can also drag a JSON file onto the study area. The page accepts either a JSON array:

```json
[
  { "question": "What is the capital of France?", "answer": "Paris" },
  { "question": "What is 6 × 7?", "answer": "42" }
]
```

Or a named deck object:

```json
{
  "name": "Geography",
  "cards": [
    { "question": "What is the capital of France?", "answer": "Paris" }
  ]
}
```

Each card needs non-empty `question` and `answer` strings. `examples/sample-questions.json` is included as a starter deck.

Click the card or **Show answer** to flip it. Use **Previous** and **Next**, or the left and right arrow keys to move between cards. Press Space to flip.

Question sets are read in your browser and are not uploaded.
