import { useEffect, useState } from 'react';
import Texts from '../assets/texts';

interface PerformanceEntry {
  second: number;
  charsTyped: number;
  errors: number;
}

function logSecond(
  second: number,
  lastTotal: number,
  currentTotal: number,
  errors: number,
): PerformanceEntry {
  return {
    second,
    charsTyped: currentTotal - lastTotal, // diferença de chars
    errors,
  };
}

function checkChar(expected: string, actual: string) {
  return expected === actual;
}

export default function TypingContent() {
  const [text, setText] = useState('');
  const [charTyped, setCharTyped] = useState<PerformanceEntry[]>([]);
  const [actualLine, setActualLine] = useState(0);
  const exampleText = Texts[Math.random() * (Text.length)];
  let totalTyped = 0;
  let currentErrors = 0;

  function handleInput(typedChar: string, idx: number, chars: string) {
    const expected = chars[idx];

    if (checkChar(expected, typedChar)) {
      totalTyped++;
      return true;
    } else {
      currentErrors++;
      return false;
    }
  }

  const startTimer = () => {
    let second = 0;
    const timer = setInterval(() => {
      second++;
      setCharTyped((prev) => {
        const errors = Math.abs(
          prev.reduce((acc, entry) => acc + entry.errors, 0) - currentErrors,
        );
        return [
          ...prev,
          logSecond(
            second,
            charTyped.length > 0
            ? charTyped[charTyped.length - 1].charsTyped
            : 0,
            totalTyped,
            errors,
          ),
        ];
      });
      console.log(charTyped);
    }, 1000);
    
    if (second >= exampleText.default_time) {
      console.log('time up');
      clearInterval(timer);
    }
  };

  useEffect(() => {
    const correct = handleInput(
      text[text.length - 1],
      text.length - 1,
      exampleText.content[actualLine],
    );
    if (!correct) {
      setText('');
      return;
    }

    if (text === exampleText.content[actualLine]) {
      setActualLine((prev) => prev + 1);
      setText('');
    }
  }, [text]);
  useEffect(() => {
    startTimer();
  }, []);

  return (
    <div className="typing-content">
      <span>Welcome to the Typing Content Component!</span>
      <div className="text-display">
        {exampleText.content[actualLine]} {text}
      </div>
      <input
        type="text"
        value={text}
        onChange={({ target }) => {
          setText(target.value);
        }}
      />
    </div>
  );
}
