import { useState } from 'react';
import { Photo, SectionHead } from './primitives.jsx';
import { QUIZ_QUESTIONS, quizRecommendations } from '../data/quiz.js';

function QuizOption({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '18px 22px',
        background: active ? 'var(--brass)' : 'transparent',
        color: active ? '#1a1410' : 'var(--ink)',
        border: `1px solid ${active ? 'var(--brass)' : 'var(--line)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        font: 'inherit',
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--brass)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      <span className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{label}</span>
      <span style={{ fontSize: 13, opacity: active ? 0.78 : 0.7 }}>{sub}</span>
    </button>
  );
}

function QuizProgress({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < step ? 28 : 18,
            height: 4,
            borderRadius: 2,
            background: i < step ? 'var(--brass)' : 'var(--line)',
            transition: 'all 0.2s',
          }}
        />
      ))}
    </div>
  );
}

function QuizResults({ recs, onRestart }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="hand brass" style={{ fontSize: 22, transform: 'rotate(-2deg)', display: 'inline-block' }}>here you go —</div>
          <h3 className="h2" style={{ marginTop: 4 }}>Three to try.</h3>
        </div>
        <button type="button" onClick={onRestart} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>
          Start over
        </button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {recs.map((c, i) => (
          <div key={c.id} className="card" style={{ display: 'grid', gridTemplateColumns: '40px 90px 1fr auto', gap: 18, alignItems: 'center', padding: 18 }}>
            <div className="serif brass" style={{ fontSize: 30, lineHeight: 1, opacity: 1 - i * 0.25 }}>0{i + 1}</div>
            <Photo label="cigar" style={{ height: 64 }} />
            <div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{c.name}</div>
              <div className="mute" style={{ fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>{c.notes}</div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 6 }}>{c.origin} · {c.strength} · {c.size}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="serif brass" style={{ fontSize: 24 }}>${c.price}</div>
              <div className="mute" style={{ fontSize: 12 }}>{c.qty} in stock</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: 20, border: '1px dashed var(--line)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <span className="mute" style={{ fontSize: 14 }}>
          Screenshot this — or just tell us "the quiz sent me" when you come in.
        </span>
        <a href="#visit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
          Save it for later <span>→</span>
        </a>
      </div>
    </div>
  );
}

export default function PairingQuiz() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const total = QUIZ_QUESTIONS.length;
  const done = step >= total;
  const recs = done ? quizRecommendations(answers) : [];

  function answer(qid, value) {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setTimeout(() => setStep((s) => s + 1), 220);
  }
  function back() { if (step > 0) setStep((s) => s - 1); }
  function restart() { setAnswers({}); setStep(0); }

  const q = done ? null : QUIZ_QUESTIONS[step];

  return (
    <section id="pairing" className="section section-divider">
      <div className="wrap" style={{ maxWidth: 1040 }}>
        <SectionHead
          eyebrow="Find me one"
          title="A 30-second quiz."
          scribble="we'll do the picking"
          lead="Tell us what you're in the mood for. We'll match you to three cigars from the humidor that you'll probably love."
        />

        <div className="card" style={{ padding: '36px 44px', position: 'relative' }}>
          {!done && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span className="eyebrow brass">Question {step + 1} of {total}</span>
                <QuizProgress step={step} total={total} />
              </div>
              <h3 className="h2" style={{ fontSize: 36, marginBottom: 24 }}>{q.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="quiz-opts">
                {q.options.map((o) => (
                  <QuizOption
                    key={o.value}
                    label={o.label}
                    sub={o.sub}
                    active={answers[q.id] === o.value}
                    onClick={() => answer(q.id, o.value)}
                  />
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  style={{
                    background: 'transparent', border: 0,
                    color: step === 0 ? 'var(--ink-dim)' : 'var(--ink-mute)',
                    cursor: step === 0 ? 'default' : 'pointer',
                    font: 'inherit', fontSize: 14, padding: '6px 0',
                  }}
                >
                  ← Back
                </button>
                <span className="mute" style={{ fontSize: 13 }}>
                  Stuck? Just <a href="#visit" style={{ color: 'var(--brass)' }}>drop in</a> — Jimmy will pick for you.
                </span>
              </div>
            </>
          )}
          {done && <QuizResults recs={recs} onRestart={restart} />}
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .quiz-opts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
