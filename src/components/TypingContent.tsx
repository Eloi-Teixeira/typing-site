import { useEffect, useState, useRef, useMemo } from 'react';
import Texts from '../assets/texts';
import { useTyping, type PerformanceEntry } from '../context/TypingContext';
import PerformanceChart from './Graph';

export default function TypingContent() {
  const { info, updateInfo } = useTyping();

  const [text, setText] = useState('');
  const [isRunning, setIsRunning] = useState(info.isRunning);
  const [actualLine, setActualLine] = useState(0);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>(info.language);
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>(
    info.difficulty,
  );
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [allowError, setAllowError] = useState(true);
  const [isLangOption, setIsLangOption] = useState(false);
  const [isDiffOption, setIsDiffOption] = useState(false);
  const [isTimeOption, setIsTimeOption] = useState(false);

  const exampleText = useRef(
    Texts[language][Math.floor(Math.random() * Texts[language].length)],
  );

  const [time, setTime] = useState(exampleText.current.default_time);

  const charTypedRef = useRef<PerformanceEntry[]>(info.data);
  const totalTypedRef = useRef(info.totalTyped);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const currentErrors = useRef(0);
  const timeRef = useRef<number>(0);
  const second = useRef(0);
  const consecutiveErrors = useRef(0);

  const renderedText = useMemo(() => {
    const line = exampleText.current.content[actualLine];
    if (!line) return null;

    return line.split('').map((l, i) => (
      <span
        key={`${actualLine}-${i}`}
        className={`text-char ${
          i < text.length
            ? checkChar(l, text[i])
              ? 'correct'
              : 'incorrect'
            : ''
        } ${i === text.length ? 'current' : ''}`}
      >
        {l}
      </span>
    ));
  }, [actualLine, text, language]);

  const MAX_CONSECUTIVE_ERRORS = 3;
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
    if (!caseSensitive) {
      expected = expected.toLowerCase();
      actual = actual.toLowerCase();
    }
    return expected === actual;
  }

  function reset() {
    setText('');
    setActualLine(0);
    setIsRunning(false);
    currentErrors.current = 0;
    totalTypedRef.current = 0;
    charTypedRef.current = [];
    second.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    exampleText.current =
      Texts[language][Math.floor(Math.random() * Texts[language].length)];
    updateInfo({
      isRunning: false,
      data: [],
      totalTyped: 0,
      errors: 0,
    });
  }

  function handleInput(typedChar: string, idx: number, chars: string) {
    const expected = chars[idx];

    if (checkChar(expected, typedChar)) {
      consecutiveErrors.current = 0;
      totalTypedRef.current++;
      return true;
    } else {
      currentErrors.current++;
      totalTypedRef.current++;

      if (allowError && consecutiveErrors.current <= MAX_CONSECUTIVE_ERRORS) {
        consecutiveErrors.current++;
        return true;
      }
      return false;
    }
  }

  function savePerformance() {
    const totalChars = charTypedRef.current.reduce(
      (acc, entry) => acc + entry.chars,
      0,
    );
    const totalErrors = charTypedRef.current.reduce(
      (acc, entry) => acc + entry.errors,
      0,
    );

    const newState = [
      ...charTypedRef.current,
      {
        second: second.current,
        chars: totalTypedRef.current - totalChars,
        errors: currentErrors.current - totalErrors,
      },
    ];
    charTypedRef.current = newState;
    console.log('Performance:', newState);

    return newState;
  }

  function startTimer() {
    updateInfo({
      isRunning: true,
      textLength: exampleText.current.content.reduce(
        (acc, t) => t.length + acc,
        0,
      ),
    });
    setIsRunning(true);
    second.current = 0;
    timerRef.current = setInterval(() => {
      if (second.current >= timeRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
        setIsRunning(false);
        updateInfo({
          isRunning: false,
          data: charTypedRef.current,
          totalTyped: totalTypedRef.current,
          errors: currentErrors.current,
        
        });
        return;
      }
      second.current++;
      savePerformance();
    }, 1000);
  }

  // Difficulty and input handling
  useEffect(() => {
    if (!exampleText.current.content[actualLine]) return;
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

    if (
      text === exampleText.current.content[actualLine] ||
      (allowError &&
        text.length === exampleText.current.content[actualLine].length)
    ) {
      setActualLine((prev) => prev + 1);
      setText('');
    }
  }, [text]);

  // Line change handling
  useEffect(() => {
    if (
      exampleText.current.content[actualLine] === undefined &&
      actualLine > 0
    ) {
      // Acabou as linhas!
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      second.current++;
      savePerformance();
      setIsRunning(false);
      updateInfo({
        isRunning: false,
        data: charTypedRef.current,
        totalTyped: totalTypedRef.current,
        errors: currentErrors.current,
        
      });
    }
  }, [actualLine]);

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

  // Language change handling
  useEffect(() => {
    updateInfo({ language });
    reset();
  }, [language]);

  return (
    <section className="typing-content">
      <div className="settings">
        <section>
          <div>
            <label>
              <input
                type="checkbox"
                name="difficulty"
                checked={isLangOption}
                onChange={() => setIsLangOption(!isLangOption)}
                disabled={isRunning}
              />
              <span>{language === 'pt-BR' ? 'Línguagem' : 'Language'}</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="allowError"
                disabled={isRunning}
                checked={isDiffOption}
                onChange={() => setIsDiffOption(!isDiffOption)}
              />
              <span>{language === 'pt-BR' ? 'Dificuldade' : 'Difficulty'}</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="allowError"
                disabled={isRunning}
                checked={isTimeOption}
                onChange={() => setIsTimeOption(!isTimeOption)}
              />
              <span>Time</span>
            </label>
          </div>
          <div className="case-sensitive-select">
            <label>
              <input
                type="checkbox"
                name="caseSensitive"
                disabled={isRunning}
                checked={caseSensitive}
                onChange={() => setCaseSensitive(!caseSensitive)}
              />
              <span>Case Sensitive</span>
            </label>
          </div>
          <div className="allow-error-select">
            <label>
              <input
                type="checkbox"
                name="allowError"
                disabled={isRunning || difficulty === 'hard'}
                checked={allowError}
                onChange={() =>
                  setAllowError(difficulty === 'hard' ? false : !allowError)
                }
              />
              <span>Permitir erros</span>
            </label>
          </div>
        </section>
        <section>
          {isLangOption && (
            <div className="language-select">
              {languageHtml.map((l) => (
                <label key={l.value}>
                  <input
                    type="radio"
                    checked={language === l.value}
                    onChange={() => setLanguage(l.value)}
                    name="language"
                    disabled={isRunning}
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
          )}
          {isDiffOption && (
            <div className="difficulty-select">
              {difficultyHtml.map((d) => (
                <label key={d.value}>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === d.value}
                    onChange={() => setDifficulty(d.value)}
                    disabled={isRunning}
                  />
                  <span>
                    {d.label === 'Difícil'
                      ? language === 'pt-BR'
                        ? 'Difícil'
                        : 'Hard'
                      : d.label}
                  </span>
                </label>
              ))}
            </div>
          )}
          {isTimeOption && (
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
                    />
                    <span>{t}</span>
                  </label>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
      <div
        className="text-display"
        onClick={() => {
          if (!isRunning && text.length >= 1) {
            const confirmStart = window.confirm(
              language === 'pt-BR' ? 'Reiniciar o teste?' : 'Restart the test?',
            );
            if (confirmStart) {
              reset();
            }
          }
          inputRef.current?.focus();
        }}
      >
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
          onCopy={(e) => {
            e.preventDefault();
          }}
          onPaste={(e) => {
            e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (!allowError && (e.key === 'Backspace' || e.key === 'Enter')) {
              e.preventDefault();
            }
            if (e.key.length === 1 && !timerRef.current) {
              startTimer();
            }
          }}
          id="typing-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <label
          htmlFor="typing-input"
          className={`${!isRunning ? 'timeout' : ''}`}
        >
          {renderedText || (
            <span style={{ color: 'var(--green-500)' }}>Fim do texto!</span>
          )}
        </label>
        <span
          className="lines"
          title={
            language === 'pt-BR' ? 'Linhas completadas' : 'Completed lines'
          }
        >
          {actualLine}/{exampleText.current.content.length}
        </span>
      </div>
    </section>
  );
}
