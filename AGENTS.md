<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 작업 관리 규칙

모든 작업은 **shrimp-task-manager MCP**를 활용해 계획하고 추적한다.

- 작업 시작 전: `mcp__shrimp-task-manager__plan_task` → `mcp__shrimp-task-manager__split_tasks`로 태스크 분해
- 각 태스크 실행 시: `mcp__shrimp-task-manager__execute_task`로 지침 수령 후 구현
- 구현 완료 후: `mcp__shrimp-task-manager__verify_task`로 검증 → 완료 처리

# UI 개발 규칙

UI 컴포넌트나 페이지를 개발할 때는 반드시 **Stitch MCP**를 먼저 활용한다.

- Stitch 프로젝트 ID: `706293808131804710`
- 디자인 시스템: `assets/12305768813800255499`
- 구현 전 `mcp__stitch__get_screen`으로 해당 화면 디자인을 확인하고 참고한다
