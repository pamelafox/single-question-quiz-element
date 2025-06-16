# single-question-quiz-element

A web component that creates an interactive quiz with a single question, multiple choice answers, and feedback.

## Usage

Include the component script in your HTML. Change `latest` to a specific version:

```html
<script src="https://cdn.jsdelivr.net/npm/single-question-quiz-element@latest/dist/single-question-quiz-element.umd.min.js"></script>
```

Then use the component in your HTML:

```html
<single-question-quiz-element name="my-quiz">
  <form class="bg-light rounded p-4">
    <div class="quiz-question">
      <p class="mb-4 fw-bold">Your question goes here?</p>

      <div class="form-check">
        <input class="form-check-input" type="radio" name="quizOptions" id="option1" value="0" data-correct="false" />
        <label class="form-check-label" for="option1">First answer option</label>
        <aside class="alert alert-danger mt-2" style="display: none">
          Feedback shown when this incorrect answer is selected.
        </aside>
      </div>

      <div class="form-check">
        <input class="form-check-input" type="radio" name="quizOptions" id="option2" value="1" data-correct="true" />
        <label class="form-check-label" for="option2">Second answer option (correct)</label>
        <aside class="alert alert-success mt-2" style="display: none">
          Feedback shown when this correct answer is selected.
        </aside>
      </div>

      <div class="mt-3">
        <button type="submit" class="btn btn-primary" data-action="submit">Submit Answer</button>
        <button type="button" class="btn btn-secondary" style="display: none" data-action="reset">Start over</button>
      </div>
      <aside class="alert alert-secondary mt-3" style="display: none">
        Optional general explanation shown after answer is submitted.
      </aside>
    </div>
  </form>
</single-question-quiz-element>
```

### Required HTML Structure

- The component must contain a `<form>` element
- Question options should be in `<div class="form-check">` elements
- Each option should have:
  - A radio input with `name="quizOptions"` and `data-correct="true/false"`
  - A label
  - An optional feedback `<aside>` that's shown when that option is selected
- Include submit/reset buttons with `data-action="submit"` and `data-action="reset"`
- Optional general explanation in an `<aside>` at the end

For many more examples, see index.html in the repository.

### Styling

The component uses Bootstrap classes by default. Include Bootstrap CSS in your page for the best appearance:

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
  rel="stylesheet"
  crossorigin="anonymous" />
```

## Contributing

Install packages:

```
npm install
```

Run the development server (with hot reloading):

```
npm run dev
```

Lint the code:

```
npm run lint
```

Format the code:

```
npm run format
```

Build the production version:

```
npm run build
```

Publish to npm:

```
npm publish
```