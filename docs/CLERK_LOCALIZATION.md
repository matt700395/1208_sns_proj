# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 표시하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [설정 방법](#설정-방법)
3. [커스텀 로컬라이제이션](#커스텀-로컬라이제이션)
4. [에러 메시지 커스터마이징](#에러-메시지-커스터마이징)
5. [지원 언어](#지원-언어)

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 한국어는 `koKR` 키로 제공됩니다.

> ⚠️ **주의**: 이 기능은 현재 실험적(experimental)입니다. 예상치 못한 동작이 발생할 수 있습니다.

## 설정 방법

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```bash
pnpm add @clerk/localizations
```

### 2. 한국어 로컬라이제이션 적용

`app/layout.tsx`에서 `ClerkProvider`에 `localization` prop을 전달합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        cssLayerName: "clerk", // Tailwind CSS 4 호환성 필수
      }}
    >
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. HTML lang 속성 설정

`<html>` 태그에 `lang="ko"` 속성을 추가합니다:

```tsx
<html lang="ko">
```

## 커스텀 로컬라이제이션

기본 한국어 번역을 수정하거나 특정 텍스트만 변경하려면 `koKR` 객체를 확장할 수 있습니다:

```tsx
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    start: {
      ...koKR.signIn.start,
      subtitle: "{{applicationName}}에 접속하려면 로그인하세요",
    },
  },
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp.start,
      subtitle: "{{applicationName}}에 가입하려면 계정을 만드세요",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {/* ... */}
    </ClerkProvider>
  );
}
```

## 에러 메시지 커스터마이징

특정 에러 메시지를 커스터마이징하려면 `unstable__errors` 키를 사용합니다:

```tsx
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
    form_identifier_not_found:
      "등록되지 않은 이메일 주소입니다. 먼저 회원가입을 진행해주세요.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {/* ... */}
    </ClerkProvider>
  );
}
```

### 사용 가능한 에러 키

전체 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 `unstable__errors` 객체를 검색하여 확인할 수 있습니다.

## 지원 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 키 | 언어 태그 (BCP 47) |
|------|-----|-------------------|
| 한국어 | `koKR` | ko-KR |
| 영어 (미국) | `enUS` | en-US |
| 영어 (영국) | `enGB` | en-GB |
| 일본어 | `jaJP` | ja-JP |
| 중국어 (간체) | `zhCN` | zh-CN |
| 중국어 (번체) | `zhTW` | zh-TW |
| 스페인어 | `esES` | es-ES |
| 프랑스어 | `frFR` | fr-FR |
| 독일어 | `deDE` | de-DE |
| 포르투갈어 (브라질) | `ptBR` | pt-BR |
| 포르투갈어 (포르투갈) | `ptPT` | pt-PT |
| 이탈리아어 | `itIT` | it-IT |
| 러시아어 | `ruRU` | ru-RU |
| 네덜란드어 | `nlNL` | nl-NL |
| 폴란드어 | `plPL` | pl-PL |
| 터키어 | `trTR` | tr-TR |
| 베트남어 | `viVN` | vi-VN |
| 태국어 | `thTH` | th-TH |
| 인도네시아어 | `idID` | id-ID |
| 힌디어 | `hiIN` | hi-IN |
| 아랍어 | `arSA` | ar-SA |
| 히브리어 | `heIL` | he-IL |
| 페르시아어 | `faIR` | fa-IR |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 현재 프로젝트 설정

프로젝트는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

- ✅ `@clerk/localizations` 패키지 설치됨
- ✅ `app/layout.tsx`에서 `koKR` 사용
- ✅ `ClerkProvider`에 `localization={koKR}` 전달
- ✅ `html lang="ko"` 설정
- ✅ Tailwind CSS 4 호환성을 위한 `cssLayerName: "clerk"` 설정

## 테스트

1. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

2. 로그인/회원가입 모달 확인:
   - 네비게이션 바의 "로그인" 버튼 클릭
   - 모든 텍스트가 한국어로 표시되는지 확인

3. UserButton 확인:
   - 로그인 후 사용자 프로필 버튼 클릭
   - 드롭다운 메뉴의 모든 텍스트가 한국어로 표시되는지 확인

## 주의사항

1. **Clerk Account Portal**: 로컬라이제이션은 Clerk 컴포넌트에만 적용됩니다. 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 영어로 유지됩니다.

2. **실험적 기능**: 이 기능은 현재 실험적이므로 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

3. **Tailwind CSS 4**: Tailwind CSS 4를 사용하는 경우 `appearance.cssLayerName: "clerk"` 설정이 필수입니다.

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)

