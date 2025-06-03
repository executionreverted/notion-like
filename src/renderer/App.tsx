// src/renderer/App.tsx
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockEditor } from './components/BlockEditor';
import './App.css';
import './components/BlockEditor.css'
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlockEditor />} />
      </Routes>
    </Router>
  );
}
