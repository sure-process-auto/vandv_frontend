import axios from 'axios';

// API 기본 URL (프록시 사용을 위한 상대 경로)
// package.json의 proxy 설정이 http://172.16.1.36:8080으로 연결
const API_BASE_URL = '/api';

// PM ID를 localStorage에서 가져오는 함수
const getPmId = () => {
  return localStorage.getItem('PM_ID') || '4g9b2e7f1c8a0d6h3k5j';
};

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

/**
 * 평가 데이터를 백엔드에 저장
 * @param {Object} evaluationData - 평가 데이터 객체
 * @returns {Promise<Object>} 서버 응답
 */
export const saveEvaluation = async (evaluationData) => {
  try {
    const response = await apiClient.post('/evaluations', evaluationData);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    if (error.response) {
      // 서버가 응답을 반환한 경우
      throw new Error(error.response.data.message || `서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
};

/**
 * 사용자 평가 점수 저장
 * @param {string} totalScore - 총점
 * @param {Array} ratings - 평가 항목 리스트 (List<Map<String, String>>)
 * - itemInfo: 평가 항목 ID
 * - plus: 가산점
 * - score: 점수
 * - userInfo: 사용자 ID
 * - comment: 의견
 * @returns {Promise<Boolean>} 저장 성공 여부
 */
export const saveUserRatings = async (totalScore, ratings) => {
  try {
    const response = await apiClient.post('/saveUserRatings', ratings, {
      params: {
        totalScore: totalScore
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`서버 오류 (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 평가 목록 조회
 * @returns {Promise<Array>} 평가 목록
 */
export const getEvaluations = async () => {
  try {
    const response = await apiClient.get('/evaluations');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 특정 평가 조회
 * @param {number|string} evaluationId - 평가 ID
 * @returns {Promise<Object>} 평가 데이터
 */
export const getEvaluationById = async (evaluationId) => {
  try {
    const response = await apiClient.get(`/evaluations/${evaluationId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 평가 수정
 * @param {number|string} evaluationId - 평가 ID
 * @param {Object} evaluationData - 수정할 평가 데이터
 * @returns {Promise<Object>} 서버 응답
 */
export const updateEvaluation = async (evaluationId, evaluationData) => {
  try {
    const response = await apiClient.put(`/evaluations/${evaluationId}`, evaluationData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || `서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 평가 삭제
 * @param {number|string} evaluationId - 평가 ID
 * @returns {Promise<Object>} 서버 응답
 */
export const deleteEvaluation = async (evaluationId) => {
  try {
    const response = await apiClient.delete(`/evaluations/${evaluationId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 프로젝트와 구성원별 평가 조회
 * @param {string} projectId - 프로젝트 ID
 * @param {string} memberId - 구성원 ID
 * @returns {Promise<Object>} 평가 데이터
 */
export const getEvaluationByProjectAndMember = async (projectId, memberId) => {
  try {
    const response = await apiClient.get(`/evaluations/project/${projectId}/member/${memberId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // 평가 데이터가 없는 경우
    }
    if (error.response) {
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 피드백 요청 제출
 * @param {Object} feedbackData - 피드백 데이터
 * @returns {Promise<Object>} 서버 응답
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || `서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 면담 신청 제출
 * @param {Object} interviewData - 면담 신청 데이터
 * @returns {Promise<Object>} 서버 응답
 */
export const submitInterviewRequest = async (interviewData) => {
  try {
    const response = await apiClient.post('/interview-requests', interviewData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || `서버 오류: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};

/**
 * 팀 구성원 리스트 조회
 * @returns {Promise<Array>} 팀 구성원 리스트 (List<Map<String,String>> 형태)
 */
export const getAllTeamMembers = async () => {
  try {
    const url = `/getAllTeamMembers/${getPmId()}`;
    console.log('🔵 API 호출:', url);
    console.log('🔵 전체 URL:', `${API_BASE_URL}${url}`);
    
    const response = await apiClient.get(url);
    
    console.log('📡 Response status:', response.status);
    console.log('✅ 받은 데이터:', response.data);
    console.log('✅ 데이터 타입:', Array.isArray(response.data) ? 'Array' : typeof response.data);
    console.log('✅ 데이터 개수:', response.data?.length || 0);
    
    // List<Map<String,String>> 형태의 데이터를 반환
    return response.data || [];
  } catch (error) {
    console.error('❌ API 에러:', error);
    
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      
      if (error.response.status === 404) {
        console.warn('⚠️ 팀 구성원을 찾을 수 없습니다. (404)');
        return [];
      }
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    
    if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('🔴 백엔드 서버에 연결할 수 없습니다. 하드코딩된 데이터를 사용합니다.');
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      return [];
    }
    
    // 기타 에러
    console.error('❌ 에러 메시지:', error.message);
    throw error;
  }
};

/**
 * 평가 항목 리스트 조회 (rating items)
 * @returns {Promise<Array>} 평가 항목 리스트 (List<Map<String,String>> 형태, name과 ratio 포함)
 */
export const getRatingItems = async () => {
  try {
    const url = `/getRatingItems/${getPmId()}`;
    const response = await apiClient.get(url);
    return response.data || [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return [];
      }
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    
    if (error.request) {
      return [];
    }
    
    throw error;
  }
};

/**
 * 특정 사용자의 평가 점수 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} 사용자 평가 점수 리스트 (List<Map<String,String>> 형태)
 * - iteminfo: 평가 항목 ID
 * - userinfo: 사용자 ID
 * - score: 점수
 * - plus: 가산점
 * - comment: 의견
 */
export const getMemberRatings = async (userId) => {
  try {
    console.log('🔵 getMemberRatings 호출됨');
    console.log('🔵 전달받은 userId 파라미터:', userId);
    console.log('🔵 userId 타입:', typeof userId);
    
    const url = `/getMemberRatings/${userId}`;
    console.log('🔵 API 호출 (사용자 평가 점수):', url);
    console.log('🔵 전체 URL:', `${API_BASE_URL}${url}`);
    
    const response = await apiClient.get(url);
    
    console.log('📡 Response status:', response.status);
    console.log('✅ 받은 평가 점수 데이터:', response.data);
    console.log('✅ 데이터 타입:', Array.isArray(response.data) ? 'Array' : typeof response.data);
    console.log('✅ 평가 점수 개수:', response.data?.length || 0);
    
    // List<Map<String,String>> 형태의 데이터를 반환
    // iteminfo, userinfo, score, plus, comment
    return response.data || [];
  } catch (error) {
    console.error('❌ 사용자 평가 점수 API 에러:', error);
    
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      
      if (error.response.status === 404) {
        console.warn('⚠️ 사용자 평가 점수를 찾을 수 없습니다. (404)');
        return [];
      }
      throw new Error(`서버 오류: ${error.response.status}`);
    }
    
    if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('🔴 백엔드 서버에 연결할 수 없습니다.');
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      return [];
    }
    
    // 기타 에러
    console.error('❌ 에러 메시지:', error.message);
    throw error;
  }
};
