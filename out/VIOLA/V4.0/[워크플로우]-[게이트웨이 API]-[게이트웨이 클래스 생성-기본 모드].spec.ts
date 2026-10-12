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

test('[워크플로우]-[게이트웨이 API]-[게이트웨이 클래스 생성-기본 모드]', async ({ page }, testInfo) => {
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

  // [+ 생성] 클릭
  await test.step('[TMLO:14] [+ 생성] 클릭', async () => {
    try {
      await page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-tabs-tabpane-active ")]//*[@data-testid="adm-list-button-groups-create"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 화면 헤더
  await test.step('[TMLO:15] 화면 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:15] 화면 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모드` 입력 섹션
  await test.step('[TMLO:16] `모드` 입력 섹션', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="모드"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:16] `모드` 입력 섹션");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 정보` 입력 섹션
  await test.step('[TMLO:17] `기본 정보` 입력 섹션', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="기본 정보"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:17] `기본 정보` 입력 섹션");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스펙` 입력 섹션
  await test.step('[TMLO:18] `스펙` 입력 섹션', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="스펙"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:18] `스펙` 입력 섹션");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 하단 액션 버튼 영역
  await test.step('[TMLO:19] 하단 액션 버튼 영역', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-viola-gatewayclass-create-content-footer')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:19] 하단 액션 버튼 영역");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우측 가이드 패널
  await test.step('[TMLO:20] 우측 가이드 패널', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:20] 우측 가이드 패널");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 섹션 순서: 모드 → 기본 정보 → 스펙
  await test.step('[TMLO:21] 섹션 순서: 모드 → 기본 정보 → 스펙', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="모드"]/following::h1[normalize-space(.)="기본 정보"]/following::h1[normalize-space(.)="스펙"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:21] 섹션 순서: 모드 → 기본 정보 → 스펙");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:22] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 생성', { timeout: 30000 }); }, 3, "[TMLO:22] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:23] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 생성', { timeout: 30000 }); }, 3, "[TMLO:23] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `대시보드` 표출
  await test.step('[TMLO:24] LNB 대분류 `대시보드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"대시보드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:24] LNB 대분류 `대시보드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `기본 설정` 표출
  await test.step('[TMLO:25] LNB 대분류 `기본 설정` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:25] LNB 대분류 `기본 설정` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `워크플로우` 표출
  await test.step('[TMLO:26] LNB 대분류 `워크플로우` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:26] LNB 대분류 `워크플로우` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `서비스 카탈로그` 표출
  await test.step('[TMLO:27] LNB 대분류 `서비스 카탈로그` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:27] LNB 대분류 `서비스 카탈로그` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `모니터링` 표출
  await test.step('[TMLO:28] LNB 대분류 `모니터링` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"모니터링")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:28] LNB 대분류 `모니터링` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크플로우` 확장 상태
  await test.step('[TMLO:29] `워크플로우` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:29] `워크플로우` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 설정` 미확장
  await test.step('[TMLO:30] `기본 설정` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:30] `기본 설정` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `서비스 카탈로그` 미확장
  await test.step('[TMLO:31] `서비스 카탈로그` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:31] `서비스 카탈로그` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링` 미확장
  await test.step('[TMLO:32] `모니터링` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"모니터링")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:32] `모니터링` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스` 표출
  await test.step('[TMLO:33] LNB 메뉴 `서비스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:33] LNB 메뉴 `서비스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `인그레스` 표출
  await test.step('[TMLO:34] LNB 메뉴 `인그레스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="인그레스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:34] LNB 메뉴 `인그레스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `게이트웨이 API` 표출
  await test.step('[TMLO:35] LNB 메뉴 `게이트웨이 API` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:35] LNB 메뉴 `게이트웨이 API` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `네트워크 폴리시` 표출
  await test.step('[TMLO:36] LNB 메뉴 `네트워크 폴리시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="네트워크 폴리시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:36] LNB 메뉴 `네트워크 폴리시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스 메시` 표출
  await test.step('[TMLO:37] LNB 메뉴 `서비스 메시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스 메시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:37] LNB 메뉴 `서비스 메시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 API` 선택 상태
  await test.step('[TMLO:38] `게이트웨이 API` 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-item-selected ")][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:38] `게이트웨이 API` 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `알림` 표출
  await test.step('[TMLO:39] LNB 하단 `알림` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*알림\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:39] LNB 하단 `알림` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `프로필` 표출
  await test.step('[TMLO:40] LNB 하단 `프로필` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*프로필\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:40] LNB 하단 `프로필` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 접기 아이콘(first_page) 표출
  await test.step('[TMLO:41] LNB 접기 아이콘(first_page) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*first_page\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:41] LNB 접기 아이콘(first_page) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우상단 클러스터 선택기 표출
  await test.step('[TMLO:42] 우상단 클러스터 선택기 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:42] 우상단 클러스터 선택기 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 선택기 교체 아이콘(sync_alt)
  await test.step('[TMLO:43] 클러스터 선택기 교체 아이콘(sync_alt)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toContainText('sync_alt', { timeout: 30000 }); }, 3, "[TMLO:43] 클러스터 선택기 교체 아이콘(sync_alt)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 모니터링 현황 차트 아이콘(browse_activity)
  await test.step('[TMLO:44] 모니터링 현황 차트 아이콘(browse_activity)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-header-toggle-panel"]//*[normalize-space(text())="browse_activity"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:44] 모니터링 현황 차트 아이콘(browse_activity)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링 현황` 버튼 라벨
  await test.step('[TMLO:45] `모니터링 현황` 버튼 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-header-toggle-panel')).toContainText('모니터링 현황', { timeout: 30000 }); }, 3, "[TMLO:45] `모니터링 현황` 버튼 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 뒤로가기 아이콘(arrow_back)
  await test.step('[TMLO:46] 뒤로가기 아이콘(arrow_back)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//*[normalize-space(text())="arrow_back"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:46] 뒤로가기 아이콘(arrow_back)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 타이틀 `게이트웨이 클래스 생성`
  await test.step('[TMLO:47] 타이틀 `게이트웨이 클래스 생성`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toContainText('게이트웨이 클래스 생성', { timeout: 30000 }); }, 3, "[TMLO:47] 타이틀 `게이트웨이 클래스 생성`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 공통 정의 항목 `모드 선택` 표출
  await test.step('[TMLO:48] 공통 정의 항목 `모드 선택` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="모드 선택"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:48] 공통 정의 항목 `모드 선택` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 공통 정의 항목 `클러스터` 표출
  await test.step('[TMLO:49] 공통 정의 항목 `클러스터` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="클러스터"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:49] 공통 정의 항목 `클러스터` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 공통 정의 항목 `이름` 표출
  await test.step('[TMLO:50] 공통 정의 항목 `이름` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="이름"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:50] 공통 정의 항목 `이름` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 공통 정의 항목 `레이블` 표출
  await test.step('[TMLO:51] 공통 정의 항목 `레이블` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="레이블"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:51] 공통 정의 항목 `레이블` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 모드` 카드
  await test.step('[TMLO:52] `기본 모드` 카드', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-convert-container-mode"]//*[normalize-space(.)="기본 모드"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:52] `기본 모드` 카드");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `고급 모드` 카드
  await test.step('[TMLO:53] `고급 모드` 카드', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-convert-container-mode"]//*[normalize-space(.)="고급 모드"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:53] `고급 모드` 카드");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 모드` 선택 상태(checked)
  await test.step('[TMLO:54] `기본 모드` 선택 상태(checked)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-convert-container-mode"]//label[contains(@class,"checked")][contains(normalize-space(.),"기본 모드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:54] `기본 모드` 선택 상태(checked)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `클러스터` select 표출
  await test.step('[TMLO:55] `클러스터` select 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-basic-info-provider-id')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:55] `클러스터` select 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s56-failed.png') }).catch((e2) => console.warn('[screenshot] step #s56: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 입력 필드
  await test.step('[TMLO:56] `이름` 입력 필드', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-json-name-placeholder')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:56] `이름` 입력 필드");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s57-failed.png') }).catch((e2) => console.warn('[screenshot] step #s57: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` placeholder
  await test.step('[TMLO:57] `이름` placeholder', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('input[placeholder="이름을 입력해 주세요."]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:57] `이름` placeholder");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s58-failed.png') }).catch((e2) => console.warn('[screenshot] step #s58: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `중복 확인` 버튼
  await test.step('[TMLO:58] `중복 확인` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-json-name-duplicate-name')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:58] `중복 확인` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s59-failed.png') }).catch((e2) => console.warn('[screenshot] step #s59: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` Key·Value 입력 행
  await test.step('[TMLO:59] `레이블` Key·Value 입력 행', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-labels-key-value-table')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:59] `레이블` Key·Value 입력 행");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s60-failed.png') }).catch((e2) => console.warn('[screenshot] step #s60: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` Key 헤더
  await test.step('[TMLO:60] `레이블` Key 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-labels-key-value-table')).toContainText('Key', { timeout: 30000 }); }, 3, "[TMLO:60] `레이블` Key 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s61-failed.png') }).catch((e2) => console.warn('[screenshot] step #s61: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` Value 헤더
  await test.step('[TMLO:61] `레이블` Value 헤더', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-labels-key-value-table')).toContainText('Value', { timeout: 30000 }); }, 3, "[TMLO:61] `레이블` Value 헤더");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s62-failed.png') }).catch((e2) => console.warn('[screenshot] step #s62: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행 삭제 휴지통 아이콘
  await test.step('[TMLO:62] 행 삭제 휴지통 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-input-labels-key-value-table"]//*[normalize-space(text())="delete"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:62] 행 삭제 휴지통 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s63-failed.png') }).catch((e2) => console.warn('[screenshot] step #s63: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `+ 필드 추가` 링크
  await test.step('[TMLO:63] `+ 필드 추가` 링크', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-input-labels-key-value-table')).toContainText('필드 추가', { timeout: 30000 }); }, 3, "[TMLO:63] `+ 필드 추가` 링크");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s64-failed.png') }).catch((e2) => console.warn('[screenshot] step #s64: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모드 선택` 필수 표시
  await test.step('[TMLO:64] `모드 선택` 필수 표시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="모드 선택"][contains(@class,"required") or .//*[contains(@class,"required")] or contains(@class,"ant-form-item-required")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:64] `모드 선택` 필수 표시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s65-failed.png') }).catch((e2) => console.warn('[screenshot] step #s65: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `클러스터` 필수 표시
  await test.step('[TMLO:65] `클러스터` 필수 표시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="클러스터"][contains(@class,"required") or .//*[contains(@class,"required")] or contains(@class,"ant-form-item-required")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:65] `클러스터` 필수 표시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s66-failed.png') }).catch((e2) => console.warn('[screenshot] step #s66: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 필수 표시
  await test.step('[TMLO:66] `이름` 필수 표시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="이름"][contains(@class,"required") or .//*[contains(@class,"required")] or contains(@class,"ant-form-item-required")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:66] `이름` 필수 표시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s67-failed.png') }).catch((e2) => console.warn('[screenshot] step #s67: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `컨트롤러` 필수 표시
  await test.step('[TMLO:67] `컨트롤러` 필수 표시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//main//h1[normalize-space(.)="컨트롤러"][contains(@class,"required") or .//*[contains(@class,"required")] or contains(@class,"ant-form-item-required")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:67] `컨트롤러` 필수 표시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s68-failed.png') }).catch((e2) => console.warn('[screenshot] step #s68: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `레이블` 필수 표시 미표출
  await test.step('[TMLO:68] `레이블` 필수 표시 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//main//h1[normalize-space(.)="레이블"][contains(@class,"required") or .//*[contains(@class,"required")]])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:68] `레이블` 필수 표시 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s69-failed.png') }).catch((e2) => console.warn('[screenshot] step #s69: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `컨트롤러` 입력 필드
  await test.step('[TMLO:69] `컨트롤러` 입력 필드', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:69] `컨트롤러` 입력 필드");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s70-failed.png') }).catch((e2) => console.warn('[screenshot] step #s70: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `컨트롤러` placeholder
  await test.step('[TMLO:70] `컨트롤러` placeholder', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('input[placeholder="컨트롤러를 입력해 주세요."]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:70] `컨트롤러` placeholder");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s71-failed.png') }).catch((e2) => console.warn('[screenshot] step #s71: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `취소` 버튼
  await test.step('[TMLO:71] `취소` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-convert-container-go-back-page')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:71] `취소` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s72-failed.png') }).catch((e2) => console.warn('[screenshot] step #s72: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `생성` 버튼
  await test.step('[TMLO:72] `생성` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-convert-container-action')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:72] `생성` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s73-failed.png') }).catch((e2) => console.warn('[screenshot] step #s73: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 제목 `기본 모드 가이드`
  await test.step('[TMLO:73] 가이드 제목 `기본 모드 가이드`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-title')).toContainText('기본 모드 가이드', { timeout: 30000 }); }, 3, "[TMLO:73] 가이드 제목 `기본 모드 가이드`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s74-failed.png') }).catch((e2) => console.warn('[screenshot] step #s74: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 아코디언 `모드 선택`
  await test.step('[TMLO:74] 가이드 아코디언 `모드 선택`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-resource-guide-collapse"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-collapse-header ")][contains(normalize-space(.),"모드 선택")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:74] 가이드 아코디언 `모드 선택`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s75-failed.png') }).catch((e2) => console.warn('[screenshot] step #s75: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 아코디언 `기본 정보`
  await test.step('[TMLO:75] 가이드 아코디언 `기본 정보`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-resource-guide-collapse"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-collapse-header ")][contains(normalize-space(.),"기본 정보")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:75] 가이드 아코디언 `기본 정보`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s76-failed.png') }).catch((e2) => console.warn('[screenshot] step #s76: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 아코디언 `스펙`
  await test.step('[TMLO:76] 가이드 아코디언 `스펙`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-resource-guide-collapse"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-collapse-header ")][contains(normalize-space(.),"스펙")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:76] 가이드 아코디언 `스펙`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s77-failed.png') }).catch((e2) => console.warn('[screenshot] step #s77: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가이드 `스펙` 아코디언 펼치기
  await test.step('[TMLO:77] 가이드 `스펙` 아코디언 펼치기', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-resource-guide-collapse"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-collapse-header ")][contains(normalize-space(.),"스펙")])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s78-failed.png') }).catch((e2) => console.warn('[screenshot] step #s78: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스펙` 만 펼침
  await test.step('[TMLO:78] `스펙` 만 펼침', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-resource-guide-collapse"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-collapse-item-active ")][contains(normalize-space(.),"스펙")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:78] `스펙` 만 펼침");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s79-failed.png') }).catch((e2) => console.warn('[screenshot] step #s79: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스펙` 항목명 `컨트롤러`
  await test.step('[TMLO:79] `스펙` 항목명 `컨트롤러`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-collapse')).toContainText('컨트롤러', { timeout: 30000 }); }, 3, "[TMLO:79] `스펙` 항목명 `컨트롤러`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s80-failed.png') }).catch((e2) => console.warn('[screenshot] step #s80: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스펙` 설명 문구
  await test.step('[TMLO:80] `스펙` 설명 문구', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-resource-guide-collapse')).toContainText('해당 게이트웨이 클래스를 관리할 컨트롤러를 지정합니다.', { timeout: 30000 }); }, 3, "[TMLO:80] `스펙` 설명 문구");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s81-failed.png') }).catch((e2) => console.warn('[screenshot] step #s81: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 도메인 경로 형식
  await test.step('[TMLO:81] 컨트롤러: 도메인 경로 형식', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/gateway-controller', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s82-failed.png') }).catch((e2) => console.warn('[screenshot] step #s82: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:82] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s83-failed.png') }).catch((e2) => console.warn('[screenshot] step #s83: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 도메인 경로 형식 값 유지
  await test.step('[TMLO:83] 도메인 경로 형식 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/gateway-controller', { timeout: 30000 }); }, 3, "[TMLO:83] 도메인 경로 형식 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s84-failed.png') }).catch((e2) => console.warn('[screenshot] step #s84: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:84] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:84] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s85-failed.png') }).catch((e2) => console.warn('[screenshot] step #s85: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 도메인 접두사 없음
  await test.step('[TMLO:85] 컨트롤러: 도메인 접두사 없음', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('gateway-controller', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s86-failed.png') }).catch((e2) => console.warn('[screenshot] step #s86: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:86] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s87-failed.png') }).catch((e2) => console.warn('[screenshot] step #s87: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 입력값 정책 미충족 오류 표출
  await test.step('[TMLO:87] 입력값 정책 미충족 오류 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:87] 입력값 정책 미충족 오류 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s88-failed.png') }).catch((e2) => console.warn('[screenshot] step #s88: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 문구
  await test.step('[TMLO:88] 오류 메시지 문구', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toContainText('도메인을 포함한 경로(예: example.com/gateway-controller) 형태로 입력해 주세요.', { timeout: 30000 }); }, 3, "[TMLO:88] 오류 메시지 문구");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s89-failed.png') }).catch((e2) => console.warn('[screenshot] step #s89: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 영소문자
  await test.step('[TMLO:89] 컨트롤러: 영소문자', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/abc', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s90-failed.png') }).catch((e2) => console.warn('[screenshot] step #s90: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:90] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s91-failed.png') }).catch((e2) => console.warn('[screenshot] step #s91: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 영소문자 값 유지
  await test.step('[TMLO:91] 영소문자 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/abc', { timeout: 30000 }); }, 3, "[TMLO:91] 영소문자 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s92-failed.png') }).catch((e2) => console.warn('[screenshot] step #s92: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:92] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:92] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s93-failed.png') }).catch((e2) => console.warn('[screenshot] step #s93: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 숫자 포함
  await test.step('[TMLO:93] 컨트롤러: 숫자 포함', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/abc123', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s94-failed.png') }).catch((e2) => console.warn('[screenshot] step #s94: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:94] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s95-failed.png') }).catch((e2) => console.warn('[screenshot] step #s95: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 숫자 포함 값 유지
  await test.step('[TMLO:95] 숫자 포함 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/abc123', { timeout: 30000 }); }, 3, "[TMLO:95] 숫자 포함 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s96-failed.png') }).catch((e2) => console.warn('[screenshot] step #s96: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:96] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:96] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s97-failed.png') }).catch((e2) => console.warn('[screenshot] step #s97: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 슬래시 포함
  await test.step('[TMLO:97] 컨트롤러: 슬래시 포함', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/a/b', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s98-failed.png') }).catch((e2) => console.warn('[screenshot] step #s98: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:98] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s99-failed.png') }).catch((e2) => console.warn('[screenshot] step #s99: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 슬래시 포함 값 유지
  await test.step('[TMLO:99] 슬래시 포함 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/a/b', { timeout: 30000 }); }, 3, "[TMLO:99] 슬래시 포함 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s100-failed.png') }).catch((e2) => console.warn('[screenshot] step #s100: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:100] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:100] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s101-failed.png') }).catch((e2) => console.warn('[screenshot] step #s101: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 하이픈 포함
  await test.step('[TMLO:101] 컨트롤러: 하이픈 포함', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/a-b', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s102-failed.png') }).catch((e2) => console.warn('[screenshot] step #s102: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:102] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s103-failed.png') }).catch((e2) => console.warn('[screenshot] step #s103: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 하이픈 포함 값 유지
  await test.step('[TMLO:103] 하이픈 포함 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/a-b', { timeout: 30000 }); }, 3, "[TMLO:103] 하이픈 포함 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s104-failed.png') }).catch((e2) => console.warn('[screenshot] step #s104: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:104] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:104] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s105-failed.png') }).catch((e2) => console.warn('[screenshot] step #s105: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 언더바 포함
  await test.step('[TMLO:105] 컨트롤러: 언더바 포함', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/a_b', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s106-failed.png') }).catch((e2) => console.warn('[screenshot] step #s106: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:106] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s107-failed.png') }).catch((e2) => console.warn('[screenshot] step #s107: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 언더바 포함 값 유지
  await test.step('[TMLO:107] 언더바 포함 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/a_b', { timeout: 30000 }); }, 3, "[TMLO:107] 언더바 포함 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s108-failed.png') }).catch((e2) => console.warn('[screenshot] step #s108: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:108] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:108] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s109-failed.png') }).catch((e2) => console.warn('[screenshot] step #s109: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 마침표 포함
  await test.step('[TMLO:109] 컨트롤러: 마침표 포함', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/a.b', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s110-failed.png') }).catch((e2) => console.warn('[screenshot] step #s110: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:110] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s111-failed.png') }).catch((e2) => console.warn('[screenshot] step #s111: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 마침표 포함 값 유지
  await test.step('[TMLO:111] 마침표 포함 값 유지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/a.b', { timeout: 30000 }); }, 3, "[TMLO:111] 마침표 포함 값 유지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s112-failed.png') }).catch((e2) => console.warn('[screenshot] step #s112: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 오류 메시지 미표출
  await test.step('[TMLO:112] 오류 메시지 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:112] 오류 메시지 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s113-failed.png') }).catch((e2) => console.warn('[screenshot] step #s113: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 허용 외 특수문자
  await test.step('[TMLO:113] 컨트롤러: 허용 외 특수문자', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/a#b', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s114-failed.png') }).catch((e2) => console.warn('[screenshot] step #s114: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:114] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s115-failed.png') }).catch((e2) => console.warn('[screenshot] step #s115: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 입력값 정책 미충족 오류 표출
  await test.step('[TMLO:115] 입력값 정책 미충족 오류 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:115] 입력값 정책 미충족 오류 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s116-failed.png') }).catch((e2) => console.warn('[screenshot] step #s116: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 1자(하한)
  await test.step('[TMLO:116] 컨트롤러: 1자(하한)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('a', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s117-failed.png') }).catch((e2) => console.warn('[screenshot] step #s117: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 1자 값 정상 입력
  await test.step('[TMLO:117] 1자 값 정상 입력', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('a', { timeout: 30000 }); }, 3, "[TMLO:117] 1자 값 정상 입력");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s118-failed.png') }).catch((e2) => console.warn('[screenshot] step #s118: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러: 253자(상한)
  await test.step('[TMLO:118] 컨트롤러: 253자(상한)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s119-failed.png') }).catch((e2) => console.warn('[screenshot] step #s119: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 253자 값 정상 입력
  await test.step('[TMLO:119] 253자 값 정상 입력', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name')).toHaveValue('example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', { timeout: 30000 }); }, 3, "[TMLO:119] 253자 값 정상 입력");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s120-failed.png') }).catch((e2) => console.warn('[screenshot] step #s120: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤러 비우기
  await test.step('[TMLO:120] 컨트롤러 비우기', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').fill('', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s121-failed.png') }).catch((e2) => console.warn('[screenshot] step #s121: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포커스 이동(검증 트리거)
  await test.step('[TMLO:121] 포커스 이동(검증 트리거)', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-basic-controller-name').press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s122-failed.png') }).catch((e2) => console.warn('[screenshot] step #s122: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 미입력 오류 표출(하한 미충족)
  await test.step('[TMLO:122] 미입력 오류 표출(하한 미충족)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-form-item-spec-controllername"]//*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item-explain-error ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:122] 미입력 오류 표출(하한 미충족)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s123-failed.png') }).catch((e2) => console.warn('[screenshot] step #s123: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `고급 모드` 카드 선택
  await test.step('[TMLO:123] `고급 모드` 카드 선택', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-convert-container-mode"]//label[contains(normalize-space(.),"고급 모드")])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s124-failed.png') }).catch((e2) => console.warn('[screenshot] step #s124: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 기반 입력 화면 전환(YAML 유효성 검사 버튼)
  await test.step('[TMLO:124] YAML 기반 입력 화면 전환(YAML 유효성 검사 버튼)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-yaml-validate')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:124] YAML 기반 입력 화면 전환(YAML 유효성 검사 버튼)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s125-failed.png') }).catch((e2) => console.warn('[screenshot] step #s125: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
