import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getRatingItems, saveRatingItems, getPmId } from '../services/evaluationService';

// PM1 프로젝트 데이터 (PM_ID: 4g9b2e7f1c8a0d6h3k5j)
const PM1_PROJECTS = [
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

// PM2 프로젝트 데이터 (PM_ID: e9k2f0b7d5c1h3a6g8j)
const PM2_PROJECTS = [
  {
    id: 'project-101',
    name: '블록체인 결제 시스템',
    description: '암호화폐 기반 안전한 결제 플랫폼 개발',
    createdAt: '2025-01-20T09:00:00.000Z'
  },
  {
    id: 'project-102',
    name: 'IoT 스마트홈 통합',
    description: '스마트홈 기기 통합 관리 시스템 구축',
    createdAt: '2025-02-10T09:00:00.000Z'
  },
  {
    id: 'project-103',
    name: '온라인 교육 플랫폼',
    description: '실시간 화상 강의 및 학습 관리 시스템',
    createdAt: '2025-03-05T09:00:00.000Z'
  },
  {
    id: 'project-104',
    name: '헬스케어 모니터링',
    description: '웨어러블 기기 연동 건강 관리 앱',
    createdAt: '2025-04-15T09:00:00.000Z'
  },
  {
    id: 'project-105',
    name: '물류 추적 시스템',
    description: '실시간 배송 추적 및 최적 경로 제공',
    createdAt: '2025-05-25T09:00:00.000Z'
  }
];

// PM_ID에 따라 프로젝트 리스트 반환
const getProjectsByPmId = () => {
  const pmId = localStorage.getItem('PM_ID') || '4g9b2e7f1c8a0d6h3k5j';
  if (pmId === 'e9k2f0b7d5c1h3a6g8j') {
    return PM2_PROJECTS;
  }
  return PM1_PROJECTS;
};

function SettingsPage() {
  const projects = getProjectsByPmId();
  const [currentProjectId, setCurrentProjectId] = useState(projects[0].id);
  
  // 평가 항목 상태
  const [evaluationItems, setEvaluationItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newItem, setNewItem] = useState({ name: '', ratio: 0, description: '' });
  const [openModal, setOpenModal] = useState(false);
  
  // Snackbar 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  
  // 현재 프로젝트 정보
  const currentProject = projects.find(p => p.id === currentProjectId);
  
  // Snackbar 핸들러
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // 프로젝트별 평가 항목 로드
  useEffect(() => {
    if (!currentProjectId) return;
    
    const loadRatings = async () => {
      setIsLoading(true);
      try {
        // API에서 평가 항목 가져오기
        const ratingsData = await getRatingItems();
        
        if (ratingsData && ratingsData.length > 0) {
          // API 데이터를 항목 형태로 변환 (id, name, ratio)
          const formattedItems = ratingsData.map((item) => ({
            id: item.id, // API에서 받은 실제 ID 사용 (중요!)
            name: item.name,
            ratio: parseFloat(item.ratio) || 0,
            description: item.description || '' // description이 있으면 사용
          }));
          
          setEvaluationItems(formattedItems);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // API 실패 시 localStorage에서 시도
      }
      
      // API 실패 시 localStorage에서 로드
      const savedSettings = localStorage.getItem(`evaluationSettings-${currentProjectId}`);
      if (savedSettings) {
        setEvaluationItems(JSON.parse(savedSettings));
      }
      setIsLoading(false);
    };
    
    loadRatings();
  }, [currentProjectId]);

  // 모달 열기/닫기
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewItem({ name: '', ratio: 0, description: '' });
  };

  // 항목 추가
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      showSnackbar('항목 이름을 입력해주세요.', 'warning');
      return;
    }

    // 고유한 문자열 ID 생성 (타임스탬프 + 랜덤)
    const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setEvaluationItems([
      ...evaluationItems,
      { ...newItem, id: newId, ratio: parseFloat(newItem.ratio) || 0 }
    ]);
    handleCloseModal();
    showSnackbar('항목이 추가되었습니다!', 'success');
  };

  // 항목 삭제
  const handleDeleteItem = (id) => {
    setEvaluationItems(evaluationItems.filter(item => String(item.id) !== String(id)));
  };

  // 항목 수정
  const handleUpdateItem = (id, field, value) => {
    if (field === 'ratio') {
      // 빈 문자열이면 0, 아니면 숫자로 변환하여 앞의 0 제거
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      setEvaluationItems(items =>
        items.map(item =>
          String(item.id) === String(id) ? { ...item, [field]: numValue } : item
        )
      );
    } else {
      setEvaluationItems(items =>
        items.map(item =>
          String(item.id) === String(id) ? { ...item, [field]: value } : item
        )
      );
    }
  };

  // 총 비율 계산
  const getTotalRatio = () => {
    return evaluationItems.reduce((sum, item) => sum + item.ratio, 0);
  };

  // 설정 저장
  const handleSaveSettings = async () => {
    if (!currentProjectId) {
      showSnackbar('프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }

    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      showSnackbar(`비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`, 'warning');
      return;
    }

    try {
      // 백엔드 API로 평가 항목 저장
      const pmId = getPmId();
      const items = evaluationItems.map(item => ({
        name: item.name,
        ratio: String(item.ratio),
        userinfo: pmId,
        description: item.description || ''
      }));

      await saveRatingItems(items);

      // 프로젝트별로 localStorage에 저장
      localStorage.setItem(`evaluationSettings-${currentProjectId}`, JSON.stringify(evaluationItems));
      
      // 해당 프로젝트의 모든 평가 완료 데이터 삭제 (평가 항목 변경 시 재평가 필요)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`evaluationData-${currentProjectId}-`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      const removedCount = keysToRemove.length;
      if (removedCount > 0) {
        showSnackbar(`설정이 저장되었습니다! ${removedCount}개의 완료된 평가가 초기화되었습니다.`, 'success');
      } else {
        showSnackbar('설정이 저장되었습니다!', 'success');
      }
    } catch (error) {
      showSnackbar(`저장 실패: ${error.message}`, 'error');
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          평가 항목 설정
        </Typography>

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary">
              평가 항목을 불러오는 중...
            </Typography>
          </Box>
        ) : (
        <>
        {/* 평가 항목 설정 섹션 */}
        <Box>
          {/* 프로젝트 선택 */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              프로젝트 선택:
            </Typography>
            <FormControl sx={{ minWidth: 300 }}>
              <Select
                value={currentProjectId || ''}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                displayEmpty
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {currentProject && (
              <Chip 
                label={currentProject.description || '설명 없음'} 
                variant="outlined" 
                color="primary"
              />
            )}
          </Box>

          {/* 항목 추가 버튼 */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', mt: '-77px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            size="large"
          >
            새 항목 추가
          </Button>
        </Box>

        {/* 현재 설정된 항목들 */}
        <Card elevation={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              평가 항목 목록
            </Typography>
            <Typography 
              variant="body2" 
              color={getTotalRatio() === 100 ? 'success.main' : 'error.main'}
              sx={{ mb: 2, fontWeight: 'bold' }}
            >
              총 비율: {getTotalRatio()}% {getTotalRatio() === 100 ? '✓' : '(100%가 되어야 합니다)'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {evaluationItems.map((item) => (
                <ListItem key={item.id} sx={{ mb: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <TextField
                      label="항목 이름"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      size="small"
                      sx={{ flex: 1, mr: 2 }}
                    />
                    <TextField
                      label="비율 (%)"
                      value={item.ratio}
                      onChange={(e) => {
                        const input = e.target.value;
                        // 숫자만 허용
                        if (input === '' || /^\d*\.?\d*$/.test(input)) {
                          const numVal = input === '' ? 0 : Number(input);
                          if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                            handleUpdateItem(item.id, 'ratio', numVal);
                          }
                        }
                      }}
                      size="small"
                      sx={{ width: 100, mr: 1 }}
                      inputProps={{ inputMode: 'decimal' }}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={evaluationItems.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    label="설명"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* 항목 추가 모달 */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>새 항목 추가</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="항목 이름"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
                autoFocus
              />
              
              <TextField
                label="비율 (%)"
                value={newItem.ratio}
                onChange={(e) => {
                  const input = e.target.value;
                  // 숫자만 허용
                  if (input === '' || /^\d*\.?\d*$/.test(input)) {
                    const numVal = input === '' ? 0 : Number(input);
                    if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                      setNewItem({ ...newItem, ratio: numVal });
                    }
                  }
                }}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ inputMode: 'decimal' }}
              />
              
              <TextField
                label="설명"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>취소</Button>
            <Button onClick={handleAddItem} variant="contained" startIcon={<AddIcon />}>
              추가
            </Button>
          </DialogActions>
        </Dialog>

          {/* 저장 버튼 */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ minWidth: 200 }}
            >
              설정 저장
            </Button>
          </Box>
        </Box>
        </>
        )}
      </Paper>
      
      {/* Snackbar 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsPage;

