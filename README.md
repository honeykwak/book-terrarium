# 북 테라리움, 소원 (Book Terrarium, Sowon)

**당신만의 작은 서재에서 피어나는 마음의 위로**

'북 테라리움, 소원'은 사용자의 독서 취향과 감정 상태를 분석하여 맞춤형 책을 추천하고, AI와의 깊이 있는 대화를 통해 마음의 위로를 전하는 **지능형 독서 치료 에이전트 서비스**입니다.

## 🔗 서비스 접속하기
[**북 테라리움 소개 및 시작하기**](https://book-terrarium.vercel.app/info)
> 지금 바로 접속하여 당신만의 테라리움을 가꿔보세요.

---

## ✨ 핵심 기술 및 기능 (Key Features)

본 서비스는 최신 웹 개발 트렌드와 기술 스택을 집약하여 안정적이고 혁신적인 사용자 경험을 제공합니다.

### 1. 🤖 인공지능 기반 독서 치료 (AI-Powered Bibliotherapy)
- **Generative AI Integration**: Google Gemini 모델을 활용하여 사용자의 감정과 고민을 이해하고, 이를 치유(Bibliotherapy)할 수 있는 로직을 수행합니다.
- **Context-Aware Dialogue**: 사용자의 이전 대화 맥락과 독서 기록을 기억하여 깊이 있는 상담 서비스를 제공합니다.

### 2. 🏗️ 모던 웹 아키텍처 (Modern Web Architecture)
- **React & TypeScript**: 컴포넌트 기반의 `React` 프레임워크와 정적 타입 시스템인 `TypeScript`를 도입하여, 안정적이고 유지보수가 용이한 프론트엔드 구조를 설계했습니다.
- **3-Tier Layered Architecture**: Presentation(UI), Service(Business Logic), Data(Infra) 계층을 엄격히 분리하여 로직의 명확성과 확장성을 확보했습니다.
- **Design Patterns**: 효율적인 상태 관리와 재사용성을 고려한 최신 디자인 패턴을 적용했습니다.

### 3. ☁️ 서버리스 데이터 플랫폼 (Serverless Data Platform)
- **Supabase (BaaS)**: 전통적인 백엔드 구축 대신 `Supabase`를 활용하여 인증(Auth), 데이터베이스(DB), 스토리지 등을 통합 관리합니다.
- **Scalable Database**: 관계형 데이터베이스(RDBMS) 설계를 통해 사용자 프로필, 서재, 채팅 로그 등 방대한 데이터를 효율적으로 구조화했습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: CSS Modules, Vanilla CSS (Modern Design System)

### Backend & Infrastructure
- **BaaS**: Supabase (PostgreSQL, Auth)
- **Hosting**: Vercel

### AI & Data
- **LLM**: Google Gemini (Generative AI)
- **External API**: Google Books API (Book Metadata)

---

## 📂 시스템 구조
본 프로젝트는 **Client-Side Rendering (CSR)** 기반으로 설계되었으며, `Services` 레이어를 통해 비즈니스 로직을 캡슐화하고 있습니다. 상세한 아키텍처 구조는 [ARCHITECTURE.md](./ARCHITECTURE.md) 파일에서 확인하실 수 있습니다.

> "책은 우리 내면의 얼어붙은 바다를 깨는 도끼여야 한다." - 프란츠 카프카
> 
> **북 테라리움, 소원**이 당신의 마음을 두드리는 도끼가 되어드리겠습니다.
