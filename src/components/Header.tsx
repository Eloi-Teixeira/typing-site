import { NavLink } from 'react-router-dom';
import { useTyping } from '../context/TypingContext';

export default function Header() {
  const { info } = useTyping();

  return (
    <header id="header">
      <div className="logo">
        <h1>Typing Test</h1>
      </div>
      <nav>
        <NavLink to={'/'}>
          {info.language === 'pt-BR' ? 'Teste' : 'Test'}
        </NavLink>
        <NavLink
          to={'/result'}
          onClick={(e) => {
            if (info.data.length === 0 || info.isRunning)
              return e.preventDefault();
          }}
        >
          {info.language === 'pt-BR' ? 'Resultados' : 'Results'}
        </NavLink>
      </nav>
    </header>
  );
}
