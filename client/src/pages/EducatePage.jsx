import { useState } from "react";

import LessonCard from "../components/LessonCard";
import QuizCard from "../components/QuizCard";
import { lessons } from "../data/lessons";

function EducatePage() {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];

  return (
    <div className="page-content">
      <section className="card educate-hero">
        <div>
          <p className="eyebrow">Educate</p>
          <h2>Build safer habits with quick, calm scam-safety lessons.</h2>
        </div>
        <p className="supporting-copy">
          These teach-back micro-lessons are designed to be easy to finish in under a minute. Pick
          a topic, learn one warning sign, and answer one quick question to lock in the habit.
        </p>
      </section>

      <section className="educate-layout">
        <aside className="card lesson-library">
          <div className="section-heading lesson-library-heading">
            <div>
              <p className="eyebrow">Micro-lessons</p>
              <h2>{lessons.length} quick safety refreshers</h2>
            </div>
            <p className="supporting-copy">
              Each lesson focuses on one practical move you can use the next time a message feels
              off.
            </p>
          </div>

          <div className="lesson-grid">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isActive={lesson.id === activeLesson.id}
                onSelect={setActiveLessonId}
              />
            ))}
          </div>
        </aside>

        <div className="lesson-detail-stack">
          <section className="card lesson-detail">
            <p className="eyebrow">Selected lesson</p>
            <h2>{activeLesson.title}</h2>
            <div className="lesson-copy">
              {activeLesson.explanation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="warning-sign-panel">
              <span className="warning-sign-label">Scam warning sign</span>
              <p>{activeLesson.warningSign}</p>
            </div>
          </section>

          <QuizCard lesson={activeLesson} />
        </div>
      </section>
    </div>
  );
}

export default EducatePage;
