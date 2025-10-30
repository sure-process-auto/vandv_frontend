import axios from 'axios';

// API 기본 URL (프록시 사용을 위한 상대 경로)
// package.json의 proxy 설정이 http://172.16.1.36:8080으로 연결
const API_BASE_URL = '/api';
const EMPLOYEE_1 = 'a6f3b0e8d2c9h1g7k4j';
const EMPLOYEE_2 = 'd8g2b5f0c1h3e6k7a9j';
// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

export const getResult = async (employeeId, year) => {
  try {
    let id;
    if (employeeId === 'user') {
      id = EMPLOYEE_1;
    } else if (employeeId === 'user2') {
      id = EMPLOYEE_2;
    }
    const response = await apiClient.get(`/getResult/${id}?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};