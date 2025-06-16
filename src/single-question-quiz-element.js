import {LitElement} from 'lit';
import * as storage from './user-storage.js';

export class SingleQuestionQuizElement extends LitElement {
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
      resetButton.addEventListener('click', () => {
        this.resetQuiz(form);
        // Clear stored state when quiz is reset
        const quizId = this.generateQuizId(form);
        if (quizId) storage.set(quizId, null);
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check for text input question
      const textInput = form.querySelector('input[name="quizAnswer"]');
      if (textInput) {
        this.handleTextSubmission(form, textInput, submitButton, resetButton);
        this.saveQuizState(form);
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
        this.saveQuizState(form);
      }
    });

    // Attempt to restore previous state
    if (this.restoreQuizState(form)) {
      // If state was restored, automatically submit the quiz
      submitButton?.click();
    }
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

    // Count total correct answers
    const correctAnswers = form.querySelectorAll('input[type="checkbox"][data-correct="true"]');
    const selectedCorrectAnswers = Array.from(selectedInputs).filter(input => 
      input.getAttribute('data-correct') === 'true'
    );

    // If they've selected some but not all correct answers, show a special message
    if (selectedCorrectAnswers.length > 0 && selectedCorrectAnswers.length < correctAnswers.length) {
      const partialFeedback = document.createElement('aside');
      partialFeedback.className = 'alert alert-warning mt-2';
      const message = selectedCorrectAnswers.length === 1 
        ? "You've found a correct answer, but not all of them."
        : "You've found some correct answers, but there are more!";
      partialFeedback.innerHTML = message;
      form.querySelector('.quiz-question').insertBefore(partialFeedback, submitButton.parentElement);
    }

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

    // Hide all feedback asides, including any partial success feedback
    this.querySelectorAll('aside').forEach(aside => {
      aside.style.display = 'none';
      // Remove any dynamically added partial success feedback
      if (aside.classList.contains('alert-warning')) {
        aside.remove();
      }
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

  // Generate a unique quiz ID based on quiz name
  generateQuizId(form) {
    const name = this.getAttribute('name');
    console.log('Quiz name:', name);
    if (!name) {
      console.warn('Quiz element is missing a name attribute. State will not be saved.', this);
      return null;
    }
    return `quiz_${name}`;
  }

  // Save the current state of the quiz
  saveQuizState(form) {
    const quizId = this.generateQuizId(form);
    if (!quizId) return; // Don't save if no quiz ID (no name attribute)
    
    const state = {
      selectedInputs: Array.from(form.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        value: input.type === 'text' ? input.value : input.checked
      }))
    };
    storage.set(quizId, JSON.stringify(state));
  }

  // Restore previously saved state
  restoreQuizState(form) {
    const quizId = this.generateQuizId(form);
    if (!quizId) return false; // Don't restore if no quiz ID (no name attribute)
    
    const savedState = storage.get(quizId);
    if (!savedState) return false;
    
    try {
      const state = JSON.parse(savedState);
      state.selectedInputs.forEach(savedInput => {
        const input = form.querySelector(`input#${savedInput.id}`) || 
                     form.querySelector(`input[name="${savedInput.name}"]`);
        if (input) {
          if (input.type === 'text') {
            input.value = savedInput.value;
          } else {
            input.checked = savedInput.value;
          }
        }
      });
      return true;
    } catch (e) {
      console.error('Error restoring quiz state:', e);
      return false;
    }
  }
}

customElements.define('single-question-quiz-element', SingleQuestionQuizElement);
