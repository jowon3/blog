# 미리캔버스 썸네일 연결: 현재 구현 및 공식 인증 검토

확인일: 2026-10-28

## 현재 화면과 동작

- 원고 결과의 '미리캔버스로 썸네일 만들기' 버튼 하나만 제공한다. 별도 썸네일 편집 탭과 고객 관리의 디자인 제작 화면은 표시하지 않는다.
- 클릭하면 고객명, 현재 원고 제목, 저장된 썸네일 문구(있을 때), 짧은 문구 3개 및 템플릿 추천 요청을 복사하고 공식 사이트를 새 탭으로 연다.
- 대표 사진은 기존 사진 선택 목록의 첫 번째 사진으로 안내한다. 기존 사진 순서 변경 기능으로 대표 사진을 바꿀 수 있다. 파일 자체는 외부로 자동 업로드하지 않는다.
- 미리캔버스에서 로그인하고 템플릿 선택·사진 업로드·문구 편집을 사용자가 진행한다. 복사 요청에 AI 추천을 요청하는 문장을 포함하며, BLOG STUDIO가 AI 추천을 이미 생성했다고 표시하지 않는다.
- 자동 복사가 차단되면 브라우저 복사 창을 제공한다. 원고 제목이 없으면 버튼은 비활성화된다.
- 기존 썸네일·템플릿 IndexedDB, 원고의 thumbnail 필드, 이력과 기존 고객 데이터는 삭제하거나 마이그레이션하지 않는다. 이전 편집기 소스도 보존하지만 화면에서 호출하지 않는다.

## 공식 서버에서 직접 확인한 인증 정보

공개 정보만 조회했으며 로그인·클라이언트 등록·인증 승인은 진행하지 않았다.

1. `GET https://mcp.miricanvas.com/mcp`: 401. `WWW-Authenticate`가 아래 리소스 메타데이터를 안내한다.
2. `GET https://mcp.miricanvas.com/.well-known/oauth-protected-resource/mcp`: 200. resource는 공식 MCP 주소, authorization server는 `https://mcp.miricanvas.com`, scope는 `mcp:read`, `mcp:write`, bearer 전달은 header, `tls_client_certificate_bound_access_tokens: true`.
3. `GET https://mcp.miricanvas.com/.well-known/oauth-authorization-server`: 200. authorization code 및 refresh token, PKCE S256, `none`/`private_key_jwt`, DPoP 서명 알고리즘, `client_id_metadata_document_supported: true`를 알린다. authorization endpoint는 `/oauth2/authorize`, token endpoint는 `/oauth2/token`이다. 동적 등록 endpoint는 이 메타데이터에 없다.

## Next.js에서의 가능성과 현재 제한

공식 OAuth 흐름이 존재하므로 Next.js 기술 자체가 연결을 막는 것은 아니다. 다만 서버 메타데이터의 발견은 BLOG STUDIO의 클라이언트 승인이나 실제 디자인 생성 성공을 뜻하지 않는다.

현재 localhost 앱에는 공개 HTTPS 클라이언트 메타데이터 URL, 승인된 클라이언트 설정, 콜백 구성 및 연결 계정이 없다. 공식 소개는 ChatGPT·Claude의 연결을 안내한다. 외부 웹앱의 허용 클라이언트 정책, 인증서/DPoP 적용 조건, 이미지 업로드 도구와 디자인 생성·내보내기 도구 명세도 인증 후 확인이 필요하다. 따라서 현재 환경에서 직접 디자인 생성까지 지원된다고 확정하지 않고 사용자가 요청한 수동 대체 방식으로 구현했다. 임의 client_id, 인증 endpoint, scope, 디자인 생성 API는 만들지 않았다.

향후 연동 시에는 공식 제공자에게 외부 앱 허용 조건을 확인한 다음, 공개 HTTPS 클라이언트 메타데이터와 승인된 redirect URI를 구성하고 서버 세션에 state/PKCE 검증값을 보관한다. 토큰은 서버에 보관하고 요구되는 토큰 바인딩을 적용한다. 인증된 MCP 도구 목록과 스키마를 확인한 뒤 고객명·제목·문구·대표 사진을 명시적인 생성 요청에 연결하고 반환된 미리캔버스 편집 URL을 연다. 현재 앱에서는 이 미검증 흐름을 실행하지 않는다.

## 공식 근거

- [공식 MCP 주소와 ChatGPT·Claude 연결 안내](https://www.miricanvas.com/ko/features/ai-presentation-mcp)
- [AI 커넥터 소개: 디자인 생성·템플릿 선택·편집](https://help.miricanvas.com/hc/ko/articles/63391689320601)
- [공식 리소스 메타데이터](https://mcp.miricanvas.com/.well-known/oauth-protected-resource/mcp)
- [공식 OAuth 서버 메타데이터](https://mcp.miricanvas.com/.well-known/oauth-authorization-server)
- [기업용 연동 안내](https://www.miricanvas.com/business/pricing): SSO API 연동 안내이며 임의 앱의 디자인 생성 API 사용권을 보장하지 않는다.
