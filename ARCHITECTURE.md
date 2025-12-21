# 서비스 3-Tier 아키텍처 상세 문서

본 문서는 현재 개발 중인 독서 치료 에이전트 서비스(Book Terrarium)의 3-Tier 아키텍처 구조를 상세히 기술합니다.
서비스는 **Client-Side Rendering (CSR)** 기반의 React 애플리케이션으로, **Supabase**를 백엔드 서비스(BaaS)로 활용하고 있습니다. 논리적인 3계층 구조는 다음과 같습니다.

---

## 🏗️ 1. Tier 1: Presentation Layer (프레젠테이션 계층)
**역할:** 사용자 인터페이스(UI) 제공 및 사용자 상호작용 처리

이 계층은 사용자가 직접 마주하는 웹 브라우저 상의 화면을 담당합니다. React 프레임워크를 사용하여 컴포넌트 단위로 UI를 구성하며, 사용자의 입력을 받아 Application Layer로 전달하고, 결과를 화면에 렌더링합니다.

*   **주요 기술:**
    *   **Framework:** React (Vite)
    *   **Language:** TypeScript (TSX)
    *   **Styling:** CSS Modules / Global CSS

*   **주요 구성 요소 (Components):**
    *   **`App.tsx`**: 애플리케이션의 진입점(Entry Point)이자 라우팅 및 전역 상태 관리의 최상위 컨테이너.
    *   **`components/Onboarding.tsx`**: 초기 사용자 설정 및 취향 분석을 위한 인터페이스.
    *   **`components/InputArea.tsx`**: 사용자와 AI 간의 대화 입력을 담당하는 UI.
    *   **`components/` (기타)**: `BookList`, `ChatBubble` 등 재사용 가능한 UI 요소들.

*   **특징:**
    *   비즈니스 로직을 직접 수행하지 않고, `services` 계층의 모듈을 호출하여 데이터를 요청합니다.
    *   사용자 경험(UX)을 최적화하기 위한 상태 관리(State Management)를 수행합니다.

---

## ⚙️ 2. Tier 2: Application Layer (애플리케이션/비즈니스 로직 계층)
**역할:** 데이터 처리, 비즈니스 규칙 적용, 데이터 계층과의 통신 중개

이 계층은 프레젠테이션 계층과 데이터 계층 사이의 가교 역할을 합니다. 클라이언트 측 코드 내 `services/` 디렉토리에 위치하지만, 논리적으로는 애플리케이션의 핵심 로직을 담당하는 미들웨어 역할을 수행합니다.

*   **주요 기술:** TypeScript, External API SDKs

*   **주요 모듈 (Services):**
    *   **`dbService.ts` (Core Logic)**:
        *   **데이터 중개:** Supabase 클라이언트를 사용하여 데이터베이스와 직접 통신합니다.
        *   **비즈니스 로직:**
            *   `getOrCreateBook`: 책 정보가 DB에 있으면 가져오고, 없으면 새로 생성하는 캐싱 로직 수행.
            *   `createUserBook`: 사용자와 책을 연결하며 상태(독서 중 등)를 초기화.
            *   데이터 포맷팅: DB의 Raw 데이터를 프론트엔드에서 사용하기 쉬운 형태(`Book`, `Message` 타입)로 변환(`mapUserBook` 등).
    *   **`geminiService.ts`**:
        *   Google Gemini AI 모델과의 통신을 담당합니다.
        *   프롬프트 엔지니어링 및 AI 응답 처리를 수행합니다.
    *   **`googleBooksService.ts`**:
        *   외부 도서 검색 API 호출 및 데이터 정규화를 담당합니다.

*   **특징:**
    *   UI 종속성이 없으며, 순수한 데이터 로직에 집중합니다.
    *   에러 핸들링 및 데이터 유효성 검사를 수행합니다.

---

## 💾 3. Tier 3: Data Layer (데이터 및 인프라 계층)
**역할:** 영구적인 데이터 저장 및 외부 데이터 소스 제공

이 계층은 실제 데이터가 저장되거나 생성되는 원천(Source of Truth)입니다. Supabase(PostgreSQL) 데이터베이스와 외부 API 서비스들이 여기에 해당합니다.

*   **주요 구성 요소:**

    ### A. Supabase (Database)
    *   **역할:** 서비스의 핵심 데이터를 영구 저장.
    *   **주요 테이블 구조:**
        *   **`profiles`**: 사용자 정보 (닉네임, 취향 등).
        *   **`books`**: 책 메타데이터 (ISBN, 제목, 저자, 표지 등). 모든 사용자가 공유하는 마스터 데이터.
        *   **`user_books`**: 사용자와 책의 관계 (내 서재). 독서 상태, 평점, 리뷰 저장.
        *   **`chat_sessions`**: AI와의 대화 세션 관리.
        *   **`messages`**: 실제 대화 내용 저장.
        *   **`post_likes`**: 커뮤니티 게시글 좋아요 정보.

    ### B. External APIs (External Data Sources)
    *   **Google Books API:**
        *   전 세계 도서 정보의 원천 데이터베이스 역할.
        *   우리 서비스의 DB(`books` 테이블)에 없는 책을 검색할 때 사용됩니다.
    *   **Google Gemini API (LLM):**
        *   지능형 응답 및 독서 치료 상담 로직을 처리하는 '지능형 데이터 소스'.

---

## 🔄 데이터 흐름 예시 (Data Flow Example)

**시나리오: 사용자가 새로운 책을 검색하고 내 서재에 추가하는 경우**

1.  **Tier 1 (UI)**: 사용자가 `SearchInput` 컴포넌트에서 "데미안"을 검색.
2.  **Tier 2 (Service)**:
    *   `googleBooksService`가 Google Books API(**Tier 3**)를 호출하여 검색 결과 수신.
    *   사용자가 특정 책을 선택하면, `dbService.createUserBook` 함수 호출.
3.  **Tier 2 (Logic)**:
    *   `dbService`는 먼저 `books` 테이블(**Tier 3**)을 조회하여 해당 책이 이미 존재하는지 확인.
    *   없다면 `books` 테이블에 새 책 정보를 Insert (캐싱).
    *   그 후 `user_books` 테이블(**Tier 3**)에 사용자와 책의 관계를 Insert.
4.  **Tier 3 (DB)**: Supabase가 트랜잭션 처리 후 저장된 데이터를 반환.
5.  **Tier 1 (UI)**: `App.tsx`가 상태를 업데이트하고, 화면에 "내 서재에 추가됨"을 표시.
