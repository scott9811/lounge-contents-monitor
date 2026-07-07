# 라운지 콘텐츠 모니터링 대시보드

고객사 라운지의 콘텐츠 블럭 현황을 모니터링하는 내부 대시보드입니다.

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 백엔드 서버 | Node.js + Express |
| 데이터베이스 | Supabase (읽기 전용) |
| 프론트엔드 | 바닐라 HTML/CSS/JS (프레임워크 없음) |
| 배포 | Render (GitHub 푸시 시 자동 배포) |

---

## 파일 구조

```
lounge-contents-monitor/
├── server.js          # Express 서버 진입점 (건드릴 일 거의 없음)
├── dataService.js     # 핵심 파일 — 브랜드 목록, Supabase 데이터 조회 로직
├── public/
│   └── index.html     # 대시보드 UI 전체 (HTML + CSS + JS 한 파일)
├── .env               # 환경변수 (Supabase 키 등 — Git에 올라가지 않음)
└── package.json       # Node.js 의존성
```

---

## 로컬에서 실행하기

### 1. 필요한 것
- Node.js (v18 이상 권장)
- Git

### 2. 처음 세팅

```bash
# 저장소 클론
git clone https://github.com/scott9811/lounge-contents-monitor.git
cd lounge-contents-monitor

# 의존성 설치
npm install

# 환경변수 파일 생성
# .env 파일을 아래 내용으로 직접 만들거나, 기존 파일을 복사
```

**.env 파일 내용** (scott에게 받아야 함):
```
SUPABASE_URL=https://edtsbqqelgfarqrgqbby.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<키값>
PORT=3000
```

> ⚠️ `.env` 파일은 Git에 올라가지 않으므로 반드시 직접 만들어야 합니다.

### 3. 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

---

## 배포 구조

```
로컬에서 코드 수정
   ↓
git add / commit / push (GitHub)
   ↓
Render가 자동 감지 → 자동 배포 (약 1~2분 소요)
   ↓
실서버에 반영
```

- Render 대시보드: https://dashboard.render.com
- 환경변수(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)는 Render 대시보드 → Environment 탭에도 등록되어 있어야 함

---

## 자주 하는 작업

### ① 브랜드 추가/제거

**파일:** `dataService.js`

**`BRAND_NAMES` 객체** — `idx: '브랜드명'` 형식으로 추가/제거

```js
const BRAND_NAMES = {
  2604: '마인드브릿지',
  2614: '지오지아 ZIOZIA',
  // 여기에 추가: 새로운idx: '브랜드명',
};
```

**`TARGET_BRANDS` 배열** — 모니터링할 brand_idx 숫자 목록

```js
const TARGET_BRANDS = [
  44, 290, 293, ...
  // 여기에 추가하거나 제거
];
```

> BRAND_NAMES와 TARGET_BRANDS 양쪽 모두 수정해야 합니다.

---

### ② 고객사 목록 테이블(섹션 10) 수정

**파일:** `public/index.html`  
**위치:** 파일 하단 `const BRANDS_LIST = [` 부분

각 행의 형식:
```js
['Tier X', '카테고리', idx번호, '브랜드명', '담당자', '솔루션비', '구축비', '계약시작일(최초)', '계약시작일(최근)', '계약종료일', '결제방식', '계약유형'],
```

예시:
```js
['Tier 3', '패션', 2743, 'ALTRA', '권혁남', '1,500,000', '', '2026-06-15', '', '2026-12-14', '세금계산서', '연계약'],
```

---

### ③ 상단 배너 고객사 수 수정

**파일:** `public/index.html`  
**검색어:** `현재 관리 중인 고객사`

```html
<div class="intro-banner-desc">현재 관리 중인 고객사 82개의 라운지 콘텐츠...</div>
```

숫자만 바꾸면 됩니다.

---

### ④ 키워드 불용어(무시할 단어) 수정

**파일:** `dataService.js`  
**위치:** `KEYWORD_STOP_WORDS` Set

```js
const KEYWORD_STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', ...
]);
```

---

## 섹션별 데이터 소스

| 섹션 | 내용 | 데이터 소스 |
|---|---|---|
| 01 콘텐츠 블럭 사용 현황 | 브랜드별 블럭 목록 | Supabase |
| 02 최근 14일 업데이트 | 최근 수정된 브랜드 | Supabase |
| 03 동일 URL 중복 | 중복 URL 감지 | Supabase |
| 04 블럭 유형별 사용 개수 | 차트 | Supabase |
| 05 많이 쓰이는 키워드 | 2-gram 텍스트 분석 | Supabase |
| 06 배경 컬러 현황 | 라운지 배경색 | Supabase |
| 07 숨김 처리만 해둔 브랜드 | 전체 숨김 브랜드 | Supabase |
| 08 콘텐츠 모듈 비활성화 | 비활성화 브랜드 | Supabase |
| 09 장기 미업데이트 | 30일+ 미수정 | Supabase |
| 10 고객사 목록 | 계약 정보 테이블 | **HTML에 하드코딩** |

> 섹션 10만 Supabase 연동 없이 `index.html` 내 `BRANDS_LIST` 배열에 직접 작성된 정적 데이터입니다.

---

## Git 작업 흐름

```bash
# 변경사항 확인
git status

# 파일 스테이징
git add dataService.js public/index.html

# 커밋
git commit -m "브랜드 목록 업데이트: XXX 추가, YYY 제거"

# 배포 (push하면 Render가 자동으로 배포)
git push
```

---

## 문의

- Supabase 접근 권한, Render 대시보드 접근 → scott@vircle.co.kr
