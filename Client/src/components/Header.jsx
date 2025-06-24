// src/components/Header.jsx
import Nav from './Nav';

export default function Header({ userEmail, setUserEmail }) {
  return (
    <header>
      <Nav userEmail={userEmail} setUserEmail={setUserEmail} />
    </header>
  );
}
