import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

function SettingsPage() {
  const [evaluationItems, setEvaluationItems] = useState([
    { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
    { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
    { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
    { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
    { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
  ]);

  const [newItem, setNewItem] = useState({ name: '', ratio: 0, description: '' });

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
    setNewItem({ name: '', ratio: 0, description: '' });
  };

  // 항목 삭제
  const handleDeleteItem = (id) => {
    setEvaluationItems(evaluationItems.filter(item => item.id !== id));
  };

  // 항목 수정
  const handleUpdateItem = (id, field, value) => {
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: field === 'ratio' ? parseFloat(value) || 0 : value } : item
      )
    );
  };

  // 총 비율 계산
  const getTotalRatio = () => {
    return evaluationItems.reduce((sum, item) => sum + item.ratio, 0);
  };

  // 설정 저장
  const handleSaveSettings = () => {
    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      alert(`비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`);
      return;
    }

    // localStorage에 저장
    localStorage.setItem('evaluationSettings', JSON.stringify(evaluationItems));
    alert('설정이 저장되었습니다!');
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          평가 항목 설정
        </Typography>

        <Grid container spacing={3}>
          {/* 현재 설정된 항목들 */}
          <Grid item xs={12} md={8}>
            <Card>
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
                          type="number"
                          value={item.ratio}
                          onChange={(e) => handleUpdateItem(item.id, 'ratio', e.target.value)}
                          size="small"
                          sx={{ width: 100, mr: 1 }}
                          inputProps={{ min: 0, max: 100 }}
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
          </Grid>

          {/* 새 항목 추가 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  새 항목 추가
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  label="항목 이름"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="비율 (%)"
                  type="number"
                  value={newItem.ratio}
                  onChange={(e) => setNewItem({ ...newItem, ratio: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 100 }}
                />
                
                <TextField
                  label="설명"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  fullWidth
                >
                  항목 추가
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
      </Paper>
    </Box>
  );
}

export default SettingsPage;

