function LessonCard({ lesson, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={isActive ? "lesson-card active" : "lesson-card"}
      onClick={() => onSelect(lesson.id)}
    >
      <span className="lesson-duration">{lesson.duration}</span>
      <h3>{lesson.title}</h3>
      <p>{lesson.summary}</p>
    </button>
  );
}

export default LessonCard;
