import { useEffect, useState, useRef, Suspense } from 'react';
import Texts from '../assets/texts';
import { useTyping, type PerformanceEntry } from '../context/TypingContext';
import PerformanceChart from './Graph';

export default function TypingContent() {
  const { info, updateInfo } = useTyping();

  const [text, setText] = useState('');
  const [isRunning, setIsRunning] = useState(info.isRunning);
  const [actualLine, setActualLine] = useState(0);
  const [time, setTime] = useState(15);
  const [charTyped, setCharTyped] = useState<PerformanceEntry[]>(info.data);
  const [totalTyped, setTotalTyped] = useState(info.totalTyped);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>(info.language);
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>(
    info.difficulty,
  );

  const exampleText = useRef(
    Texts[language][Math.floor(Math.random() * Texts[language].length)],
  );
  const currentErrors = useRef(0);
  const totalTypedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const second = useRef(0);

  const difficultyHtml: { label: string; value: 'normal' | 'hard' }[] = [
    { label: 'Normal', value: 'normal' },
    { label: 'Difícil', value: 'hard' },
  ];
  const timeHtml = [15, 30, 60, 120];
  const languageHtml: { label: string; value: 'pt-BR' | 'en-US' }[] = [
    { label: 'Português', value: 'pt-BR' },
    { label: 'English', value: 'en-US' },
  ];

  function checkChar(expected: string, actual: string) {
    return expected === actual;
  }

  function reset() {
    setText('');
    setActualLine(0);
    setCharTyped([]);
    setTotalTyped(0);
    setIsRunning(false);
    currentErrors.current = 0;
    totalTypedRef.current = 0;
    second.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    exampleText.current =
      Texts[language][Math.floor(Math.random() * Texts[language].length)];
    updateInfo({ isRunning: false, data: [], totalTyped: 0, currentErrors: 0 });
  }

  function handleInput(typedChar: string, idx: number, chars: string) {
    const expected = chars[idx];

    if (checkChar(expected, typedChar)) {
      setTotalTyped((n) => {
        const newTotal = n + 1;
        totalTypedRef.current = newTotal;
        return newTotal;
      });
      return true;
    } else {
      currentErrors.current++;
      return false;
    }
  }

  function savePerformance() {
    setCharTyped((prev) => {
      const totalChars = prev.reduce((acc, entry) => acc + entry.chars, 0);
      const totalErrors = prev.reduce((acc, entry) => acc + entry.errors, 0);

      const newState = [
        ...prev,
        {
          second: second.current,
          chars: totalTypedRef.current - totalChars,
          errors: currentErrors.current - totalErrors,
        },
      ];
      console.log('Performance:', newState);

      return newState;
    });
  }

  function startTimer() {
    updateInfo({ isRunning: true });
    setIsRunning(true);
    second.current = 0;
    timerRef.current = setInterval(() => {
      if (second.current >= timeRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
        setIsRunning(false);
        setCharTyped((charTyped) => {
          setTotalTyped((totalTyped) => {
            updateInfo({
              isRunning: false,
              data: charTyped,
              totalTyped,
              currentErrors: currentErrors.current,
            });
            return totalTyped;
          });
          return charTyped;
        });
        return;
      }
      second.current++;
      savePerformance();
    }, 1000);
  }

  // Difficulty and input handling
  useEffect(() => {
    if (text.length === 0) return;

    const correct = handleInput(
      text[text.length - 1],
      text.length - 1,
      exampleText.current.content[actualLine],
    );

    if (!correct) {
      if (difficulty === 'hard') {
        setText('');
        return;
      } else {
        setText((prev) => prev.slice(0, -1));
        return;
      }
    }

    if (text === exampleText.current.content[actualLine]) {
      setActualLine((prev) => prev + 1);
      setText('');
    }

    // Line completion and end handling
    if (exampleText.current.content[actualLine] === undefined) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      second.current++;
      savePerformance();
      setIsRunning(false);
      updateInfo({
        isRunning: false,
        data: charTyped,
        totalTyped,
        currentErrors: currentErrors.current,
      });
    }
  }, [text, actualLine]);

  // Performance update handling
  useEffect(() => {
    updateInfo({
      isRunning,
      data: charTyped,
      totalTyped,
      currentErrors: currentErrors.current,
    });
  }, [charTyped]);

  // Time change handling
  useEffect(() => {
    timeRef.current = time;
    if (timeRef.current === second.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = null;
      updateInfo({ isRunning: false });
      setIsRunning(false);
    }
  }, [time]);

  // Start timer on first key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !timerRef.current) {
        startTimer();
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
    }

    setTime(exampleText.current.default_time);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Language change handling
  useEffect(() => {
    reset();
  }, [language]);

  return (
    <section className="typing-content">
      <span>Welcome to the Typing Content Component!</span>
      <div>
        <h2>Configurações</h2>
        <div className="language-select">
          {languageHtml.map((l) => (
            <label key={l.value}>
              <input
                type="radio"
                checked={language === l.value}
                onChange={() => setLanguage(l.value)}
                name="language"
                disabled={isRunning}
              />{' '}
              {l.label}
            </label>
          ))}
        </div>
        <div className="timer-select">
          {timeHtml.map((t) => (
            <span key={t}>
              <label>
                <input
                  type="radio"
                  checked={time === t}
                  onChange={() => setTime(t)}
                  name="time"
                  disabled={isRunning}
                />{' '}
                {t} {language === 'pt-BR' ? 'segundos' : 'seconds'}
              </label>
            </span>
          ))}
        </div>
        <div className="difficulty-select">
          {difficultyHtml.map((d) => (
            <label key={d.value}>
              <input
                type="radio"
                name="difficulty"
                checked={difficulty === d.value}
                onChange={() => setDifficulty(d.value)}
                disabled={isRunning}
              />{' '}
              {d.label === 'Difícil'
                ? language === 'pt-BR'
                  ? 'Difícil'
                  : 'Hard'
                : d.label}
            </label>
          ))}
        </div>
      </div>
      <div className="text-display">
        <input
          type="text"
          ref={inputRef}
          value={text}
          onChange={({ target }) => {
            setText(target.value);
          }}
          maxLength={exampleText.current.content[actualLine]?.length || 0}
          disabled={
            second.current >= time ||
            actualLine >= exampleText.current.content.length
          }
          onKeyDown={(e) => {
            if (e.key === 'Backspace' || e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder={exampleText.current.content[actualLine] ? '' : 'Fim do teste'}
        />
        <div>{exampleText.current.content[actualLine]}</div>
        <div>{text}</div>
      </div>
      <div>
        <h2>Estatísticas</h2>
        <div>
          <div>Total digitado: {totalTyped} caracteres</div>
          <div>Erros: {currentErrors.current}</div>
          <div>Tempo: {second.current} segundos</div>
        </div>
        <button onClick={() => reset()}>Resetar</button>
      </div>
      {isRunning ? (
        <div style={{ padding: 20, color: '#999' }}>
          O teste está em andamento... Gráfico será atualizado ao final.
        </div>
      ) : (
        <Suspense fallback={<div>Carregando gráfico...</div>}>
          <PerformanceChart info={info} />
        </Suspense>
      )}
    </section>
  );
}
