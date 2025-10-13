import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import TypingContent from './components/TypingContent';
import { TypingProvider } from './context/TypingContext';
import ResultsContent from './components/ResultContent';

function App() {
  return (
    <>
      <BrowserRouter>
        <TypingProvider>
          <Header />
          <Routes>
            <Route path='/' element={<TypingContent />} />
            <Route path='/result' element={<ResultsContent />} />
          </Routes>
        </TypingProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
