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

  const currentErrors = useRef(0);
  const totalTypedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const exampleText = useRef(Texts[Math.floor(Math.random() * Texts.length)]);
  const second = useRef(0);

  function logSecond(
    second: number,
    lastTotal: number,
    currentTotal: number,
    errors: number,
  ): PerformanceEntry {
    return {
      second,
      chars: currentTotal - lastTotal,
      errors,
    };
  }

  function checkChar(expected: string, actual: string) {
    return expected === actual;
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

  const startTimer = () => {
    second.current = 0;
    timerRef.current = setInterval(() => {
      if (second.current >= exampleText.current.default_time) {
        console.log('time up');
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return;
      }

      setCharTyped((prev) => {
        const totalChars = prev.reduce((acc, entry) => acc + entry.chars, 0);
        const totalErrors = prev.reduce((acc, entry) => acc + entry.errors, 0);

        const newEntry = logSecond(
          second.current,
          totalChars,
          totalTypedRef.current,
          currentErrors.current - totalErrors,
        );
        const newState = [...prev, newEntry];

        console.log(newState);

        return newState;
      });
      second.current++;
    }, 1000);
  };

  useEffect(() => {
    if (text.length === 0) return;

    const correct = handleInput(
      text[text.length - 1],
      text.length - 1,
      exampleText.current.content[actualLine],
    );

    if (!correct) {
      setText('');
      return;
    }

    if (text === exampleText.current.content[actualLine]) {
      setActualLine((prev) => prev + 1);
      setText('');
    }
  }, [text, actualLine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !timerRef.current) {
        startTimer();
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="typing-content">
      <span>Welcome to the Typing Content Component!</span>
      <div className="text-display">
        <div>{exampleText.current.content[actualLine]}</div>
        <div>{text}</div>
        <div>Total digitado: {totalTyped} caracteres</div>
        <div>Erros: {currentErrors.current}</div>
        <div>Tempo: {second.current} segundos</div>
      </div>
      <input
        type="text"
        ref={inputRef}
        value={text}
        onChange={({ target }) => {
          setText(target.value);
        }}
        maxLength={exampleText.current.content[actualLine]?.length || 0}
        disabled={second.current >= exampleText.current.default_time}
        placeholder="Digite aqui..."
      />
    </div>
  );
}
