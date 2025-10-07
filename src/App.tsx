import './App.css';
import TypingContent from './components/TypingContent';
import { TypingProvider } from './context/TypingContext';

function App() {
  return (
    <>
      <TypingProvider>
        <TypingContent />
      </TypingProvider>
    </>
  );
}

export default App;
