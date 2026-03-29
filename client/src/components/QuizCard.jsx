import { useState } from "react";

function QuizCard({ lesson }) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { question } = lesson;
  const isCorrect = submitted && selectedAnswer === question.correctAnswer;

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedAnswer) {
      return;
    }

    setSubmitted(true);
  }

  function handleAnswerChange(answer) {
    setSelectedAnswer(answer);
    setSubmitted(false);
  }

  return (
    <section className="card quiz-card">
      <div className="quiz-header">
        <p className="eyebrow">Quick check</p>
        <h3>Teach-back question</h3>
      </div>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <p className="quiz-prompt">{question.prompt}</p>

        <div className="quiz-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option) => (
            <label
              key={option}
              className={
                selectedAnswer === option ? "quiz-option selected" : "quiz-option"
              }
            >
              <input
                type="radio"
                name={`quiz-${lesson.id}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => handleAnswerChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div className="quiz-actions">
          <button type="submit" className="primary-button" disabled={!selectedAnswer}>
            Check answer
          </button>
          <p className="help-copy">One small habit at a time builds safer instincts.</p>
        </div>
      </form>

      {submitted ? (
        <div className={isCorrect ? "quiz-feedback correct" : "quiz-feedback incorrect"}>
          <strong>{isCorrect ? question.feedback : "Not quite — the safest choice is to verify through an official source."}</strong>
          <p>{question.explanation}</p>
          <p className="quiz-takeaway">{question.takeaway}</p>
        </div>
      ) : null}
    </section>
  );
}

export default QuizCard;
