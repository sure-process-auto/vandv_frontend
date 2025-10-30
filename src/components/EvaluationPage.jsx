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
import { saveEvaluation, getAllTeamMembers, getRatingItems, getMemberRatings } from '../services/evaluationService';
import { useProject } from '../contexts/ProjectContext.jsx';

function EvaluationPage() {
  const { currentProject, currentProjectId, projects, selectProject } = useProject();
  const [evaluationItems, setEvaluationItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  
  // 구성원 데이터 (API에서 로드)
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // 평가 항목 템플릿 (API에서 로드)
  const [ratingsTemplate, setRatingsTemplate] = useState([]);

  // 구성원 데이터 및 평가 항목 로드
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. 구성원 데이터 로드
      try {
        console.log('📞 getAllTeamMembers API 호출 중...');
        const teamMembers = await getAllTeamMembers();
        console.log('📥 getAllTeamMembers API 응답:', teamMembers);
        
        if (teamMembers && teamMembers.length > 0) {
          // List<Map<String,String>> 형태를 배열로 변환
          console.log('✅ 구성원 데이터 설정 완료. 첫 번째 구성원:', teamMembers[0]);
          console.log('✅ 구성원 ID 필드들:', teamMembers.map(m => ({ id: m.id, username: m.username })));
          setMembers(teamMembers);
        } else {
          console.warn('⚠️ API 응답이 비어있음. fallback 데이터 사용');
          // API 실패 시 fallback 데이터
          setMembers([
            { id: 'member-1', username: '김철수', team: '백엔드팀' },
            { id: 'member-2', username: '이영희', team: '프론트엔드팀' },
            { id: 'member-3', username: '박지훈', team: '풀스택팀' },
            { id: 'member-4', username: '최민수', team: 'DevOps팀' },
            { id: 'member-5', username: '정수진', team: 'UI/UX팀' },
          ]);
        }
      } catch (error) {
        console.error('❌ 구성원 로드 실패:', error);
        console.warn('⚠️ fallback 데이터 사용');
        // 에러 시 fallback 데이터
        setMembers([
          { id: 'member-1', username: '김철수', team: '백엔드팀' },
          { id: 'member-2', username: '이영희', team: '프론트엔드팀' },
          { id: 'member-3', username: '박지훈', team: '풀스택팀' },
          { id: 'member-4', username: '최민수', team: 'DevOps팀' },
          { id: 'member-5', username: '정수진', team: 'UI/UX팀' },
        ]);
      }
      
      // 2. 평가 항목 데이터 로드
      try {
        const ratingsData = await getRatingItems();
        
        if (ratingsData && ratingsData.length > 0) {
          // API 데이터를 항목 형태로 변환 (id, name, ratio)
          const formattedItems = ratingsData.map((item) => ({
            id: item.id, // API에서 받은 실제 ID 사용 (중요!)
            name: item.name,
            ratio: parseFloat(item.ratio) || 0,
            description: item.description || '' // description이 있으면 사용
          }));
          
          console.log('✅ API에서 불러온 평가 항목 템플릿 (실제 ID 포함):', formattedItems);
          setRatingsTemplate(formattedItems);
        } else {
          // API 응답이 없으면 기본 항목
          setRatingsTemplate([
            { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
            { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
            { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
            { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
            { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
          ]);
        }
      } catch (error) {
        console.error('평가 항목 로드 실패:', error);
        // 에러 시 기본 항목
        setRatingsTemplate([
          { id: 1, name: '코드 품질', ratio: 30, description: '코드의 가독성, 구조, 표준 준수' },
          { id: 2, name: '기능 완성도', ratio: 25, description: '요구사항 충족도 및 기능 완성도' },
          { id: 3, name: '사용자 경험', ratio: 20, description: 'UI/UX 품질 및 사용 편의성' },
          { id: 4, name: '성능 최적화', ratio: 15, description: '실행 속도 및 리소스 효율성' },
          { id: 5, name: '문서화', ratio: 10, description: '주석, README, 기술 문서 품질' }
        ]);
      }
    };

    loadInitialData();
  }, []);

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
        // API에서 구성원의 평가 점수 가져오기
        console.log('🔵 구성원 평가 점수 로드 시작');
        console.log('🔵 선택된 구성원 ID (selectedMemberId):', selectedMemberId);
        console.log('🔵 전체 구성원 정보:', members.find(m => m.id === selectedMemberId));
        
        const memberRatings = await getMemberRatings(selectedMemberId);
        
        if (memberRatings && memberRatings.length > 0) {
          console.log('✅ API에서 받은 평가 점수:', memberRatings);
          console.log('📋 평가 항목 템플릿:', ratingsTemplate);
          
          // ratingsTemplate과 API 응답 데이터를 매칭
          const mergedItems = ratingsTemplate.map(templateItem => {
            console.log(`🔍 매칭 시도 - 항목 ID: ${templateItem.id}, 항목명: ${templateItem.name}`);
            
            // iteminfo가 templateItem.id와 일치하는 데이터 찾기
            const matchedRating = memberRatings.find(
              rating => {
                const match = String(rating.iteminfo) === String(templateItem.id);
                console.log(`  비교: rating.iteminfo(${rating.iteminfo}) === templateItem.id(${templateItem.id}) => ${match}`);
                return match;
              }
            );
            
            if (matchedRating) {
              console.log(`  ✅ 매칭 성공!`, {
                iteminfo: matchedRating.iteminfo,
                score: matchedRating.score,
                plus: matchedRating.plus,
                comment: matchedRating.comment
              });
              return {
                ...templateItem,
                score: parseInt(matchedRating.score) || 0,
                bonus: parseInt(matchedRating.plus) || 0,
                comment: matchedRating.comment || ''
              };
            } else {
              console.log(`  ❌ 매칭 실패 - 기본값 사용`);
              // 매칭되는 데이터가 없으면 기본값
              return {
                ...templateItem,
                score: 0,
                bonus: 0,
                comment: ''
              };
            }
          });
          
          console.log('✅ 최종 매칭된 평가 데이터:', mergedItems);
          setEvaluationItems(mergedItems);
          return;
        }
      } catch (error) {
        console.error('❌ 평가 점수 로드 실패, localStorage 또는 기본값 사용:', error);
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
        memberName: selectedMember?.username,
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
        <Box sx={{ mb: 4, p: 3, border: '2px solid', borderColor: 'primary.light', borderRadius: 3, bgcolor: '#EEF4FA', boxShadow: '0 2px 8px rgba(91, 155, 213, 0.08)' }}>
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
                        {member.username.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{member.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.team}
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
                  {selectedMember.username.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.team}
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
