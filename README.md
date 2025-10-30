# 평가 시스템 (V&V Frontend)

평가 항목에 비율, 점수, 가산점을 입력하여 종합 평가를 수행하는 웹 애플리케이션입니다.

## 주요 기능

- ✅ **평가 항목 관리**: 5개의 데모 평가 항목 (코드 품질, 기능 완성도, 사용자 경험, 성능 최적화, 문서화)
- 📊 **실시간 점수 계산**: 비율에 따른 가중 점수 자동 계산
- 💾 **데이터 저장**: 백엔드 API를 통한 평가 데이터 저장
- 🎨 **모던 UI**: 그라디언트 디자인과 반응형 레이아웃
- ✔️ **유효성 검증**: 비율 합계 100% 자동 검증

## 프로젝트 구조

```
src/
├── components/
│   ├── EvaluationPage.js      # 평가 페이지 메인 컴포넌트
│   └── EvaluationPage.css      # 평가 페이지 스타일
├── services/
│   └── evaluationService.js    # API 통신 서비스
├── App.js                       # 메인 앱 컴포넌트
├── App.css                      # 앱 기본 스타일
└── index.js                     # 앱 진입점
```

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

앱이 개발 모드로 실행됩니다.
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

### 백엔드 API 설정

`.env` 파일을 프로젝트 루트에 생성하고 백엔드 API URL을 설정하세요:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

백엔드 API 명세는 [API_SPEC.md](./API_SPEC.md)를 참조하세요.

## 사용 방법

1. **비율 설정**: 각 항목의 평가 비율을 입력합니다 (합계 100%)
2. **점수 입력**: 각 항목의 점수를 0-100 사이로 입력합니다
3. **가산점 입력**: 필요시 가산점을 입력합니다
4. **저장**: '평가 저장' 버튼을 클릭하여 백엔드에 저장합니다

### 점수 계산 방식

```
가중 점수 = (점수 × 비율 / 100) + 가산점
총점 = 모든 항목의 가중 점수 합계
```

## 기술 스택

- **React 19.2.0**: UI 라이브러리
- **Fetch API**: HTTP 통신
- **CSS3**: 스타일링 (그라디언트, 애니메이션)

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
