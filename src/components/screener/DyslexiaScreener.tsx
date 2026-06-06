'use client';

import { useState, useCallback } from 'react';
import {
  SCREENER_QUESTIONS, SCALE_OPTIONS, calculateResults,
  type UserType, type RiskLevel, type ScreenerResult,
} from '@/lib/screener/data';
import styles from './Screener.module.css';

type Screen = 'intro' | 'questions' | 'results';

export default function DyslexiaScreener() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    new Array(SCREENER_QUESTIONS.length).fill(-1)
  );
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<ScreenerResult | null>(null);

  const totalQuestions = SCREENER_QUESTIONS.length;
  const question = SCREENER_QUESTIONS[currentQ];
  const progressPct = ((currentQ + 1) / totalQuestions) * 100;

  const selectAnswer = useCallback((value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = value;
      return next;
    });
  }, [currentQ]);

  const nextQuestion = useCallback(() => {
    if (answers[currentQ] === -1) return;
    if (currentQ >= totalQuestions - 1) {
      const r = calculateResults(answers);
      setResult(r);
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentQ((prev) => prev + 1);
    setShowHelp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQ, answers, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentQ <= 0) return;
    setCurrentQ((prev) => prev - 1);
    setShowHelp(false);
  }, [currentQ]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Dyslexia Screener',
      text: 'I just took the DyslexiaWrite dyslexia screener. Try it yourself:',
      url: 'https://www.dyslexiawrite.com/screener',
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert('Link copied!');
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!result) return;
    const summary = [
      'DyslexiaWrite Screener Results',
      `Score: ${result.totalScore} / ${result.maxScore} (${result.pct}%)`,
      `Level: ${result.level === 'low' ? 'Few indicators' : result.level === 'moderate' ? 'Some indicators' : 'Several indicators'}`,
      '',
      'Breakdown:',
      ...result.domains.map((d) => `  ${d.name}: ${d.pct}%`),
      '',
      'This is a screening tool, not a diagnosis.',
      'For professional assessment: bdadyslexia.org.uk',
      'Try DyslexiaWrite: dyslexiawrite.com',
    ].join('\n');
    navigator.clipboard.writeText(summary);
    alert('Results copied to clipboard. You can paste them into a document or email.');
  }, [result]);

  const handleReset = useCallback(() => {
    setScreen('intro');
    setUserType(null);
    setCurrentQ(0);
    setAnswers(new Array(totalQuestions).fill(-1));
    setResult(null);
    setShowHelp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalQuestions]);

  // ── INTRO ──
  if (screen === 'intro') {
    return (
      <div className={styles.wrap}>
        <div className={styles.introHeader}>
          <span className={styles.introIcon}>🔍</span>
          <h1 className={styles.introTitle}>Could it be dyslexia?</h1>
          <p className={styles.introSub}>
            A quick, free screener to help you understand whether your
            reading and writing experiences might be linked to dyslexia.
          </p>
        </div>

        <div className={`${styles.infoBox} ${styles.infoTeal}`}>
          <strong>This is not a diagnosis</strong>
          This screener identifies indicators commonly associated with dyslexia.
          Only a qualified professional can formally diagnose dyslexia.
          Think of this as a helpful first step.
        </div>

        <div className={`${styles.infoBox} ${styles.infoAmber}`}>
          <strong>Takes about 5 minutes</strong>
          20 questions across five areas: reading and writing, sound processing,
          memory, organisation, and personal history. There are no right or
          wrong answers.
        </div>

        <div className={styles.whoLabel}>Who is this screener for?</div>
        <div className={styles.whoPills}>
          {([
            { id: 'adult' as UserType, icon: '👤', label: "I'm an adult" },
            { id: 'young' as UserType, icon: '🧑‍🎓', label: "I'm a young person" },
            { id: 'parent' as UserType, icon: '👨‍👧', label: 'For my child' },
          ]).map((w) => (
            <button
              key={w.id}
              className={`${styles.whoPill} ${userType === w.id ? styles.whoPillSelected : ''}`}
              onClick={() => setUserType(w.id)}
            >
              <span className={styles.whoPillIcon}>{w.icon}</span>
              <span className={styles.whoPillLabel}>{w.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!userType}
          onClick={() => setScreen('questions')}
          style={{ opacity: userType ? 1 : 0.5, marginTop: 8 }}
        >
          Start the screener
        </button>

        <div className={`${styles.infoBox} ${styles.infoPurple}`} style={{ marginTop: 12 }}>
          <strong>Your privacy</strong>
          Your answers are processed on your device and are not stored or
          shared. You can save or share your results at the end if you choose to.
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  if (screen === 'questions') {
    return (
      <div className={styles.wrap}>
        <div className={styles.progressRow}>
          <span className={styles.progressDomain}>{question.domain}</span>
          <span className={styles.progressCount}>
            Question {currentQ + 1} of {totalQuestions}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>

        <div className={styles.qCard} key={currentQ}>
          <div className={styles.qNumber}>
            {question.domain} — Question {currentQ + 1}
          </div>
          <div className={styles.qText}>{question.text}</div>

          <button
            className={styles.qHelpToggle}
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? 'Hide explanation' : 'What does this mean?'}
          </button>

          {showHelp && (
            <div className={styles.qHelp}>{question.help}</div>
          )}

          <div className={styles.qScale}>
            {SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.qOption} ${
                  answers[currentQ] === opt.value ? styles.qOptionSelected : ''
                }`}
                onClick={() => selectAnswer(opt.value)}
              >
                <span className={styles.qOptNum}>{opt.value}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.btnRow}>
          {currentQ > 0 && (
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={prevQuestion}
            >
              ← Back
            </button>
          )}
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={nextQuestion}
            disabled={answers[currentQ] === -1}
            style={{ opacity: answers[currentQ] === -1 ? 0.5 : 1 }}
          >
            {currentQ >= totalQuestions - 1 ? 'See my results' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (screen === 'results' && result) {
    const RESULT_CONTENT: Record<RiskLevel, {
      icon: string; label: string; title: string; text: string; color: string;
    }> = {
      low: {
        icon: '💚', label: 'Few indicators', color: '#1D9E75',
        title: 'Your results show few dyslexia indicators',
        text: "Based on your answers, you show relatively few of the indicators commonly associated with dyslexia. This doesn't mean difficulties you experience aren't real — everyone's relationship with reading and writing is different. If you're still concerned, speaking to a professional is always worthwhile.",
      },
      moderate: {
        icon: '🔶', label: 'Some indicators', color: '#BA7517',
        title: 'Your results show some indicators associated with dyslexia',
        text: "Your answers suggest you experience several of the difficulties commonly associated with dyslexia. This doesn't mean you definitely have dyslexia — but it does suggest that a professional assessment could be helpful. Many people find that understanding why they experience these difficulties is the first step toward getting the right support.",
      },
      high: {
        icon: '💜', label: 'Several indicators', color: '#534AB7',
        title: 'Your results show several indicators commonly associated with dyslexia',
        text: "Your answers suggest you experience many of the difficulties commonly associated with dyslexia. We would recommend speaking to a qualified professional for a formal assessment. A diagnosis can unlock practical support — including assistive technology, workplace adjustments, and exam access arrangements — that can make a real difference to your daily life.",
      },
    };

    const content = RESULT_CONTENT[result.level];

    return (
      <div className={styles.wrap}>
        <div className={styles.resultCard}>
          <span className={styles.resultIcon}>{content.icon}</span>
          <div className={styles.resultLevel} style={{ color: content.color }}>
            {content.label}
          </div>
          <h2 className={styles.resultTitle}>{content.title}</h2>
          <p className={styles.resultText}>{content.text}</p>
          <div className={styles.resultScore}>
            <span className={styles.resultScoreNum} style={{ color: content.color }}>
              {result.totalScore}
            </span>
            <span>out of {result.maxScore}</span>
          </div>
        </div>

        <div className={styles.resultCard} style={{ textAlign: 'left' }}>
          <div className={styles.domainHead}>Your results by area</div>
          {result.domains.map((d, i) => {
            const barClass = d.pct < 30 ? styles.barLow : d.pct < 60 ? styles.barMid : styles.barHigh;
            return (
              <div key={i} className={styles.domainRow}>
                <div className={styles.domainName}>{d.name}</div>
                <div className={styles.domainBarTrack}>
                  <div className={`${styles.domainBarFill} ${barClass}`} style={{ width: `${d.pct}%` }} />
                </div>
                <div className={styles.domainPct}>{d.pct}%</div>
              </div>
            );
          })}
        </div>

        {result.level !== 'low' && (
          <div className={`${styles.infoBox} ${styles.infoTeal}`} style={{ textAlign: 'left' }}>
            <strong>Remember</strong>
            Dyslexia affects about 1 in 10 people. It has nothing to do with
            intelligence — many of the most creative, entrepreneurial, and
            innovative people in the world are dyslexic. If you do have dyslexia,
            understanding it is the first step. The right tools and support can
            transform your experience with reading and writing.
          </div>
        )}

        <div className={styles.nextStepsLabel}>What to do next</div>
        <div className={styles.nextSteps}>
          {(result.level === 'moderate' || result.level === 'high') && (
            <a
              href="https://www.bdadyslexia.org.uk/dyslexia/getting-a-diagnosis"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.nextStep}
            >
              <div className={`${styles.nextStepIcon} ${styles.nextStepPurple}`}>🔍</div>
              <div className={styles.nextStepText}>
                <div className={styles.nextStepTitle}>Get a professional assessment</div>
                <div className={styles.nextStepSub}>BDA guide to getting a dyslexia diagnosis</div>
              </div>
              <div className={styles.nextStepArrow}>→</div>
            </a>
          )}

          {userType === 'adult' && (
            <a
              href="https://www.gov.uk/access-to-work"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.nextStep}
            >
              <div className={`${styles.nextStepIcon} ${styles.nextStepAmber}`}>💷</div>
              <div className={styles.nextStepText}>
                <div className={styles.nextStepTitle}>Access to Work funding</div>
                <div className={styles.nextStepSub}>Government scheme that can fund assessment and assistive technology</div>
              </div>
              <div className={styles.nextStepArrow}>→</div>
            </a>
          )}

          {(userType === 'parent' || userType === 'young') && (
            <div className={styles.nextStep}>
              <div className={`${styles.nextStepIcon} ${styles.nextStepBlue}`}>🏫</div>
              <div className={styles.nextStepText}>
                <div className={styles.nextStepTitle}>Speak to your school&apos;s SENCO</div>
                <div className={styles.nextStepSub}>They can arrange screening and refer for formal assessment</div>
              </div>
              <div className={styles.nextStepArrow}>→</div>
            </div>
          )}

          <a href="/app" className={styles.nextStep}>
            <div className={`${styles.nextStepIcon} ${styles.nextStepTeal}`}>✍️</div>
            <div className={styles.nextStepText}>
              <div className={styles.nextStepTitle}>Try DyslexiaWrite</div>
              <div className={styles.nextStepSub}>AI-powered writing and reading support — free to start</div>
            </div>
            <div className={styles.nextStepArrow}>→</div>
          </a>

          <a
            href="https://www.bdadyslexia.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.nextStep}
          >
            <div className={`${styles.nextStepIcon} ${styles.nextStepPurple}`}>📚</div>
            <div className={styles.nextStepText}>
              <div className={styles.nextStepTitle}>Learn more about dyslexia</div>
              <div className={styles.nextStepSub}>British Dyslexia Association — information and support</div>
            </div>
            <div className={styles.nextStepArrow}>→</div>
          </a>
        </div>

        <div className={styles.btnRow} style={{ marginTop: 16 }}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSave}>
            Save results
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleShare}>
            Share screener
          </button>
        </div>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleReset}
          style={{ marginTop: 8 }}
        >
          Take the screener again
        </button>

        <div className={styles.disclaimer}>
          This screener is based on indicators commonly associated with dyslexia
          and is designed as an informational tool, not a diagnostic instrument.
          It should not be used as a substitute for a professional assessment by a
          qualified educational psychologist or specialist teacher assessor.
          Results are indicative only and are processed entirely on your device —
          your answers are not stored or transmitted.
          <br /><br />
          DyslexiaWrite Ltd · dyslexiawrite.com
        </div>
      </div>
    );
  }

  return null;
}
