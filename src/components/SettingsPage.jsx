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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext.jsx';
import { getRatingItems } from '../services/evaluationService';

function SettingsPage() {
  const { projects, currentProjectId, currentProject, selectProject } = useProject();
  
  // 평가 항목 상태
  const [evaluationItems, setEvaluationItems] = useState([
    { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
    { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
    { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
    { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
    { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
  ]);

  const [newItem, setNewItem] = useState({ name: '', ratio: 0, description: '' });
  const [openModal, setOpenModal] = useState(false);
  
  // 프로젝트별 평가 항목 로드
  useEffect(() => {
    if (!currentProjectId) return;
    
    const loadRatings = async () => {
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
          
          console.log('✅ API에서 불러온 평가 항목 (실제 ID 포함):', formattedItems);
          setEvaluationItems(formattedItems);
          return;
        }
      } catch (error) {
        console.error('평가 항목 로드 실패, localStorage에서 시도:', error);
      }
      
      // API 실패 시 localStorage에서 로드
      const savedSettings = localStorage.getItem(`evaluationSettings-${currentProjectId}`);
      if (savedSettings) {
        setEvaluationItems(JSON.parse(savedSettings));
      } else {
        // 기본 항목
        setEvaluationItems([
          { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
          { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
          { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
          { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
          { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
        ]);
      }
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
      alert('항목 이름을 입력해주세요.');
      return;
    }

    const newId = Math.max(...evaluationItems.map(item => item.id), 0) + 1;
    setEvaluationItems([
      ...evaluationItems,
      { ...newItem, id: newId, ratio: parseFloat(newItem.ratio) || 0 }
    ]);
    handleCloseModal();
  };

  // 항목 삭제
  const handleDeleteItem = (id) => {
    setEvaluationItems(evaluationItems.filter(item => item.id !== id));
  };

  // 항목 수정
  const handleUpdateItem = (id, field, value) => {
    if (field === 'ratio') {
      // 빈 문자열이면 0, 아니면 숫자로 변환하여 앞의 0 제거
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      setEvaluationItems(items =>
        items.map(item =>
          item.id === id ? { ...item, [field]: numValue } : item
        )
      );
    } else {
      setEvaluationItems(items =>
        items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    }
  };

  // 총 비율 계산
  const getTotalRatio = () => {
    return evaluationItems.reduce((sum, item) => sum + item.ratio, 0);
  };

  // 설정 저장
  const handleSaveSettings = () => {
    if (!currentProjectId) {
      alert('프로젝트가 선택되지 않았습니다.');
      return;
    }

    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      alert(`비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`);
      return;
    }

    // 프로젝트별로 localStorage에 저장
    localStorage.setItem(`evaluationSettings-${currentProjectId}`, JSON.stringify(evaluationItems));
    alert('설정이 저장되었습니다!');
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          평가 항목 설정
        </Typography>

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
                onChange={(e) => selectProject(e.target.value)}
                displayEmpty
              >
                {projects.length === 0 && (
                  <MenuItem value="" disabled>
                    프로젝트가 없습니다
                  </MenuItem>
                )}
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
      </Paper>
    </Box>
  );
}

export default SettingsPage;

