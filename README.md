# Quiz Game Hub

A browser based collection of quick games: topic quizzes, a survival quiz mode, a reaction speed test, and a memory matching game. The project uses plain HTML, CSS, and JavaScript, so there is no package installation or build step.

## Run the game

Open [`quiz-game/INDEX.html`](quiz-game/INDEX.html) in a modern browser. The built-in quiz categories, reaction test, and memory match work offline.

For online trivia questions, serve the repository root through a local web server so the browser can make the Open Trivia Database request:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/quiz-game/INDEX.html` in your browser.

## Games and features

- **Classic quiz:** Choose General Knowledge, Mathematics, Computer Science, Geography, or Science. Select a short, standard, or full question set and set 10, 15, or 20 seconds per question.
- **Survival mode:** Answer correctly before time runs out; a wrong answer or timeout ends the run.
- **Reaction test:** Wait for the green prompt, then click as quickly as possible. Early clicks are detected and your best time is saved.
- **Memory match:** Match eight pairs and track your moves.
- **Game hub:** Switch between light and dark themes, review saved quiz scores, and use number keys 1–4 to answer quiz questions.

Quiz history, theme preference, and reaction best time are stored in the browser's local storage.

## Project structure

```text
quiz-game/
  INDEX.html   Game screens and page structure
  dad.css      Layout, themes, and responsive styles
  game.js      Quiz and mini-game behavior
```

The other HTML and JavaScript files in the repository root are separate learning exercises and are not required by the game hub.

## Online trivia

The optional Random Questions category fetches multiple-choice questions from [Open Trivia Database](https://opentdb.com/). If the request fails, the quiz falls back to the built in General Knowledge questions.
