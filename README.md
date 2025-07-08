# 📄 문서 요약/질문 에이전트

AI를 활용한 문서 요약 및 질문 답변 시스템입니다.

## 🎨 레이아웃 구조

### 📋 3개 영역 구성
1. **상단 영역**: 제목 표시 ("문서 요약/질문 에이전트")
2. **좌측 영역 (40%)**: 문서 업로드 기능
3. **우측 영역 (60%)**: 요청 버튼 및 결과 표시

### 📐 비율 구성
- 좌측 : 우측 = 4 : 6
- 반응형 디자인으로 모바일에서도 최적화

## 🚀 주요 기능

### 📁 문서 업로드 (좌측 영역)
- **제목**: "문서 업로드"
- **업로드 방식**: 드래그 앤 드롭 또는 클릭
- **지원 형식**: TXT, PDF, DOCX, MD (최대 10MB)
- **실시간 검증**: 파일 형식 및 크기 체크
- **상태 표시**: 업로드 완료 시 파일 정보 표시

### 🎯 기능 버튼 (우측 영역)
- **문서 요약하기**: AI 기반 문서 요약 생성
- **질문하기**: 문서에 대한 질문 답변
- **버튼 배치**: 나란히 배치, 동일한 너비
- **상태 관리**: 파일 업로드 전까지 비활성화

### 📊 결과 표시 (우측 영역)
- **문서 요약**: 구조화된 요약 결과 표시
- **질문 답변**: 채팅 형태의 실시간 대화
- **복사 기능**: 요약 결과 클립보드 복사
- **스크롤**: 긴 내용에 대한 스크롤 지원

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: CSS 애니메이션
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
```
http://localhost:3000
```

## 🔧 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 서버 실행
```bash
npm start
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel
```

## 📱 사용 방법

1. **문서 업로드**: 좌측 영역에서 TXT, PDF, DOCX, MD 파일을 업로드
2. **기능 선택**: 우측 영역에서 "문서 요약하기" 또는 "질문하기" 버튼 클릭
3. **결과 확인**: 선택한 기능에 따라 요약 또는 질문 답변 결과 확인

## 🎨 UI/UX 특징

- **깔끔한 레이아웃**: 3개 영역으로 명확히 구분
- **직관적인 사용성**: 단계별 진행 방식
- **반응형 디자인**: 모바일과 데스크톱 최적화
- **실시간 피드백**: 로딩 상태, 에러 메시지 등
- **현대적인 디자인**: Tailwind CSS 기반 모던 인터페이스

## 📝 프로젝트 구조

```
├── app/
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── NewDocumentAnalyzer.tsx  # 메인 컴포넌트
│   ├── DocumentUpload.tsx       # 문서 업로드 (좌측)
│   └── DocumentResults.tsx      # 결과 표시 (우측)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔄 확장 가능성

현재는 시뮬레이션 기능이지만, 다음과 같은 실제 AI 서비스와 연동할 수 있습니다:

- **문서 파싱**: PDF.js, mammoth.js (DOCX)
- **AI 서비스**: OpenAI GPT API, Google Gemini API
- **백엔드 연동**: Next.js API Routes, Express.js
- **데이터베이스**: MongoDB, PostgreSQL
- **파일 저장**: AWS S3, Cloudinary

## 🌟 주요 개선사항

### 새로운 레이아웃
- 4:6 비율로 좌우 영역 분할
- 상단 제목 영역 추가
- 더 직관적인 사용자 경험

### 향상된 기능
- Word 파일 지원 추가
- 실시간 상태 표시
- 개선된 에러 처리

## 🤝 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 CSS 프레임워크
- [Lucide React](https://lucide.dev/) - 아이콘 라이브러리
- [Vercel](https://vercel.com/) - 배포 플랫폼 