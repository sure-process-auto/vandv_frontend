import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Feedback as FeedbackIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext.jsx';
import { getEvaluationByProjectAndMember, submitFeedback, submitInterviewRequest, getMemberRatings, getRatingItems } from '../services/evaluationService.js';

function ResultPage() {
  const { currentProject, currentProjectId, projects, selectProject } = useProject();
  const [evaluationData, setEvaluationData] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [interviewRequest, setInterviewRequest] = useState({ date: '', time: '', message: '' });
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

  // 구성원 데이터 (API에서 로드)
  const [members] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // 평가 항목 템플릿 (API에서 로드)
  const [ratingsTemplate, setRatingsTemplate] = useState([]);

  // 평가 항목 템플릿 로드
  useEffect(() => {
    const loadRatings = async () => {
      try {
        const ratingsData = await getRatingItems();
        
        if (ratingsData && ratingsData.length > 0) {
          const formattedItems = ratingsData.map((item) => ({
            id: item.id, // API에서 받은 실제 ID 사용 (중요!)
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

    loadRatings();
  }, []);

  // 프로젝트 변경 시 구성원 선택 초기화
  useEffect(() => {
    setSelectedMemberId('');
    setEvaluationData(null);
  }, [currentProjectId]);

  // 구성원 선택 시 평가 데이터 불러오기
  useEffect(() => {
    if (!currentProjectId || !selectedMemberId) {
      setEvaluationData(null);
      return;
    }

    // 평가 항목 템플릿이 로드되지 않았으면 대기
    if (ratingsTemplate.length === 0) {
      return;
    }

    const loadEvaluationData = async () => {
      try {
        // API에서 구성원의 평가 점수 가져오기
        console.log('🔵 결과 페이지: 구성원 평가 점수 로드 시작');
        console.log('🔵 선택된 구성원 ID (selectedMemberId):', selectedMemberId);
        console.log('🔵 전체 구성원 정보:', members.find(m => m.id === selectedMemberId));
        
        const memberRatings = await getMemberRatings(selectedMemberId);
        
        if (memberRatings && memberRatings.length > 0) {
          console.log('✅ API에서 받은 평가 점수 (결과 페이지):', memberRatings);
          console.log('📋 평가 항목 템플릿 (결과 페이지):', ratingsTemplate);
          
          // ratingsTemplate과 API 응답 데이터를 매칭
          const mergedItems = ratingsTemplate.map(templateItem => {
            console.log(`🔍 [결과] 매칭 시도 - 항목 ID: ${templateItem.id}, 항목명: ${templateItem.name}`);
            
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
          
          console.log('✅ 최종 매칭된 평가 데이터 (결과 페이지):', mergedItems);
          
          const selectedMember = members.find(m => m.id === selectedMemberId);
          
          // evaluationData 형태로 설정
          setEvaluationData({
            projectId: currentProjectId,
            projectName: currentProject?.name,
            memberId: selectedMemberId,
            memberName: selectedMember?.username,
            items: mergedItems,
            evaluatedAt: new Date().toISOString()
          });
          return;
        }
      } catch (error) {
        console.error('❌ API 조회 실패, localStorage에서 로드:', error);
      }

      // API 실패 시 localStorage에서 조회
      const savedEvaluation = localStorage.getItem(`evaluationData-${currentProjectId}-${selectedMemberId}`);
      if (savedEvaluation) {
        setEvaluationData(JSON.parse(savedEvaluation));
      } else {
        setEvaluationData(null);
      }
    };

    loadEvaluationData();
  }, [currentProjectId, selectedMemberId, ratingsTemplate, currentProject, members]);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // 총 점수 계산
  const getTotalScore = () => {
    if (!evaluationData) return 0;
    return evaluationData.items.reduce((sum, item) => {
      const weightedScore = (item.score * item.ratio) / 100;
      const weightedBonus = (item.bonus * item.ratio) / 100;
      return sum + weightedScore + weightedBonus;
    }, 0);
  };

  // 피드백 제출
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      setSubmitMessage({ text: '피드백 내용을 입력해주세요.', type: 'error' });
      return;
    }

    try {
      const feedbackData = {
        projectId: currentProjectId,
        memberId: selectedMemberId,
        memberName: selectedMember?.name,
        feedback: feedback,
        requestedAt: new Date().toISOString()
      };

      await submitFeedback(feedbackData);
      setSubmitMessage({ text: '피드백이 제출되었습니다.', type: 'success' });
      setTimeout(() => {
        setFeedbackDialogOpen(false);
        setFeedback('');
        setSubmitMessage({ text: '', type: '' });
      }, 1500);
    } catch (error) {
      setSubmitMessage({ text: `제출 실패: ${error.message}`, type: 'error' });
    }
  };

  // 면담 신청
  const handleInterviewRequest = async () => {
    if (!interviewRequest.date || !interviewRequest.time) {
      setSubmitMessage({ text: '희망 날짜와 시간을 입력해주세요.', type: 'error' });
      return;
    }

    try {
      const requestData = {
        projectId: currentProjectId,
        memberId: selectedMemberId,
        memberName: selectedMember?.name,
        requestedDate: interviewRequest.date,
        requestedTime: interviewRequest.time,
        message: interviewRequest.message,
        requestedAt: new Date().toISOString()
      };

      await submitInterviewRequest(requestData);
      setSubmitMessage({ text: '면담 신청이 완료되었습니다.', type: 'success' });
      setTimeout(() => {
        setInterviewDialogOpen(false);
        setInterviewRequest({ date: '', time: '', message: '' });
        setSubmitMessage({ text: '', type: '' });
      }, 1500);
    } catch (error) {
      setSubmitMessage({ text: `신청 실패: ${error.message}`, type: 'error' });
    }
  };

  const totalScore = getTotalScore();

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          평가 결과
        </Typography>

        {/* 프로젝트 및 구성원 선택 */}
        <Box sx={{ mb: 4, p: 3, border: '2px solid', borderColor: 'success.light', borderRadius: 3, bgcolor: '#EDF9F4', boxShadow: '0 2px 8px rgba(112, 193, 165, 0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            결과 조회
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
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
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
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main', fontSize: 20 }}>
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
            결과를 조회하려면 프로젝트와 구성원을 선택해주세요.
          </Alert>
        )}

        {currentProjectId && !selectedMemberId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            구성원을 선택해주세요.
          </Alert>
        )}

        {selectedMemberId && !evaluationData && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            아직 평가가 진행되지 않았습니다.
          </Alert>
        )}

        {evaluationData && (
          <Box>
            {/* 총 점수 요약 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={12}>
                <Card elevation={0} sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          총 점수
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                          {totalScore.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          평가일: {new Date(evaluationData.evaluatedAt).toLocaleString('ko-KR')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<FeedbackIcon />}
                          onClick={() => setFeedbackDialogOpen(true)}
                          size="large"
                        >
                          피드백 요청
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<EventIcon />}
                          onClick={() => setInterviewDialogOpen(true)}
                          size="large"
                        >
                          면담 신청
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 평가 결과 테이블 */}
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'success.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>항목</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">비율 (%)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">점수</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가산점</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">의견</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">가중 점수</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluationData.items.map((item) => {
                    const weightedScore = (item.score * item.ratio) / 100;
                    const weightedBonus = (item.bonus * item.ratio) / 100;
                    const finalScore = weightedScore + weightedBonus;

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${item.ratio}%`} color="primary" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {item.score}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`+${item.bonus}`} 
                            color={item.bonus > 0 ? 'success' : 'default'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2" sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                            {item.comment || '-'}
                          </Typography>
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
          </Box>
        )}

        {/* 피드백 요청 다이얼로그 */}
        <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>피드백 요청</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                평가 결과에 대해 추가 피드백을 요청할 수 있습니다.
              </Typography>
              <TextField
                label="피드백 요청 내용"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                fullWidth
                multiline
                rows={6}
                placeholder="평가 결과에 대해 궁금한 점이나 추가로 듣고 싶은 피드백을 작성해주세요."
              />
              {submitMessage.text && (
                <Alert severity={submitMessage.type} sx={{ mt: 2 }}>
                  {submitMessage.text}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackDialogOpen(false)}>취소</Button>
            <Button onClick={handleFeedbackSubmit} variant="contained" startIcon={<FeedbackIcon />}>
              제출
            </Button>
          </DialogActions>
        </Dialog>

        {/* 면담 신청 다이얼로그 */}
        <Dialog open={interviewDialogOpen} onClose={() => setInterviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>면담 신청</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                평가 결과에 대해 1:1 면담을 신청할 수 있습니다.
              </Typography>
              <TextField
                label="희망 날짜"
                type="date"
                value={interviewRequest.date}
                onChange={(e) => setInterviewRequest({ ...interviewRequest, date: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="희망 시간"
                type="time"
                value={interviewRequest.time}
                onChange={(e) => setInterviewRequest({ ...interviewRequest, time: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="면담 요청 사유 (선택)"
                value={interviewRequest.message}
                onChange={(e) => setInterviewRequest({ ...interviewRequest, message: e.target.value })}
                fullWidth
                multiline
                rows={4}
                placeholder="면담에서 논의하고 싶은 내용을 간단히 작성해주세요."
              />
              {submitMessage.text && (
                <Alert severity={submitMessage.type} sx={{ mt: 2 }}>
                  {submitMessage.text}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInterviewDialogOpen(false)}>취소</Button>
            <Button onClick={handleInterviewRequest} variant="contained" startIcon={<EventIcon />}>
              신청
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default ResultPage;

