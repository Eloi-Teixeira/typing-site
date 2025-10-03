import { useState } from 'react'
import './App.css'
import TypingContent from './components/TypingContent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TypingContent />
    </>
  )
}

export default App
