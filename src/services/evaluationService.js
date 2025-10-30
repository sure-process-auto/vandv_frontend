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
    const url = `/getMemberRatings/${userId}`;
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
