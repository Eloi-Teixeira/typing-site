import './App.css';
import Header from './components/Header';
import TypingContent from './components/TypingContent';
import { TypingProvider } from './context/TypingContext';

function App() {
  return (
    <>
      <TypingProvider>
        <Header />
        <TypingContent />
      </TypingProvider>
    </>
  );
}

export default App;
