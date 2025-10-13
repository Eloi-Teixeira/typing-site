import { Navigate } from 'react-router-dom';
import { useTyping } from '../context/TypingContext';
import PerformanceChart from './Graph';

export default function ResultsContent() {
  const { info } = useTyping();
  const typingAverage =
    info.data.reduce((acc, i) => acc + i.chars, 0) / info.data.length;

    if (info.data.length === 0) {
      return Navigate({to: '/'})
    }

  return (
    <div>
      <h1>Resultados</h1>
      <div>
        <span>Digitação media {typingAverage.toFixed(2)}</span>
        <span>Erros: {info.errors}</span>
        <br />
        <span>{info.totalTyped - info.errors} / {info.totalTyped} / {info.textLength} </span>
      </div>

      <PerformanceChart />
    </div>
  );
}
