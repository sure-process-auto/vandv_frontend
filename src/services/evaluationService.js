// API 기본 URL (환경변수로 설정 가능)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * 평가 데이터를 백엔드에 저장
 * @param {Object} evaluationData - 평가 데이터 객체
 * @returns {Promise<Object>} 서버 응답
 */
export const saveEvaluation = async (evaluationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluationData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
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
    const response = await fetch(`${API_BASE_URL}/evaluations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
    const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
    const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluationData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
    const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('백엔드 서버에 연결할 수 없습니다.');
    }
    throw error;
  }
};




