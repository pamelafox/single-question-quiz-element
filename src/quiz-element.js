import {LitElement} from 'lit';

export class QuizElement extends LitElement {
  // Don't create a shadow DOM, modify light DOM directly
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    const form = this.querySelector('form');
    if (!form) return;

    // Check if quiz needs shuffling
    const quizQuestion = this.querySelector('.quiz-question');
    if (quizQuestion && quizQuestion.hasAttribute('data-shuffle')) {
      this.shuffleOptions(quizQuestion);
    }

    // Add reset button handler
    const resetButton = form.querySelector('button[data-action="reset"]');
    const submitButton = form.querySelector('button[data-action="submit"]');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetQuiz(form));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check for text input question
      const textInput = form.querySelector('input[name="quizAnswer"]');
      if (textInput) {
        this.handleTextSubmission(form, textInput, submitButton, resetButton);
        return;
      }

      // Check for checkbox or radio inputs
      const selectedInputs = form.querySelectorAll('input[name="quizOptions"]:checked');
      if (selectedInputs.length > 0) {
        const isCheckbox = selectedInputs[0].type === 'checkbox';
        if (isCheckbox) {
          this.handleCheckboxSubmission(form, selectedInputs, submitButton, resetButton);
        } else {
          this.handleRadioSubmission(form, selectedInputs[0], submitButton, resetButton);
        }
      }
    });
  }

  shuffleOptions(quizQuestion) {
    const formChecks = Array.from(quizQuestion.querySelectorAll('.form-check'));
    if (formChecks.length === 0) return;
    
    const container = formChecks[0].parentElement;
    // Look for the button container instead of relying on Bootstrap class
    const buttonsContainer = quizQuestion.querySelector('div:has(button[data-action])');

    // Remove all form-checks
    formChecks.forEach(check => check.remove());
    
    // Shuffle the array
    for (let i = formChecks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [formChecks[i], formChecks[j]] = [formChecks[j], formChecks[i]];
    }
    
    // Re-insert in new order, before the buttons container
    formChecks.forEach(check => {
      container.insertBefore(check, buttonsContainer);
    });
  }

  handleRadioSubmission(form, selectedInput, submitButton, resetButton) {
    // Disable all radio inputs
    form.querySelectorAll('input[type="radio"]').forEach(input => {
      input.disabled = true;
    });

    // Hide all feedback asides first
    this.querySelectorAll('aside').forEach(aside => {
      aside.style.display = 'none';
    });

    // Show feedback based on correctness
    const isCorrect = selectedInput.getAttribute('data-correct') === 'true';
    const feedback = selectedInput.parentElement.querySelector('aside');
    if (feedback) {
      feedback.style.display = 'block';
    }
    
    // Show general explanation if it exists
    const generalExplanation = this.querySelector('div.quiz-question > aside:not([data-correct])');
    if (generalExplanation) {
      generalExplanation.style.display = 'block';
    }

    this.toggleButtons(submitButton, resetButton);
  }

  handleCheckboxSubmission(form, selectedInputs, submitButton, resetButton) {
    // Disable all checkbox inputs
    form.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.disabled = true;
    });

    // Hide all feedback asides first
    this.querySelectorAll('aside').forEach(aside => {
      aside.style.display = 'none';
    });

    // Show feedback for each selected answer
    selectedInputs.forEach(input => {
      const feedbackAside = input.parentElement.querySelector('aside');
      if (feedbackAside) {
        feedbackAside.style.display = 'block';
      }
    });

    // Show general explanation if it exists
    const generalExplanation = this.querySelector('div.quiz-question > aside:not([data-correct])');
    if (generalExplanation) {
      generalExplanation.style.display = 'block';
    }

    this.toggleButtons(submitButton, resetButton);
  }

  handleTextSubmission(form, textInput, submitButton, resetButton) {
    const regexCheck = textInput.getAttribute('data-regexcheck');
    
    // Hide all feedback asides first
    this.querySelectorAll('aside').forEach(aside => {
      aside.style.display = 'none';
    });

    // If no regexCheck, this is a free-form response
    if (!regexCheck) {
      textInput.disabled = true;
      // Show general explanation if it exists
      const generalExplanation = this.querySelector('div.quiz-question > aside');
      if (generalExplanation) {
        generalExplanation.style.display = 'block';
      }
      this.toggleButtons(submitButton, resetButton);
      return;
    }

    // Create a RegExp object that matches the exact string
    const regex = new RegExp(`^${regexCheck}$`);
    const isCorrect = regex.test(textInput.value.trim());

    // Add visual feedback to the text input
    textInput.style.backgroundColor = isCorrect ? '#e8f5e9' : '#ffebee';
    textInput.disabled = true;

    // Show the appropriate feedback based on correctness
    const feedback = this.querySelector(`aside[data-correct="${isCorrect}"]`);
    if (feedback) {
      feedback.style.display = 'block';
    }

    // Also show the general explanation for incorrect answers
    if (!isCorrect) {
      const generalExplanation = this.querySelector('div.quiz-question > aside:not([data-correct])');
      if (generalExplanation) {
        generalExplanation.style.display = 'block';
      }
    }

    this.toggleButtons(submitButton, resetButton);
  }

  toggleButtons(submitButton, resetButton) {
    // Hide submit button and show reset button
    if (submitButton) {
      submitButton.style.display = 'none';
    }
    if (resetButton) {
      resetButton.style.display = 'inline-block';
    }
  }

  resetQuiz(form) {
    // Re-enable all inputs and reset their values
    form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
      input.disabled = false;
      input.checked = false;
    });

    const textInput = form.querySelector('input[name="quizAnswer"]');
    if (textInput) {
      textInput.disabled = false;
      textInput.value = '';
      textInput.style.backgroundColor = '';
    }

    // Hide all feedback asides
    this.querySelectorAll('aside').forEach(aside => {
      aside.style.display = 'none';
    });

    // Show submit button and hide reset button
    const submitButton = form.querySelector('button[data-action="submit"]');
    const resetButton = form.querySelector('button[data-action="reset"]');
    if (submitButton) {
      submitButton.style.display = 'inline-block';
    }
    if (resetButton) {
      resetButton.style.display = 'none';
    }
  }
}

customElements.define('quiz-element', QuizElement);
