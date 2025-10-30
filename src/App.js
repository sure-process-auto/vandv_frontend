import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './contexts/ProjectContext.jsx';
import Layout from './components/Layout.jsx';
import EvaluationPage from './components/EvaluationPage.jsx';
import ResultPage from './components/ResultPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import Login from './pages/LoginPage.jsx';

function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          {/* 로그인 페이지 (레이아웃 없음) */}
          <Route path="/login" element={<Login />} />
          
          {/* 레이아웃이 있는 페이지들 */}
          <Route path="/" element={<Layout><EvaluationPage /></Layout>} />
          <Route path="/result" element={<Layout><ResultPage /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}

export default App;
