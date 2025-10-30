# 평가 시스템 API 명세

## 기본 정보

- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`

## 환경 변수 설정

`.env` 파일을 생성하여 백엔드 API URL을 설정할 수 있습니다:

```
REACT_APP_API_URL=http://localhost:8080/api
```

---

## API 엔드포인트

### 1. 평가 저장 (Create)

새로운 평가를 생성합니다.

**Endpoint**: `POST /evaluations`

**Request Body**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "코드 품질",
      "ratio": 30,
      "score": 85,
      "bonus": 5
    },
    {
      "id": 2,
      "name": "기능 완성도",
      "ratio": 25,
      "score": 90,
      "bonus": 0
    }
  ],
  "totalScore": 87.5,
  "evaluatedAt": "2025-10-30T12:00:00.000Z"
}
```

**Response** (성공 - 201 Created):
```json
{
  "success": true,
  "message": "평가가 성공적으로 저장되었습니다",
  "data": {
    "id": "1",
    "items": [...],
    "totalScore": 87.5,
    "evaluatedAt": "2025-10-30T12:00:00.000Z",
    "createdAt": "2025-10-30T12:00:00.000Z"
  }
}
```

**Response** (실패 - 400 Bad Request):
```json
{
  "success": false,
  "message": "잘못된 요청입니다"
}
```

---

### 2. 평가 목록 조회 (Read All)

저장된 모든 평가를 조회합니다.

**Endpoint**: `GET /evaluations`

**Response** (성공 - 200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "items": [...],
      "totalScore": 87.5,
      "evaluatedAt": "2025-10-30T12:00:00.000Z",
      "createdAt": "2025-10-30T12:00:00.000Z"
    },
    {
      "id": "2",
      "items": [...],
      "totalScore": 92.3,
      "evaluatedAt": "2025-10-30T13:00:00.000Z",
      "createdAt": "2025-10-30T13:00:00.000Z"
    }
  ]
}
```

---

### 3. 특정 평가 조회 (Read One)

특정 ID의 평가를 조회합니다.

**Endpoint**: `GET /evaluations/:id`

**Path Parameters**:
- `id` (string): 평가 ID

**Response** (성공 - 200 OK):
```json
{
  "success": true,
  "data": {
    "id": "1",
    "items": [...],
    "totalScore": 87.5,
    "evaluatedAt": "2025-10-30T12:00:00.000Z",
    "createdAt": "2025-10-30T12:00:00.000Z"
  }
}
```

**Response** (실패 - 404 Not Found):
```json
{
  "success": false,
  "message": "평가를 찾을 수 없습니다"
}
```

---

### 4. 평가 수정 (Update)

기존 평가를 수정합니다.

**Endpoint**: `PUT /evaluations/:id`

**Path Parameters**:
- `id` (string): 평가 ID

**Request Body**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "코드 품질",
      "ratio": 30,
      "score": 90,
      "bonus": 5
    }
  ],
  "totalScore": 90.0,
  "evaluatedAt": "2025-10-30T12:00:00.000Z"
}
```

**Response** (성공 - 200 OK):
```json
{
  "success": true,
  "message": "평가가 성공적으로 수정되었습니다",
  "data": {
    "id": "1",
    "items": [...],
    "totalScore": 90.0,
    "evaluatedAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T14:00:00.000Z"
  }
}
```

---

### 5. 평가 삭제 (Delete)

특정 평가를 삭제합니다.

**Endpoint**: `DELETE /evaluations/:id`

**Path Parameters**:
- `id` (string): 평가 ID

**Response** (성공 - 200 OK):
```json
{
  "success": true,
  "message": "평가가 성공적으로 삭제되었습니다"
}
```

**Response** (실패 - 404 Not Found):
```json
{
  "success": false,
  "message": "평가를 찾을 수 없습니다"
}
```

---

## 데이터 모델

### Evaluation Item
```typescript
{
  id: number;           // 항목 ID
  name: string;         // 항목 이름
  ratio: number;        // 비율 (0-100)
  score: number;        // 점수 (0-100)
  bonus: number;        // 가산점
}
```

### Evaluation
```typescript
{
  id: string;           // 평가 ID
  items: EvaluationItem[]; // 평가 항목 배열
  totalScore: number;   // 총점
  evaluatedAt: string;  // 평가 일시 (ISO 8601)
  createdAt: string;    // 생성 일시 (ISO 8601)
  updatedAt?: string;   // 수정 일시 (ISO 8601, 선택적)
}
```

---

## 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

---

## CORS 설정

백엔드 서버는 다음 CORS 헤더를 포함해야 합니다:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 백엔드 구현 예시 (Node.js + Express)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let evaluations = [];
let nextId = 1;

// 평가 저장
app.post('/api/evaluations', (req, res) => {
  const evaluation = {
    id: String(nextId++),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  evaluations.push(evaluation);
  res.status(201).json({
    success: true,
    message: '평가가 성공적으로 저장되었습니다',
    data: evaluation
  });
});

// 평가 목록 조회
app.get('/api/evaluations', (req, res) => {
  res.json({
    success: true,
    data: evaluations
  });
});

// 특정 평가 조회
app.get('/api/evaluations/:id', (req, res) => {
  const evaluation = evaluations.find(e => e.id === req.params.id);
  if (!evaluation) {
    return res.status(404).json({
      success: false,
      message: '평가를 찾을 수 없습니다'
    });
  }
  res.json({
    success: true,
    data: evaluation
  });
});

// 평가 수정
app.put('/api/evaluations/:id', (req, res) => {
  const index = evaluations.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '평가를 찾을 수 없습니다'
    });
  }
  evaluations[index] = {
    ...evaluations[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json({
    success: true,
    message: '평가가 성공적으로 수정되었습니다',
    data: evaluations[index]
  });
});

// 평가 삭제
app.delete('/api/evaluations/:id', (req, res) => {
  const index = evaluations.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '평가를 찾을 수 없습니다'
    });
  }
  evaluations.splice(index, 1);
  res.json({
    success: true,
    message: '평가가 성공적으로 삭제되었습니다'
  });
});

app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
```




