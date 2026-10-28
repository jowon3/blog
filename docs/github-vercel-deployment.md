# GitHub 업로드와 Vercel 배포

## 저장소에 포함하지 않는 자료

`.env*`(빈 값의 `.env.example` 제외), `.local/`, `node_modules/`, `.next/`, 로컬 DB·키 파일, `data/`, `backups/`, `exports/`는 Git에서 제외합니다. 실제 고객·원고·썸네일·폴더 설정은 브라우저의 localStorage/IndexedDB에 보관되며 소스 저장소에 들어가지 않습니다. 소스의 기본 고객명·해시태그 예제는 프로그램 초기 설정입니다.

새 고객 내보내기 파일은 프로젝트 밖이나 `exports/`에 보관하세요. 일반 파일 이름으로 만든 고객 JSON/CSV는 자동 식별할 수 없으므로 업로드 전에 `git status`로 확인하세요. API 키 값은 README·소스·커밋 메시지에 입력하지 않습니다.

## Vercel에서 다음 단계

1. Vercel에 GitHub 계정으로 로그인한 뒤 **Add New → Project**에서 `jowon3/blog`를 Import합니다. 저장소가 안 보이면 Vercel GitHub App에 해당 저장소 접근을 허용합니다.
2. Framework는 **Next.js**, Root Directory는 저장소 루트(`./`), Build Command는 `npm run build`, Output Directory는 Next.js 기본값으로 둡니다. Production Branch는 업로드된 `master`로 확인합니다.
3. **Environment Variables**에 `OPENAI_API_KEY`를 비밀 값으로 추가합니다. 필요하면 `OPENAI_MODEL=gpt-4.1-mini`를 설정합니다. `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 키를 넣지 않아도 수동 작성 기능은 사용할 수 있습니다.
4. 개인용 앱이므로 API 키를 사용하는 배포는 접근 보호를 먼저 설정합니다. 현재 앱 자체에는 사용자 인증·사용량 제한이 없습니다. 사용하는 Vercel 플랜에서 Production까지 보호할 수 있는 Deployment Protection을 적용하거나 앱 인증·호출 제한을 추가한 뒤 공개 운영합니다. Preview 보호만으로 Production도 보호된다고 가정하지 않습니다.
5. 설정을 확인하고 Deploy합니다. 이후 환경 변수를 바꾸면 새 배포에 반영되도록 Redeploy합니다.
6. 배포 주소에서 수동 작성·저장·복사·사진 선택을 확인하고, 키를 설정했다면 AI 생성도 소량 확인합니다.

## 데이터와 로컬 기능의 범위

- localhost와 Vercel 주소는 서로 다른 origin입니다. 로컬 고객·원고·사진 폴더 권한이 Vercel 주소로 자동 이전되지 않습니다. 기존 localhost 앱과 브라우저 데이터를 삭제하지 마세요. 현재 TXT 백업은 원고 텍스트이며 고객 설정·전체 이력을 복원하는 DB 백업이 아닙니다.
- 폴더 연결은 배포 주소에서도 사용자가 다시 선택·허용해야 하며, 브라우저 지원에 따라 호환 모드가 필요할 수 있습니다.
- 로컬 보조 서버는 Vercel에서 실행하지 않습니다. 네이버·미리캔버스 연결은 현재 구현된 수동 전달 방식으로 사용합니다.
- GitHub 코드 업로드는 Vercel 배포를 직접 실행한 것이 아닙니다. 이미 Vercel과 Git 저장소가 연결되어 있다면 해당 서비스 설정에 따라 push가 자동 배포를 일으킬 수 있습니다.

공식 문서:
- https://vercel.com/docs/git
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/deployment-protection
