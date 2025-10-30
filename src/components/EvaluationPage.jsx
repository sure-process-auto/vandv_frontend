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
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { saveEvaluation } from '../services/evaluationService';
import { useProject } from '../contexts/ProjectContext.jsx';

function EvaluationPage() {
  const { currentProject, currentProjectId, projects, selectProject } = useProject();
  const [evaluationItems, setEvaluationItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  
  // 임시 구성원 데이터
  const [members] = useState([
    { id: 'member-1', name: '김철수', role: '백엔드 개발자' },
    { id: 'member-2', name: '이영희', role: '프론트엔드 개발자' },
    { id: 'member-3', name: '박지훈', role: '풀스택 개발자' },
    { id: 'member-4', name: '최민수', role: 'DevOps 엔지니어' },
    { id: 'member-5', name: '정수진', role: 'UI/UX 디자이너' },
  ]);
  const [selectedMemberId, setSelectedMemberId] = useState('');

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

    // 먼저 프로젝트별 설정에서 평가 항목 불러오기
    const savedSettings = localStorage.getItem(`evaluationSettings-${currentProjectId}`);
    let itemsTemplate = [];
    
    if (savedSettings) {
      itemsTemplate = JSON.parse(savedSettings);
    } else {
      // 기본 항목
      itemsTemplate = [
        { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
        { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
        { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
        { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
        { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
      ];
    }

    // 현재 프로젝트 및 구성원의 평가 데이터 불러오기
    const savedEvaluation = localStorage.getItem(`evaluationData-${currentProjectId}-${selectedMemberId}`);
    
    if (savedEvaluation) {
      const evaluation = JSON.parse(savedEvaluation);
      setEvaluationItems(evaluation.items || itemsTemplate.map(item => ({ ...item, score: 0, bonus: 0 })));
    } else {
      // 저장된 평가 데이터가 없으면 템플릿 사용
      setEvaluationItems(itemsTemplate.map(item => ({ ...item, score: 0, bonus: 0 })));
    }
  }, [currentProjectId, selectedMemberId]);

  // 항목 값 변경 핸들러
  const handleChange = (id, field, value) => {
    // 빈 문자열이면 0, 아니면 숫자로 변환하여 앞의 0 제거
    const numValue = value === '' ? 0 : Number(value) || 0;
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: numValue } : item
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
      setSaveMessage({ text: '프로젝트가 선택되지 않았습니다.', type: 'error' });
      return;
    }

    if (!selectedMemberId) {
      setSaveMessage({ text: '구성원을 선택해주세요.', type: 'error' });
      return;
    }

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
      const selectedMember = members.find(m => m.id === selectedMemberId);
      const evaluationData = {
        projectId: currentProjectId,
        projectName: currentProject?.name,
        memberId: selectedMemberId,
        memberName: selectedMember?.name,
        items: evaluationItems,
        totalScore: getTotalScore(),
        evaluatedAt: new Date().toISOString()
      };

      // 프로젝트 및 구성원별로 로컬 스토리지에 저장
      localStorage.setItem(`evaluationData-${currentProjectId}-${selectedMemberId}`, JSON.stringify(evaluationData));

      // API 호출 (선택적)
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
  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          평가
        </Typography>

        {/* 프로젝트 및 구성원 선택 */}
        <Box sx={{ mb: 4, p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            평가 대상 선택
          </Typography>
          
          {/* 프로젝트 선택 */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              프로젝트:
            </Typography>
            <FormControl sx={{ minWidth: 300 }}>
              <Select
                value={currentProjectId || ''}
                onChange={(e) => selectProject(e.target.value)}
                displayEmpty
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="" disabled>
                  프로젝트를 선택하세요
                </MenuItem>
                {projects.map((project) => (
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
            <FormControl sx={{ minWidth: 300 }}>
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
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedMember && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: 20 }}>
                  {selectedMember.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.role}
                  </Typography>
                </Box>
              </Box>
            )}
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
          <Grid item xs={12}>
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
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EvaluationPage;
