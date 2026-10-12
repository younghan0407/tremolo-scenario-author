import { test, expect } from '@playwright/test';

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

test('[워크플로우]-[게이트웨이 API]-[게이트웨이 클래스 목록 표시]', async ({ page }, testInfo) => {
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

  // 워크플로우 메뉴 클릭
  await test.step('[TMLO:9] 워크플로우 메뉴 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*워크플로우\.?\s*$/).first(); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 네트워크 메뉴 클릭
  await test.step('[TMLO:10] 네트워크 메뉴 클릭', async () => {
    try {
      await page.locator('xpath=(//div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 API 진입
  await test.step('[TMLO:11] 게이트웨이 API 진입', async () => {
    try {
      await page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]').click({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 탭 클릭
  await test.step('[TMLO:12] 게이트웨이 클래스 탭 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*게이트웨이\s+클래스\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 목록 table 표출 대기
  await test.step('[TMLO:13] 목록 table 표출 대기', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-table')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:13] 목록 table 표출 대기");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지 헤더(타이틀 영역) 표출
  await test.step('[TMLO:14] 페이지 헤더(타이틀 영역) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:14] 페이지 헤더(타이틀 영역) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 바 표출
  await test.step('[TMLO:15] 탭 바 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-layout-tabs')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:15] 탭 바 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 필터 영역 표출
  await test.step('[TMLO:16] 검색 필터 영역 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:16] 검색 필터 영역 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 기간 필터 표출
  await test.step('[TMLO:17] 기간 필터 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[@data-testid="adm-date-range-period"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:17] 기간 필터 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 목록 table 표출
  await test.step('[TMLO:18] 목록 table 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-table')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:18] 목록 table 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 표출
  await test.step('[TMLO:19] 페이지네이션 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:19] 페이지네이션 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:20] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API', { timeout: 30000 }); }, 3, "[TMLO:20] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:21] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API', { timeout: 30000 }); }, 3, "[TMLO:21] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `대시보드` 표출
  await test.step('[TMLO:22] LNB 대분류 `대시보드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"대시보드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:22] LNB 대분류 `대시보드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `기본 설정` 표출
  await test.step('[TMLO:23] LNB 대분류 `기본 설정` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:23] LNB 대분류 `기본 설정` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `워크플로우` 표출
  await test.step('[TMLO:24] LNB 대분류 `워크플로우` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:24] LNB 대분류 `워크플로우` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `서비스 카탈로그` 표출
  await test.step('[TMLO:25] LNB 대분류 `서비스 카탈로그` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:25] LNB 대분류 `서비스 카탈로그` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `모니터링` 표출
  await test.step('[TMLO:26] LNB 대분류 `모니터링` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"모니터링")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:26] LNB 대분류 `모니터링` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크플로우` 확장 상태
  await test.step('[TMLO:27] `워크플로우` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:27] `워크플로우` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 설정` 미확장
  await test.step('[TMLO:28] `기본 설정` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:28] `기본 설정` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `서비스 카탈로그` 미확장
  await test.step('[TMLO:29] `서비스 카탈로그` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:29] `서비스 카탈로그` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링` 미확장
  await test.step('[TMLO:30] `모니터링` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"모니터링")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:30] `모니터링` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스` 표출
  await test.step('[TMLO:31] LNB 메뉴 `서비스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:31] LNB 메뉴 `서비스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `인그레스` 표출
  await test.step('[TMLO:32] LNB 메뉴 `인그레스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="인그레스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:32] LNB 메뉴 `인그레스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `게이트웨이 API` 표출
  await test.step('[TMLO:33] LNB 메뉴 `게이트웨이 API` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:33] LNB 메뉴 `게이트웨이 API` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `네트워크 폴리시` 표출
  await test.step('[TMLO:34] LNB 메뉴 `네트워크 폴리시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="네트워크 폴리시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:34] LNB 메뉴 `네트워크 폴리시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스 메시` 표출
  await test.step('[TMLO:35] LNB 메뉴 `서비스 메시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스 메시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:35] LNB 메뉴 `서비스 메시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 API` 선택 상태
  await test.step('[TMLO:36] `게이트웨이 API` 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-item-selected ")][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:36] `게이트웨이 API` 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `알림` 표출
  await test.step('[TMLO:37] LNB 하단 `알림` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*알림\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:37] LNB 하단 `알림` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `프로필` 표출
  await test.step('[TMLO:38] LNB 하단 `프로필` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*프로필\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:38] LNB 하단 `프로필` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 접기 아이콘(first_page) 표출
  await test.step('[TMLO:39] LNB 접기 아이콘(first_page) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*first_page\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:39] LNB 접기 아이콘(first_page) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우상단 클러스터 선택기 표출
  await test.step('[TMLO:40] 우상단 클러스터 선택기 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:40] 우상단 클러스터 선택기 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 선택기 교체 아이콘(sync_alt)
  await test.step('[TMLO:41] 클러스터 선택기 교체 아이콘(sync_alt)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toContainText('sync_alt', { timeout: 30000 }); }, 3, "[TMLO:41] 클러스터 선택기 교체 아이콘(sync_alt)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 모니터링 현황 차트 아이콘(browse_activity)
  await test.step('[TMLO:42] 모니터링 현황 차트 아이콘(browse_activity)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-header-toggle-panel"]//*[normalize-space(text())="browse_activity"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:42] 모니터링 현황 차트 아이콘(browse_activity)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링 현황` 버튼 라벨
  await test.step('[TMLO:43] `모니터링 현황` 버튼 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-header-toggle-panel')).toContainText('모니터링 현황', { timeout: 30000 }); }, 3, "[TMLO:43] `모니터링 현황` 버튼 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지 타이틀 `게이트웨이 API`
  await test.step('[TMLO:44] 페이지 타이틀 `게이트웨이 API`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toContainText('게이트웨이 API', { timeout: 30000 }); }, 3, "[TMLO:44] 페이지 타이틀 `게이트웨이 API`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // Subtitle 표출
  await test.step('[TMLO:45] Subtitle 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toContainText('리소스를 생성하고 관리합니다.', { timeout: 30000 }); }, 3, "[TMLO:45] Subtitle 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `HTTP라우트` 표출
  await test.step('[TMLO:46] 탭 `HTTP라우트` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="HTTP라우트"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:46] 탭 `HTTP라우트` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `게이트웨이` 표출
  await test.step('[TMLO:47] 탭 `게이트웨이` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="게이트웨이"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:47] 탭 `게이트웨이` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `게이트웨이 클래스` 표출
  await test.step('[TMLO:48] 탭 `게이트웨이 클래스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="게이트웨이 클래스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:48] 탭 `게이트웨이 클래스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 클래스` 탭 선택 상태
  await test.step('[TMLO:49] `게이트웨이 클래스` 탭 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="게이트웨이 클래스"][@aria-selected="true"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:49] `게이트웨이 클래스` 탭 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 입력 placeholder
  await test.step('[TMLO:50] 검색 입력 placeholder', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.ant-tabs-tabpane-active input[placeholder="항목 이름 또는 값을 입력해 주세요."]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:50] 검색 입력 placeholder");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 필터 아이콘(filter_list)
  await test.step('[TMLO:51] 검색 필터 아이콘(filter_list)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[normalize-space(text())="filter_list"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:51] 검색 필터 아이콘(filter_list)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기간 설정` 선택기
  await test.step('[TMLO:52] `기간 설정` 선택기', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[@data-testid="adm-date-range-period"])[1]')).toContainText('기간 설정', { timeout: 30000 }); }, 3, "[TMLO:52] `기간 설정` 선택기");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 시작일 입력
  await test.step('[TMLO:53] 시작일 입력', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.ant-tabs-tabpane-active input[placeholder="시작일"]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:53] 시작일 입력");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 종료일 입력
  await test.step('[TMLO:54] 종료일 입력', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.ant-tabs-tabpane-active input[placeholder="종료일"]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:54] 종료일 입력");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `+ 생성` add 아이콘
  await test.step('[TMLO:55] `+ 생성` add 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[@data-testid="adm-list-button-groups-create"]//*[normalize-space(text())="add"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:55] `+ 생성` add 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s56-failed.png') }).catch((e2) => console.warn('[screenshot] step #s56: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `+ 생성` 라벨
  await test.step('[TMLO:56] `+ 생성` 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[@data-testid="adm-list-button-groups-create"])[1]')).toContainText('생성', { timeout: 30000 }); }, 3, "[TMLO:56] `+ 생성` 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s57-failed.png') }).catch((e2) => console.warn('[screenshot] step #s57: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 조회형 구성(필터·table·페이지네이션)
  await test.step('[TMLO:57] 조회형 구성(필터·table·페이지네이션)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:57] 조회형 구성(필터·table·페이지네이션)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s58-failed.png') }).catch((e2) => console.warn('[screenshot] step #s58: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 헤더 정렬 아이콘 미표출
  await test.step('[TMLO:58] `상태` 헤더 정렬 아이콘 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"상태")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:58] `상태` 헤더 정렬 아이콘 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s59-failed.png') }).catch((e2) => console.warn('[screenshot] step #s59: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` 헤더 정렬 아이콘 미표출
  await test.step('[TMLO:59] `레이블` 헤더 정렬 아이콘 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[normalize-space(.)="레이블"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:59] `레이블` 헤더 정렬 아이콘 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s60-failed.png') }).catch((e2) => console.warn('[screenshot] step #s60: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 헤더 정렬 아이콘
  await test.step('[TMLO:60] `이름` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"이름")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:60] `이름` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s61-failed.png') }).catch((e2) => console.warn('[screenshot] step #s61: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `클러스터` 헤더 정렬 아이콘
  await test.step('[TMLO:61] `클러스터` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"클러스터")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:61] `클러스터` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s62-failed.png') }).catch((e2) => console.warn('[screenshot] step #s62: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `컨트롤러` 헤더 정렬 아이콘
  await test.step('[TMLO:62] `컨트롤러` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"컨트롤러")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:62] `컨트롤러` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s63-failed.png') }).catch((e2) => console.warn('[screenshot] step #s63: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `연결 게이트웨이 수` 헤더 정렬 아이콘
  await test.step('[TMLO:63] `연결 게이트웨이 수` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"연결 게이트웨이 수")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:63] `연결 게이트웨이 수` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s64-failed.png') }).catch((e2) => console.warn('[screenshot] step #s64: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `생성일시` 헤더 정렬 아이콘
  await test.step('[TMLO:64] `생성일시` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"생성일시")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:64] `생성일시` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s65-failed.png') }).catch((e2) => console.warn('[screenshot] step #s65: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 컬럼 헤더(1번째 데이터 컬럼)
  await test.step('[TMLO:65] `이름` 컬럼 헤더(1번째 데이터 컬럼)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[2][contains(normalize-space(.),"이름")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:65] `이름` 컬럼 헤더(1번째 데이터 컬럼)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s66-failed.png') }).catch((e2) => console.warn('[screenshot] step #s66: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 값 링크(name-cell) 표출
  await test.step('[TMLO:66] `이름` 값 링크(name-cell) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//*[@data-testid="adm-name-cell"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:66] `이름` 값 링크(name-cell) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s67-failed.png') }).catch((e2) => console.warn('[screenshot] step #s67: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 헤더(2번째) + help 아이콘
  await test.step('[TMLO:67] `상태` 헤더(2번째) + help 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[3][contains(normalize-space(.),"상태")]//*[normalize-space(text())="help"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:67] `상태` 헤더(2번째) + help 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s68-failed.png') }).catch((e2) => console.warn('[screenshot] step #s68: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 값 pill tag(adm-status-tag)
  await test.step('[TMLO:68] `상태` 값 pill tag(adm-status-tag)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//*[@data-testid="adm-status-tag"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:68] `상태` 값 pill tag(adm-status-tag)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s69-failed.png') }).catch((e2) => console.warn('[screenshot] step #s69: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 3번째 데이터 컬럼 `클러스터` 헤더
  await test.step('[TMLO:69] 3번째 데이터 컬럼 `클러스터` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[4][contains(normalize-space(.),"클러스터")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:69] 3번째 데이터 컬럼 `클러스터` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s70-failed.png') }).catch((e2) => console.warn('[screenshot] step #s70: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `클러스터` 값 셀 표출
  await test.step('[TMLO:70] `클러스터` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[4])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:70] `클러스터` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s71-failed.png') }).catch((e2) => console.warn('[screenshot] step #s71: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 4번째 데이터 컬럼 `레이블` 헤더
  await test.step('[TMLO:71] 4번째 데이터 컬럼 `레이블` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[5][contains(normalize-space(.),"레이블")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:71] 4번째 데이터 컬럼 `레이블` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s72-failed.png') }).catch((e2) => console.warn('[screenshot] step #s72: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` 값 셀 표출
  await test.step('[TMLO:72] `레이블` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[5])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:72] `레이블` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s73-failed.png') }).catch((e2) => console.warn('[screenshot] step #s73: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 5번째 데이터 컬럼 `컨트롤러` 헤더
  await test.step('[TMLO:73] 5번째 데이터 컬럼 `컨트롤러` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[6][contains(normalize-space(.),"컨트롤러")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:73] 5번째 데이터 컬럼 `컨트롤러` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s74-failed.png') }).catch((e2) => console.warn('[screenshot] step #s74: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `컨트롤러` 값 셀 표출
  await test.step('[TMLO:74] `컨트롤러` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[6])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:74] `컨트롤러` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s75-failed.png') }).catch((e2) => console.warn('[screenshot] step #s75: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 6번째 데이터 컬럼 `연결 게이트웨이 수` 헤더
  await test.step('[TMLO:75] 6번째 데이터 컬럼 `연결 게이트웨이 수` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[7][contains(normalize-space(.),"연결 게이트웨이 수")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:75] 6번째 데이터 컬럼 `연결 게이트웨이 수` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s76-failed.png') }).catch((e2) => console.warn('[screenshot] step #s76: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `연결 게이트웨이 수` 값 셀 표출
  await test.step('[TMLO:76] `연결 게이트웨이 수` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[7])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:76] `연결 게이트웨이 수` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s77-failed.png') }).catch((e2) => console.warn('[screenshot] step #s77: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 7번째 데이터 컬럼 `생성일시` 헤더
  await test.step('[TMLO:77] 7번째 데이터 컬럼 `생성일시` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[8][contains(normalize-space(.),"생성일시")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:77] 7번째 데이터 컬럼 `생성일시` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s78-failed.png') }).catch((e2) => console.warn('[screenshot] step #s78: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `생성일시` 값 셀 표출
  await test.step('[TMLO:78] `생성일시` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[8])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:78] `생성일시` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s79-failed.png') }).catch((e2) => console.warn('[screenshot] step #s79: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 8번째 데이터 컬럼 `작업` 헤더
  await test.step('[TMLO:79] 8번째 데이터 컬럼 `작업` 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//th[9][contains(normalize-space(.),"작업")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:79] 8번째 데이터 컬럼 `작업` 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s80-failed.png') }).catch((e2) => console.warn('[screenshot] step #s80: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `작업` 값 셀 표출
  await test.step('[TMLO:80] `작업` 값 셀 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[9])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:80] `작업` 값 셀 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s81-failed.png') }).catch((e2) => console.warn('[screenshot] step #s81: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행별 더보기(more_horiz)
  await test.step('[TMLO:81] 행별 더보기(more_horiz)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//button[normalize-space(.)="more_horiz"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:81] 행별 더보기(more_horiz)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s82-failed.png') }).catch((e2) => console.warn('[screenshot] step #s82: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 헤더 체크박스
  await test.step('[TMLO:82] 헤더 체크박스', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//thead//input[@type="checkbox"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:82] 헤더 체크박스");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s83-failed.png') }).catch((e2) => console.warn('[screenshot] step #s83: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행 체크박스
  await test.step('[TMLO:83] 행 체크박스', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")]//input[@type="checkbox"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:83] 행 체크박스");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s84-failed.png') }).catch((e2) => console.warn('[screenshot] step #s84: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 데이터 행 표출
  await test.step('[TMLO:84] 데이터 행 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:84] 데이터 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s85-failed.png') }).catch((e2) => console.warn('[screenshot] step #s85: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 셀 표출(긴 이름 줄바꿈)
  await test.step('[TMLO:85] `이름` 셀 표출(긴 이름 줄바꿈)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[2])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:85] `이름` 셀 표출(긴 이름 줄바꿈)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s86-failed.png') }).catch((e2) => console.warn('[screenshot] step #s86: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 푸터 `전체 수`
  await test.step('[TMLO:86] 푸터 `전체 수`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-total')).toContainText('전체 수', { timeout: 30000 }); }, 3, "[TMLO:86] 푸터 `전체 수`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s87-failed.png') }).catch((e2) => console.warn('[screenshot] step #s87: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 first
  await test.step('[TMLO:87] 페이지네이션 first', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-first')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:87] 페이지네이션 first");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s88-failed.png') }).catch((e2) => console.warn('[screenshot] step #s88: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 prev
  await test.step('[TMLO:88] 페이지네이션 prev', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-prev')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:88] 페이지네이션 prev");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s89-failed.png') }).catch((e2) => console.warn('[screenshot] step #s89: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 next
  await test.step('[TMLO:89] 페이지네이션 next', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-next')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:89] 페이지네이션 next");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s90-failed.png') }).catch((e2) => console.warn('[screenshot] step #s90: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 last
  await test.step('[TMLO:90] 페이지네이션 last', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-last')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:90] 페이지네이션 last");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s91-failed.png') }).catch((e2) => console.warn('[screenshot] step #s91: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지네이션 현재 페이지 입력
  await test.step('[TMLO:91] 페이지네이션 현재 페이지 입력', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-page-input')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:91] 페이지네이션 현재 페이지 입력");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s92-failed.png') }).catch((e2) => console.warn('[screenshot] step #s92: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `리스트 수` 선택기
  await test.step('[TMLO:92] `리스트 수` 선택기', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-fetch-table-pagination-page-size')).toContainText('리스트 수', { timeout: 30000 }); }, 3, "[TMLO:92] `리스트 수` 선택기");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s93-failed.png') }).catch((e2) => console.warn('[screenshot] step #s93: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` help 아이콘 클릭(툴팁 호버 대용)
  await test.step('[TMLO:93] `상태` help 아이콘 클릭(툴팁 호버 대용)', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//th[contains(normalize-space(.),"상태")]//*[normalize-space(text())="help"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s94-failed.png') }).catch((e2) => console.warn('[screenshot] step #s94: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상태값 설명 툴팁 표출
  await test.step('[TMLO:94] 상태값 설명 툴팁 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.ant-tooltip:not(.ant-tooltip-hidden) .ant-tooltip-inner')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:94] 상태값 설명 툴팁 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s95-failed.png') }).catch((e2) => console.warn('[screenshot] step #s95: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
