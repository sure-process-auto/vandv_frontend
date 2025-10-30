import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EvaluationPage from './components/EvaluationPage.jsx';
import Login from './pages/login.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EvaluationPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
