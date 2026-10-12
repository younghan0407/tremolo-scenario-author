import { test, expect } from '@playwright/test';
import { resolveRuntimeValue, exportRuntimeValue } from '../../_helpers/dynamicValue';

async function waitForHiddenAssertionReady(page: any, timeout: number) {
  const startedAt = Date.now();
  const remaining = () => Math.max(1, timeout - (Date.now() - startedAt));
  await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: remaining() });
  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: remaining() });
  await page.waitForFunction((quietMs: number) => new Promise<boolean>((resolve) => {
    const root = document.body || document.documentElement;
    let timer: number | undefined;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (timer != null) window.clearTimeout(timer);
      observer.disconnect();
      resolve(true);
    };
    const observer = new MutationObserver(() => {
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(finish, quietMs);
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true });
    timer = window.setTimeout(finish, quietMs);
  }), 500, { timeout: remaining() });
}

test('[워크플로우]-[게이트웨이 API]-[게이트웨이 클래스 수정]', async ({ page }, testInfo) => {
  const runTmloStepWithRetry = async (action: () => Promise<void>, retryCount: number, stepLabel: string) => {
    const retries = Math.max(0, Math.floor(Number(retryCount) || 0));
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await action();
        return;
      } catch (e) {
        lastError = e;
        if (attempt >= retries) break;
        const message = e && (e as Error).message ? (e as Error).message : String(e);
        console.warn('[retry] ' + stepLabel + ' failed; retry ' + (attempt + 1) + '/' + retries + ': ' + message);
        await page.waitForTimeout(500);
      }
    }
    throw lastError;
  };

  // https://example.invalid/env-2/login 이동
  await test.step('[TMLO:1] https://example.invalid/env-2/login 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/login', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요. 입력
  await test.step('[TMLO:2] 아이디를 입력해 주세요. 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.\s*$/ }).fill('YOUR_ACCOUNT_ID', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s2-failed.png') }).catch((e2) => console.warn('[screenshot] step #s2: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요. 키 누르기
  await test.step('[TMLO:3] 아이디를 입력해 주세요. 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.\s*$/ }).press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 비밀번호를 입력해 주세요. 입력
  await test.step('[TMLO:4] 비밀번호를 입력해 주세요. 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.\s*$/ }).fill('YOUR_PASSWORD', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 비밀번호를 입력해 주세요. 키 누르기
  await test.step('[TMLO:5] 비밀번호를 입력해 주세요. 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s5-failed.png') }).catch((e2) => console.warn('[screenshot] step #s5: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 제품 선택 메뉴 열기
  await test.step('[TMLO:6] 제품 선택 메뉴 열기', async () => {
    try {
      await page.locator('xpath=(//h1[contains(concat(" ", normalize-space(@class), " "), " logo-wrap ")])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s7-failed.png') }).catch((e2) => console.warn('[screenshot] step #s7: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 제품 VIOLA 선택
  await test.step('[TMLO:7] 제품 VIOLA 선택', async () => {
    try {
      await page.locator('xpath=(//span[contains(concat(" ", normalize-space(@class), " "), " solution-menu-item-label ")][normalize-space(.)="VIOLA"])[1]').click({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // VIOLA LNB 표출 대기
  await test.step('[TMLO:8] VIOLA LNB 표출 대기', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:8] VIOLA LNB 표출 대기");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s9-failed.png') }).catch((e2) => console.warn('[screenshot] step #s9: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // /viola/workflow/network/gateway-api 이동
  await test.step('[TMLO:9] /viola/workflow/network/gateway-api 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/viola/workflow/network/gateway-api', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // /viola/workflow/network/gateway-api/gateway-class/create 이동
  await test.step('[TMLO:10] /viola/workflow/network/gateway-api/gateway-class/create 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/viola/workflow/network/gateway-api/gateway-class/create', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름 입력
  await test.step('[TMLO:11] 이름 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('qa-trml-{HHMMSS}-gwc'); await page.getByTestId('adm-input-json-name-placeholder').fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('gwc_edit', __tmloValue, { scope: 'runSet', source: { stepId: 's12', title: '이름 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 중복 확인 클릭
  await test.step('[TMLO:12] 중복 확인 클릭', async () => {
    try {
      await page.getByTestId('adm-input-json-name-duplicate-name').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 사용 가능한 이름입니다. 표시
  await test.step('[TMLO:13] 사용 가능한 이름입니다. 표시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*사용\s+가능한\s+이름입니다\.\s*$/)).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:13] 사용 가능한 이름입니다. 표시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러 입력
  await test.step('[TMLO:14] 컨트롤러 입력', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/qa-trml-controller', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 클릭
  await test.step('[TMLO:15] 생성 클릭', async () => {
    try {
      await page.getByTestId('adm-convert-container-action').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 확인 팝업 [확인]
  await test.step('[TMLO:16] 생성 확인 팝업 [확인]', async () => {
    try {
      await page.getByTestId('adm-confirm-modal-confirm').click({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 탭 클릭
  await test.step('[TMLO:17] 게이트웨이 클래스 탭 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*게이트웨이\s+클래스\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색어 입력
  await test.step('[TMLO:18] 검색어 입력', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').fill(resolveRuntimeValue('{{gwc_edit}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 실행
  await test.step('[TMLO:19] 검색 실행', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 자원 행 표출
  await test.step('[TMLO:20] 생성 자원 행 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_edit}}")])[1]'))).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:20] 생성 자원 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행 [작업] 더보기
  await test.step('[TMLO:21] 행 [작업] 더보기', async () => {
    try {
      await page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(normalize-space(.),"{{gwc_edit}}")]//button[normalize-space(.)="more_horiz"])[1]')).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // [수정] 클릭
  await test.step('[TMLO:22] [수정] 클릭', async () => {
    try {
      await page.getByRole('menuitem', { name: /^\s*수정\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 화면 헤더
  await test.step('[TMLO:23] 화면 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:23] 화면 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 본문 영역
  await test.step('[TMLO:24] 본문 영역', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-convert-editor-yaml-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:24] 본문 영역");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 하단 액션
  await test.step('[TMLO:25] 하단 액션', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//button[@data-testid="adm-convert-container-action"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:25] 하단 액션");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우측 `고급 모드 가이드`
  await test.step('[TMLO:26] 우측 `고급 모드 가이드`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-title')).toContainText('고급 모드 가이드', { timeout: 30000 }); }, 3, "[TMLO:26] 우측 `고급 모드 가이드`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:27] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 수정', { timeout: 30000 }); }, 3, "[TMLO:27] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:28] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 수정', { timeout: 30000 }); }, 3, "[TMLO:28] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `대시보드` 표출
  await test.step('[TMLO:29] LNB 대분류 `대시보드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"대시보드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:29] LNB 대분류 `대시보드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `기본 설정` 표출
  await test.step('[TMLO:30] LNB 대분류 `기본 설정` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:30] LNB 대분류 `기본 설정` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `워크플로우` 표출
  await test.step('[TMLO:31] LNB 대분류 `워크플로우` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:31] LNB 대분류 `워크플로우` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `서비스 카탈로그` 표출
  await test.step('[TMLO:32] LNB 대분류 `서비스 카탈로그` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:32] LNB 대분류 `서비스 카탈로그` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `모니터링` 표출
  await test.step('[TMLO:33] LNB 대분류 `모니터링` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"모니터링")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:33] LNB 대분류 `모니터링` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크플로우` 확장 상태
  await test.step('[TMLO:34] `워크플로우` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:34] `워크플로우` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 설정` 미확장
  await test.step('[TMLO:35] `기본 설정` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:35] `기본 설정` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `서비스 카탈로그` 미확장
  await test.step('[TMLO:36] `서비스 카탈로그` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:36] `서비스 카탈로그` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링` 미확장
  await test.step('[TMLO:37] `모니터링` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"모니터링")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:37] `모니터링` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `워크로드` 표출
  await test.step('[TMLO:38] LNB 하위 `워크로드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:38] LNB 하위 `워크로드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `네트워크` 표출
  await test.step('[TMLO:39] LNB 하위 `네트워크` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:39] LNB 하위 `네트워크` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `스토리지` 표출
  await test.step('[TMLO:40] LNB 하위 `스토리지` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:40] LNB 하위 `스토리지` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `네트워크` 확장 상태
  await test.step('[TMLO:41] `네트워크` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:41] `네트워크` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크로드` 미확장
  await test.step('[TMLO:42] `워크로드` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:42] `워크로드` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스토리지` 미확장
  await test.step('[TMLO:43] `스토리지` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:43] `스토리지` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스` 표출
  await test.step('[TMLO:44] LNB 메뉴 `서비스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:44] LNB 메뉴 `서비스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `인그레스` 표출
  await test.step('[TMLO:45] LNB 메뉴 `인그레스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="인그레스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:45] LNB 메뉴 `인그레스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `게이트웨이 API` 표출
  await test.step('[TMLO:46] LNB 메뉴 `게이트웨이 API` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:46] LNB 메뉴 `게이트웨이 API` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `네트워크 폴리시` 표출
  await test.step('[TMLO:47] LNB 메뉴 `네트워크 폴리시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="네트워크 폴리시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:47] LNB 메뉴 `네트워크 폴리시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스 메시` 표출
  await test.step('[TMLO:48] LNB 메뉴 `서비스 메시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스 메시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:48] LNB 메뉴 `서비스 메시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 API` 선택 상태
  await test.step('[TMLO:49] `게이트웨이 API` 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-item-selected ")][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:49] `게이트웨이 API` 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `알림` 표출
  await test.step('[TMLO:50] LNB 하단 `알림` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*알림\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:50] LNB 하단 `알림` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `프로필` 표출
  await test.step('[TMLO:51] LNB 하단 `프로필` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*프로필\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:51] LNB 하단 `프로필` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 접기 아이콘(first_page) 표출
  await test.step('[TMLO:52] LNB 접기 아이콘(first_page) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*first_page\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:52] LNB 접기 아이콘(first_page) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우상단 클러스터 선택기 표출
  await test.step('[TMLO:53] 우상단 클러스터 선택기 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:53] 우상단 클러스터 선택기 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 선택기 교체 아이콘(sync_alt)
  await test.step('[TMLO:54] 클러스터 선택기 교체 아이콘(sync_alt)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toContainText('sync_alt', { timeout: 30000 }); }, 3, "[TMLO:54] 클러스터 선택기 교체 아이콘(sync_alt)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 모니터링 현황 차트 아이콘(browse_activity)
  await test.step('[TMLO:55] 모니터링 현황 차트 아이콘(browse_activity)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-header-toggle-panel"]//*[normalize-space(text())="browse_activity"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:55] 모니터링 현황 차트 아이콘(browse_activity)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s56-failed.png') }).catch((e2) => console.warn('[screenshot] step #s56: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링 현황` 버튼 라벨
  await test.step('[TMLO:56] `모니터링 현황` 버튼 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-header-toggle-panel')).toContainText('모니터링 현황', { timeout: 30000 }); }, 3, "[TMLO:56] `모니터링 현황` 버튼 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s57-failed.png') }).catch((e2) => console.warn('[screenshot] step #s57: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 뒤로가기 아이콘
  await test.step('[TMLO:57] 뒤로가기 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//*[normalize-space(text())="arrow_back"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:57] 뒤로가기 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s58-failed.png') }).catch((e2) => console.warn('[screenshot] step #s58: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 타이틀 `게이트웨이 클래스 수정`
  await test.step('[TMLO:58] 타이틀 `게이트웨이 클래스 수정`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toContainText('게이트웨이 클래스 수정', { timeout: 30000 }); }, 3, "[TMLO:58] 타이틀 `게이트웨이 클래스 수정`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s59-failed.png') }).catch((e2) => console.warn('[screenshot] step #s59: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `취소` 버튼
  await test.step('[TMLO:59] `취소` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-convert-container-go-back-page')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:59] `취소` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s60-failed.png') }).catch((e2) => console.warn('[screenshot] step #s60: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `수정` 버튼
  await test.step('[TMLO:60] `수정` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-convert-container-action')).toContainText('수정', { timeout: 30000 }); }, 3, "[TMLO:60] `수정` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s61-failed.png') }).catch((e2) => console.warn('[screenshot] step #s61: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 본문
  await test.step('[TMLO:61] 가이드 본문', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-collapse')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:61] 가이드 본문");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s62-failed.png') }).catch((e2) => console.warn('[screenshot] step #s62: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 접기 버튼 미표출
  await test.step('[TMLO:62] 가이드 접기 버튼 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-resource-guide-title"]//button)[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:62] 가이드 접기 버튼 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s63-failed.png') }).catch((e2) => console.warn('[screenshot] step #s63: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // /viola/workflow/network/gateway-api 이동
  await test.step('[TMLO:63] /viola/workflow/network/gateway-api 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/viola/workflow/network/gateway-api', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s64-failed.png') }).catch((e2) => console.warn('[screenshot] step #s64: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 탭 클릭
  await test.step('[TMLO:64] 게이트웨이 클래스 탭 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*게이트웨이\s+클래스\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s65-failed.png') }).catch((e2) => console.warn('[screenshot] step #s65: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색어 입력
  await test.step('[TMLO:65] 검색어 입력', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').fill(resolveRuntimeValue('{{gwc_edit}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s66-failed.png') }).catch((e2) => console.warn('[screenshot] step #s66: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 실행
  await test.step('[TMLO:66] 검색 실행', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s67-failed.png') }).catch((e2) => console.warn('[screenshot] step #s67: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 자원 행 표출
  await test.step('[TMLO:67] 생성 자원 행 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_edit}}")])[1]'))).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:67] 생성 자원 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s68-failed.png') }).catch((e2) => console.warn('[screenshot] step #s68: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 클릭 → 상세
  await test.step('[TMLO:68] `이름` 클릭 → 상세', async () => {
    try {
      await page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_edit}}")]//*[@data-testid="adm-name-cell"])[1]')).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s69-failed.png') }).catch((e2) => console.warn('[screenshot] step #s69: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상세 [수정] 클릭
  await test.step('[TMLO:69] 상세 [수정] 클릭', async () => {
    try {
      await page.getByTestId('adm-detail-button-groups-button').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s70-failed.png') }).catch((e2) => console.warn('[screenshot] step #s70: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 페이지 이동
  await test.step('[TMLO:70] 수정 페이지 이동', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('게이트웨이 클래스 수정', { timeout: 30000 }); }, 3, "[TMLO:70] 수정 페이지 이동");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s71-failed.png') }).catch((e2) => console.warn('[screenshot] step #s71: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // /viola/workflow/network/gateway-api 이동
  await test.step('[TMLO:71] /viola/workflow/network/gateway-api 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/viola/workflow/network/gateway-api', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s72-failed.png') }).catch((e2) => console.warn('[screenshot] step #s72: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 탭 클릭
  await test.step('[TMLO:72] 게이트웨이 클래스 탭 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*게이트웨이\s+클래스\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s73-failed.png') }).catch((e2) => console.warn('[screenshot] step #s73: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색어 입력
  await test.step('[TMLO:73] 검색어 입력', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').fill(resolveRuntimeValue('{{gwc_edit}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s74-failed.png') }).catch((e2) => console.warn('[screenshot] step #s74: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 실행
  await test.step('[TMLO:74] 검색 실행', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s75-failed.png') }).catch((e2) => console.warn('[screenshot] step #s75: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 자원 행 표출
  await test.step('[TMLO:75] 생성 자원 행 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_edit}}")])[1]'))).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:75] 생성 자원 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s76-failed.png') }).catch((e2) => console.warn('[screenshot] step #s76: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 클릭 → 상세
  await test.step('[TMLO:76] `이름` 클릭 → 상세', async () => {
    try {
      await page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_edit}}")]//*[@data-testid="adm-name-cell"])[1]')).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s77-failed.png') }).catch((e2) => console.warn('[screenshot] step #s77: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상세 [삭제] 클릭(팝업 열기)
  await test.step('[TMLO:77] 상세 [삭제] 클릭(팝업 열기)', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-page-title"]//button[normalize-space(.)="delete 삭제"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s78-failed.png') }).catch((e2) => console.warn('[screenshot] step #s78: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 삭제 팝업 호출
  await test.step('[TMLO:78] 삭제 팝업 호출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-check-modal-content')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:78] 삭제 팝업 호출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s79-failed.png') }).catch((e2) => console.warn('[screenshot] step #s79: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인했습니다. 체크
  await test.step('[TMLO:79] 확인했습니다. 체크', async () => {
    try {
      await page.getByRole('checkbox', { name: /^\s*확인했습니다\.\s*$/ }).check({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s80-failed.png') }).catch((e2) => console.warn('[screenshot] step #s80: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 팝업 [삭제] 클릭(teardown)
  await test.step('[TMLO:80] 팝업 [삭제] 클릭(teardown)', async () => {
    try {
      await page.getByTestId('adm-check-modal-confirm').click({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s81-failed.png') }).catch((e2) => console.warn('[screenshot] step #s81: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
