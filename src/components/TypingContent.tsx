import { useEffect, useState, useRef } from 'react';
import Texts from '../assets/texts';

interface PerformanceEntry {
  second: number;
  chars: number;
  errors: number;
}

export default function TypingContent() {
  const [text, setText] = useState('');
  const [charTyped, setCharTyped] = useState<PerformanceEntry[]>([]);
  const [actualLine, setActualLine] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>('en-US');
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>('normal');

  const exampleText = useRef(
    Texts[language][Math.floor(Math.random() * Texts[language].length)],
  );
  const [time, setTime] = useState<number>(15);

  const currentErrors = useRef(0);
  const totalTypedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const second = useRef(0);

  function checkChar(expected: string, actual: string) {
    return expected === actual;
  }

  function reset() {
    setText('');
    setActualLine(0);
    setCharTyped([]);
    setTotalTyped(0);
    currentErrors.current = 0;
    totalTypedRef.current = 0;
    second.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    exampleText.current =
      Texts[language][Math.floor(Math.random() * Texts[language].length)];
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

      const newState = [...prev, {
        second: second.current,
        chars: totalChars - totalTypedRef.current,
        errors: currentErrors.current - totalErrors,
      }];
      console.log('Performance:', newState);

      return newState;
    });
  }

  function startTimer() {
    second.current = 0;
    timerRef.current = setInterval(() => {
      if (second.current >= timeRef.current) {
        console.log('time up', time, second.current >= time);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
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
  }, [text, actualLine]);

 // Line completion and end handling
  useEffect(() => {
    if (exampleText.current.content[actualLine] === undefined) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      second.current++;
      savePerformance();
    }
  }, [actualLine]);

  // Time change handling
  useEffect(() => {
    timeRef.current = time;
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

  useEffect(() => {
    reset();
  }, [language]);

  return (
    <div className="typing-content">
      <span>Welcome to the Typing Content Component!</span>
      <div>
        <h2>Configurações</h2>
        <div className="language-select">
          <label>
            <input
              type="radio"
              checked={language === 'pt-BR'}
              onChange={() => setLanguage('pt-BR')}
              name="language"
            />{' '}
            Português
          </label>
          <label>
            <input
              type="radio"
              checked={language === 'en-US'}
              onChange={() => setLanguage('en-US')}
              name="language"
            />{' '}
            English
          </label>
        </div>
        <div className="timer-select">
          {[15, 30, 60, 120].map((t) => (
            <span key={t}>
              <label>
                <input
                  type="radio"
                  checked={time === t}
                  onChange={() => setTime(t)}
                  name="time"
                />{' '}
                {t} {language === 'pt-BR' ? 'segundos' : 'seconds'}
              </label>
            </span>
          ))}
        </div>
        <div className="difficulty-select">
          <label>
            <input
              type="radio"
              name="difficulty"
              checked={difficulty === 'normal'}
              onChange={() => setDifficulty('normal')}
            />{' '}
            Normal
          </label>
          <label>
            <input
              type="radio"
              name="difficulty"
              checked={difficulty === 'hard'}
              onChange={() => setDifficulty('hard')}
            />{' '}
            {language === 'pt-BR' ? 'Difícil' : 'Hard'}
          </label>
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
          disabled={second.current >= time || actualLine >= exampleText.current.content.length}
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
    </div>
  );
}
