// src/renderer/App.tsx
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import "tailwindcss/index.css";
import BlockEditor from './components/BlockEditor';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlockEditor />} />
      </Routes>
    </Router>
  );
}
