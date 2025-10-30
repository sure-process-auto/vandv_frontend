import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { saveEvaluation } from '../services/evaluationService';

function EvaluationPage() {
  const [evaluationItems, setEvaluationItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // 설정에서 평가 항목 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem('evaluationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setEvaluationItems(settings.map(item => ({
        ...item,
        score: 0,
        bonus: 0
      })));
    } else {
      // 기본 항목
      setEvaluationItems([
        { id: 1, name: '코드 품질', ratio: 30, score: 0, bonus: 0, description: '코드의 가독성, 구조, 표준 준수' },
        { id: 2, name: '기능 완성도', ratio: 25, score: 0, bonus: 0, description: '요구사항 충족도 및 기능 완성도' },
        { id: 3, name: '사용자 경험', ratio: 20, score: 0, bonus: 0, description: 'UI/UX 품질 및 사용 편의성' },
        { id: 4, name: '성능 최적화', ratio: 15, score: 0, bonus: 0, description: '실행 속도 및 리소스 효율성' },
        { id: 5, name: '문서화', ratio: 10, score: 0, bonus: 0, description: '주석, README, 기술 문서 품질' }
      ]);
    }
  }, []);

  // 항목 값 변경 핸들러
  const handleChange = (id, field, value) => {
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
      )
    );
  };

  // 총 비율 계산
  const getTotalRatio = () => {
    return evaluationItems.reduce((sum, item) => sum + item.ratio, 0);
  };

  // 총 점수 계산 (가중치 적용)
  const getTotalScore = () => {
    return evaluationItems.reduce((sum, item) => {
      const weightedScore = (item.score * item.ratio) / 100;
      return sum + weightedScore + item.bonus;
    }, 0);
  };

  // 저장 핸들러
  const handleSave = async () => {
    // 비율 합계 검증
    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      setSaveMessage({ 
        text: `비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`, 
        type: 'error' 
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });

    try {
      const evaluationData = {
        items: evaluationItems,
        totalScore: getTotalScore(),
        evaluatedAt: new Date().toISOString()
      };

      await saveEvaluation(evaluationData);
      setSaveMessage({ text: '평가가 성공적으로 저장되었습니다!', type: 'success' });
    } catch (error) {
      setSaveMessage({ text: `저장 실패: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalScore = getTotalScore();
  const totalRatio = getTotalRatio();

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          평가 시스템
        </Typography>

        {/* 요약 정보 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: totalRatio === 100 ? 'success.light' : 'error.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      총 비율
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {totalRatio}%
                    </Typography>
                  </Box>
                  {totalRatio === 100 ? (
                    <CheckCircleIcon sx={{ fontSize: 60, color: 'success.dark' }} />
                  ) : (
                    <WarningIcon sx={{ fontSize: 60, color: 'error.dark' }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'primary.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      총 점수
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {totalScore.toFixed(2)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={totalScore >= 80 ? '우수' : totalScore >= 60 ? '보통' : '미흡'} 
                    color={totalScore >= 80 ? 'success' : totalScore >= 60 ? 'warning' : 'error'}
                    sx={{ fontSize: 18, p: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 평가 테이블 */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>항목</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">비율 (%)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">점수 (0-100)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가산점</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가중 점수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluationItems.map((item) => {
                const weightedScore = (item.score * item.ratio) / 100;
                const finalScore = weightedScore + item.bonus;

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Tooltip title={item.description || ''} arrow>
                        <Typography sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
                          {item.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${item.ratio}%`} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.score}
                        onChange={(e) => handleChange(item.id, 'score', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.bonus}
                        onChange={(e) => handleChange(item.id, 'bonus', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={finalScore.toFixed(2)} 
                        color="success" 
                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 저장 버튼 및 메시지 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{ minWidth: 200 }}
          >
            {isSaving ? '저장 중...' : '평가 저장'}
          </Button>

          {saveMessage.text && (
            <Alert severity={saveMessage.type} sx={{ width: '100%', maxWidth: 600 }}>
              {saveMessage.text}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default EvaluationPage;
