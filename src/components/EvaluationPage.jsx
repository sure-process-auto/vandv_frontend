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
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { saveEvaluation, getAllTeamMembers, getRatingItems, getMemberRatings, saveUserRatings } from '../services/evaluationService';

// 더미 프로젝트 데이터
const DUMMY_PROJECTS = [
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

function EvaluationPage() {
  const [currentProjectId, setCurrentProjectId] = useState(DUMMY_PROJECTS[0].id);
  const [evaluationItems, setEvaluationItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Snackbar 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  
  // 구성원 데이터 (API에서 로드)
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // 평가 항목 템플릿 (API에서 로드)
  const [ratingsTemplate, setRatingsTemplate] = useState([]);

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

  // 구성원 데이터 및 평가 항목 로드
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. 구성원 데이터 로드
      try {
        const teamMembers = await getAllTeamMembers();
        
        if (teamMembers && teamMembers.length > 0) {
          setMembers(teamMembers);
        }
      } catch (error) {
        // 에러 시 빈 배열
        setMembers([]);
      }
      
      // 2. 평가 항목 데이터 로드
      try {
        const ratingsData = await getRatingItems();
        
        if (ratingsData && ratingsData.length > 0) {
          // API 데이터를 항목 형태로 변환 (id, name, ratio)
          const formattedItems = ratingsData.map((item) => ({
            id: item.id,
            name: item.name,
            ratio: parseFloat(item.ratio) || 0,
            description: item.description || ''
          }));
          
          setRatingsTemplate(formattedItems);
        }
      } catch (error) {
        // 에러 시 빈 배열
        setRatingsTemplate([]);
      }
    };

    loadInitialData();
  }, []);

  // 현재 프로젝트 정보
  const currentProject = DUMMY_PROJECTS.find(p => p.id === currentProjectId);

  // 프로젝트 변경 시 구성원 선택 초기화
  useEffect(() => {
    setSelectedMemberId('');
  }, [currentProjectId]);

  // 프로젝트 및 구성원별 평가 데이터 불러오기
  useEffect(() => {
    if (!currentProjectId || !selectedMemberId) {
      setEvaluationItems([]);
      return;
    }

    // 평가 항목 템플릿이 로드되지 않았으면 대기
    if (ratingsTemplate.length === 0) {
      return;
    }

    const loadMemberEvaluationData = async () => {
      try {
        const memberRatings = await getMemberRatings(selectedMemberId);
        
        if (memberRatings && memberRatings.length > 0) {
          // ratingsTemplate과 API 응답 데이터를 매칭
          const mergedItems = ratingsTemplate.map(templateItem => {
            const matchedRating = memberRatings.find(
              rating => String(rating.iteminfo) === String(templateItem.id)
            );
            
            if (matchedRating) {
              return {
                ...templateItem,
                score: parseInt(matchedRating.score) || 0,
                bonus: parseInt(matchedRating.plus) || 0,
                comment: matchedRating.comment || ''
              };
            } else {
              return {
                ...templateItem,
                score: 0,
                bonus: 0,
                comment: ''
              };
            }
          });
          
          setEvaluationItems(mergedItems);
          return;
        }
      } catch (error) {
        // API 실패 시 localStorage에서 시도
      }

      // API 실패 시 localStorage에서 시도
      const savedEvaluation = localStorage.getItem(`evaluationData-${currentProjectId}-${selectedMemberId}`);
      
      if (savedEvaluation) {
        const evaluation = JSON.parse(savedEvaluation);
        setEvaluationItems(evaluation.items || ratingsTemplate.map(item => ({ ...item, score: 0, bonus: 0, comment: '' })));
      } else {
        // 저장된 평가 데이터가 없으면 템플릿 사용
        setEvaluationItems(ratingsTemplate.map(item => ({ ...item, score: 0, bonus: 0, comment: '' })));
      }
    };
    
    loadMemberEvaluationData();
  }, [currentProjectId, selectedMemberId, ratingsTemplate]);

  // 항목 값 변경 핸들러 (숫자)
  const handleChange = (id, field, value) => {
    // 빈 문자열이면 0, 아니면 숫자로 변환하여 앞의 0 제거
    const numValue = value === '' ? 0 : Number(value) || 0;
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: numValue } : item
      )
    );
  };

  // 의견 변경 핸들러 (텍스트)
  const handleCommentChange = (id, value) => {
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, comment: value } : item
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
      const weightedBonus = (item.bonus * item.ratio) / 100;
      return sum + weightedScore + weightedBonus;
    }, 0);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!currentProjectId) {
      showSnackbar('프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }

    if (!selectedMemberId) {
      showSnackbar('구성원을 선택해주세요.', 'error');
      return;
    }

    // 비율 합계 검증
    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      showSnackbar(`비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`, 'error');
      return;
    }

    setIsSaving(true);

    try {
      const selectedMember = members.find(m => m.id === selectedMemberId);
      const totalScore = getTotalScore();
      
      // 백엔드 API 형식으로 데이터 변환
      const ratings = evaluationItems.map(item => ({
        itemInfo: String(item.id),
        plus: String(item.bonus),
        score: String(item.score),
        userInfo: selectedMemberId,
        comment: item.comment || ''
      }));
      
      // 백엔드 API 호출
      await saveUserRatings(String(totalScore.toFixed(2)), ratings);
      
      // 성공 시 로컬 스토리지에도 저장
      const evaluationData = {
        projectId: currentProjectId,
        projectName: currentProject?.name,
        memberId: selectedMemberId,
        memberName: selectedMember?.username,
        items: evaluationItems,
        totalScore: totalScore,
        evaluatedAt: new Date().toISOString()
      };
      localStorage.setItem(`evaluationData-${currentProjectId}-${selectedMemberId}`, JSON.stringify(evaluationData));
      
      showSnackbar('평가가 성공적으로 저장되었습니다!', 'success');
    } catch (error) {
      showSnackbar(`저장 실패: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalScore = getTotalScore();
  const totalRatio = getTotalRatio();

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          평가
        </Typography>

        {/* 프로젝트 및 구성원 선택 */}
        <Box sx={{ mb: 4, p: 3, border: '2px solid', borderColor: 'primary.light', borderRadius: 3, bgcolor: '#EEF4FA', boxShadow: '0 2px 8px rgba(91, 155, 213, 0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            평가 대상 선택
          </Typography>
          
          {/* 프로젝트 선택 */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              프로젝트:
            </Typography>
            <FormControl sx={{ minWidth: 400, flexGrow: 1 }}>
              <Select
                value={currentProjectId || ''}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                displayEmpty
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="" disabled>
                  프로젝트를 선택하세요
                </MenuItem>
                {DUMMY_PROJECTS.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderOpenIcon sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.description || '설명 없음'}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 구성원 선택 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              구성원:
            </Typography>
            <FormControl sx={{ minWidth: 400, flexGrow: 1 }}>
              <Select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                displayEmpty
                sx={{ bgcolor: 'white' }}
                disabled={!currentProjectId}
              >
                <MenuItem value="" disabled>
                  구성원을 선택하세요
                </MenuItem>
                {members.map((member) => {
                  // 평가 완료 여부 확인
                  const hasEvaluation = localStorage.getItem(`evaluationData-${currentProjectId}-${member.id}`) !== null;
                  
                  return (
                    <MenuItem key={member.id} value={member.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {member.username.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{member.username}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.team}
                            </Typography>
                          </Box>
                        </Box>
                        {hasEvaluation && (
                          <Chip 
                            label="평가 완료" 
                            size="small" 
                            color="success" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {!currentProjectId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            평가를 시작하려면 프로젝트와 구성원을 선택해주세요.
          </Alert>
        )}

        {currentProjectId && !selectedMemberId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            구성원을 선택해주세요.
          </Alert>
        )}

        {selectedMemberId && evaluationItems.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            설정 페이지에서 평가 항목을 먼저 설정해주세요.
          </Alert>
        )}

        {selectedMemberId && evaluationItems.length > 0 && (
          <Box>

        {/* 요약 정보 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={12}>
            <Card elevation={0} sx={{ bgcolor: 'primary.light' }}>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가산점 (0~5)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">의견</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가중 점수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluationItems.map((item) => {
                const weightedScore = (item.score * item.ratio) / 100;
                const weightedBonus = (item.bonus * item.ratio) / 100;
                const finalScore = weightedScore + weightedBonus;

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Tooltip title={item.description || ''} arrow placement="left">
                        <Typography 
                          component="span"
                          sx={{ 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${item.ratio}%`} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        value={item.score}
                        onChange={(e) => {
                          const input = e.target.value;
                          // 정수만 허용 (소수점 불가)
                          if (input === '' || /^\d+$/.test(input)) {
                            const numVal = input === '' ? 0 : Number(input);
                            if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                              handleChange(item.id, 'score', numVal);
                            }
                          }
                        }}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ inputMode: 'numeric' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        value={item.bonus}
                        onChange={(e) => {
                          const input = e.target.value;
                          // 정수만 허용 (0~5, 소수점 불가)
                          if (input === '' || /^\d+$/.test(input)) {
                            const numVal = input === '' ? 0 : Number(input);
                            if (!isNaN(numVal) && numVal >= 0 && numVal <= 5) {
                              handleChange(item.id, 'bonus', numVal);
                            }
                          }
                        }}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ inputMode: 'numeric', min: 0, max: 5 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        value={item.comment || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        placeholder="의견을 입력하세요"
                        size="small"
                        multiline
                        maxRows={3}
                        sx={{ width: 300 }}
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

        </Box>
          </Box>
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

export default EvaluationPage;
