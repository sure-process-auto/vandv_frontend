import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // 로컬 스토리지에서 프로젝트 목록 불러오기
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedCurrentProjectId = localStorage.getItem('currentProjectId');
    
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      
      if (savedCurrentProjectId && parsedProjects.find(p => p.id === savedCurrentProjectId)) {
        setCurrentProjectId(savedCurrentProjectId);
      } else if (parsedProjects.length > 0) {
        setCurrentProjectId(parsedProjects[0].id);
      }
    } else {
      // 기본 더미 프로젝트 생성
      const defaultProjects = [
        {
          id: 'project-001',
          name: '모바일 앱 리뉴얼',
          description: 'iOS/Android 모바일 앱 UI/UX 개선 프로젝트',
          createdAt: '2025-01-15T09:00:00.000Z'
        },
        {
          id: 'project-002',
          name: 'ERP 시스템 구축',
          description: '사내 전사적 자원 관리 시스템 개발',
          createdAt: '2025-02-01T09:00:00.000Z'
        },
        {
          id: 'project-003',
          name: 'AI 챗봇 서비스',
          description: '고객 상담 자동화를 위한 AI 챗봇 구현',
          createdAt: '2025-03-10T09:00:00.000Z'
        },
        {
          id: 'project-004',
          name: '데이터 분석 플랫폼',
          description: '빅데이터 수집 및 분석 대시보드 구축',
          createdAt: '2025-04-05T09:00:00.000Z'
        },
        {
          id: 'project-005',
          name: '클라우드 마이그레이션',
          description: '온프레미스에서 AWS 클라우드 전환 프로젝트',
          createdAt: '2025-05-20T09:00:00.000Z'
        }
      ];
      setProjects(defaultProjects);
      setCurrentProjectId(defaultProjects[0].id);
      localStorage.setItem('projects', JSON.stringify(defaultProjects));
      localStorage.setItem('currentProjectId', defaultProjects[0].id);
    }
  }, []);

  // 프로젝트 목록 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  // 현재 프로젝트 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId);
    }
  }, [currentProjectId]);

  // 현재 프로젝트 가져오기
  const getCurrentProject = () => {
    return projects.find(p => p.id === currentProjectId);
  };

  // 프로젝트 추가
  const addProject = (name, description = '') => {
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    return newProject;
  };

  // 프로젝트 수정
  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));
  };

  // 프로젝트 삭제
  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    // 현재 프로젝트가 삭제되면 다른 프로젝트로 전환
    if (currentProjectId === projectId) {
      if (updatedProjects.length > 0) {
        setCurrentProjectId(updatedProjects[0].id);
      } else {
        setCurrentProjectId(null);
      }
    }
    
    // 해당 프로젝트의 모든 평가 데이터 삭제 (구성원별 데이터 포함)
    // localStorage에서 프로젝트 ID로 시작하는 모든 키 찾아서 삭제
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`evaluationData-${projectId}`) || 
          key.startsWith(`evaluationSettings-${projectId}`)) {
        localStorage.removeItem(key);
      }
    });
  };

  // 프로젝트 선택
  const selectProject = (projectId) => {
    if (projects.find(p => p.id === projectId)) {
      setCurrentProjectId(projectId);
    }
  };

  const value = {
    projects,
    currentProjectId,
    currentProject: getCurrentProject(),
    addProject,
    updateProject,
    deleteProject,
    selectProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

