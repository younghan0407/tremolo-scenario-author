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

test('[워크플로우]-[게이트웨이 API]-[게이트웨이 클래스 상세]', async ({ page }, testInfo) => {
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

  // 연결 게이트웨이 1건 이상 행 `이름` 클릭
  await test.step('[TMLO:14] 연결 게이트웨이 1건 이상 행 `이름` 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][td[7][normalize-space(.)!="0"]]//*[@data-testid="adm-name-cell"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 화면 헤더·액션
  await test.step('[TMLO:15] 화면 헤더·액션', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:15] 화면 헤더·액션");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 좌측 `기본 정보` 패널
  await test.step('[TMLO:16] 좌측 `기본 정보` 패널', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-sider-info-title')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:16] 좌측 `기본 정보` 패널");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 바
  await test.step('[TMLO:17] 탭 바', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-detail-tabs')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:17] 탭 바");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:18] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 상세', { timeout: 30000 }); }, 3, "[TMLO:18] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:19] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 상세', { timeout: 30000 }); }, 3, "[TMLO:19] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `대시보드` 표출
  await test.step('[TMLO:20] LNB 대분류 `대시보드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"대시보드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:20] LNB 대분류 `대시보드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `기본 설정` 표출
  await test.step('[TMLO:21] LNB 대분류 `기본 설정` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:21] LNB 대분류 `기본 설정` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `워크플로우` 표출
  await test.step('[TMLO:22] LNB 대분류 `워크플로우` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:22] LNB 대분류 `워크플로우` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `서비스 카탈로그` 표출
  await test.step('[TMLO:23] LNB 대분류 `서비스 카탈로그` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:23] LNB 대분류 `서비스 카탈로그` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `모니터링` 표출
  await test.step('[TMLO:24] LNB 대분류 `모니터링` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"모니터링")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:24] LNB 대분류 `모니터링` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크플로우` 확장 상태
  await test.step('[TMLO:25] `워크플로우` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:25] `워크플로우` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 설정` 미확장
  await test.step('[TMLO:26] `기본 설정` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:26] `기본 설정` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `서비스 카탈로그` 미확장
  await test.step('[TMLO:27] `서비스 카탈로그` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:27] `서비스 카탈로그` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링` 미확장
  await test.step('[TMLO:28] `모니터링` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"모니터링")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:28] `모니터링` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `워크로드` 표출
  await test.step('[TMLO:29] LNB 하위 `워크로드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:29] LNB 하위 `워크로드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `네트워크` 표출
  await test.step('[TMLO:30] LNB 하위 `네트워크` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:30] LNB 하위 `네트워크` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `스토리지` 표출
  await test.step('[TMLO:31] LNB 하위 `스토리지` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:31] LNB 하위 `스토리지` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `네트워크` 확장 상태
  await test.step('[TMLO:32] `네트워크` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:32] `네트워크` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크로드` 미확장
  await test.step('[TMLO:33] `워크로드` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:33] `워크로드` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스토리지` 미확장
  await test.step('[TMLO:34] `스토리지` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:34] `스토리지` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스` 표출
  await test.step('[TMLO:35] LNB 메뉴 `서비스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:35] LNB 메뉴 `서비스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `인그레스` 표출
  await test.step('[TMLO:36] LNB 메뉴 `인그레스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="인그레스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:36] LNB 메뉴 `인그레스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `게이트웨이 API` 표출
  await test.step('[TMLO:37] LNB 메뉴 `게이트웨이 API` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:37] LNB 메뉴 `게이트웨이 API` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `네트워크 폴리시` 표출
  await test.step('[TMLO:38] LNB 메뉴 `네트워크 폴리시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="네트워크 폴리시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:38] LNB 메뉴 `네트워크 폴리시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스 메시` 표출
  await test.step('[TMLO:39] LNB 메뉴 `서비스 메시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스 메시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:39] LNB 메뉴 `서비스 메시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 API` 선택 상태
  await test.step('[TMLO:40] `게이트웨이 API` 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-item-selected ")][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:40] `게이트웨이 API` 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `알림` 표출
  await test.step('[TMLO:41] LNB 하단 `알림` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*알림\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:41] LNB 하단 `알림` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `프로필` 표출
  await test.step('[TMLO:42] LNB 하단 `프로필` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*프로필\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:42] LNB 하단 `프로필` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 접기 아이콘(first_page) 표출
  await test.step('[TMLO:43] LNB 접기 아이콘(first_page) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*first_page\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:43] LNB 접기 아이콘(first_page) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우상단 클러스터 선택기 표출
  await test.step('[TMLO:44] 우상단 클러스터 선택기 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:44] 우상단 클러스터 선택기 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 선택기 교체 아이콘(sync_alt)
  await test.step('[TMLO:45] 클러스터 선택기 교체 아이콘(sync_alt)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toContainText('sync_alt', { timeout: 30000 }); }, 3, "[TMLO:45] 클러스터 선택기 교체 아이콘(sync_alt)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 모니터링 현황 차트 아이콘(browse_activity)
  await test.step('[TMLO:46] 모니터링 현황 차트 아이콘(browse_activity)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-header-toggle-panel"]//*[normalize-space(text())="browse_activity"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:46] 모니터링 현황 차트 아이콘(browse_activity)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링 현황` 버튼 라벨
  await test.step('[TMLO:47] `모니터링 현황` 버튼 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-header-toggle-panel')).toContainText('모니터링 현황', { timeout: 30000 }); }, 3, "[TMLO:47] `모니터링 현황` 버튼 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 뒤로가기 아이콘
  await test.step('[TMLO:48] 뒤로가기 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//*[normalize-space(text())="arrow_back"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:48] 뒤로가기 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 리소스 이름 타이틀(h1)
  await test.step('[TMLO:49] 리소스 이름 타이틀(h1)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//h1)[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:49] 리소스 이름 타이틀(h1)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 액션 버튼 `수정`
  await test.step('[TMLO:50] 액션 버튼 `수정`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-detail-button-groups-button')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:50] 액션 버튼 `수정`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 액션 버튼 `삭제`
  await test.step('[TMLO:51] 액션 버튼 `삭제`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//button[normalize-space(.)="delete 삭제"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:51] 액션 버튼 `삭제`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `수정` → `삭제` 순서
  await test.step('[TMLO:52] `수정` → `삭제` 순서', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//button[normalize-space(.)="수정"]/following::button[normalize-space(.)="delete 삭제"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:52] `수정` → `삭제` 순서");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `삭제` 휴지통 아이콘
  await test.step('[TMLO:53] `삭제` 휴지통 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//button[normalize-space(.)="delete 삭제"]//*[normalize-space(text())="delete"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:53] `삭제` 휴지통 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 패널 제목 `기본 정보`
  await test.step('[TMLO:54] 패널 제목 `기본 정보`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-sider-info-title')).toContainText('기본 정보', { timeout: 30000 }); }, 3, "[TMLO:54] 패널 제목 `기본 정보`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 패널 접기 아이콘(left_panel_close)
  await test.step('[TMLO:55] 패널 접기 아이콘(left_panel_close)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-sider-info-title"]//*[normalize-space(text())="left_panel_close"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:55] 패널 접기 아이콘(left_panel_close)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s56-failed.png') }).catch((e2) => console.warn('[screenshot] step #s56: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 필드 순서 이름→상태→클러스터→레이블→컨트롤러→생성일시
  await test.step('[TMLO:56] 필드 순서 이름→상태→클러스터→레이블→컨트롤러→생성일시', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="이름"]/following::*[normalize-space(.)="상태"]/following::*[normalize-space(.)="클러스터"]/following::*[normalize-space(.)="레이블"]/following::*[normalize-space(.)="컨트롤러"]/following::*[normalize-space(.)="생성일시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:56] 필드 순서 이름→상태→클러스터→레이블→컨트롤러→생성일시");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s57-failed.png') }).catch((e2) => console.warn('[screenshot] step #s57: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `이름`
  await test.step('[TMLO:57] 라벨 `이름`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="이름"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:57] 라벨 `이름`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s58-failed.png') }).catch((e2) => console.warn('[screenshot] step #s58: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `상태`
  await test.step('[TMLO:58] 라벨 `상태`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="상태"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:58] 라벨 `상태`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s59-failed.png') }).catch((e2) => console.warn('[screenshot] step #s59: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `클러스터`
  await test.step('[TMLO:59] 라벨 `클러스터`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="클러스터"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:59] 라벨 `클러스터`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s60-failed.png') }).catch((e2) => console.warn('[screenshot] step #s60: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `레이블`
  await test.step('[TMLO:60] 라벨 `레이블`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="레이블"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:60] 라벨 `레이블`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s61-failed.png') }).catch((e2) => console.warn('[screenshot] step #s61: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `컨트롤러`
  await test.step('[TMLO:61] 라벨 `컨트롤러`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="컨트롤러"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:61] 라벨 `컨트롤러`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s62-failed.png') }).catch((e2) => console.warn('[screenshot] step #s62: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 라벨 `생성일시`
  await test.step('[TMLO:62] 라벨 `생성일시`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="생성일시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:62] 라벨 `생성일시`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s63-failed.png') }).catch((e2) => console.warn('[screenshot] step #s63: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 배지
  await test.step('[TMLO:63] `상태` 배지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[@data-testid="adm-status-tag"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:63] `상태` 배지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s64-failed.png') }).catch((e2) => console.warn('[screenshot] step #s64: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `생성일시` YYYY-MM-DD hh:mm:ss 형식
  await test.step('[TMLO:64] `생성일시` YYYY-MM-DD hh:mm:ss 형식', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-panel"]//*[normalize-space(.)="생성일시"]/following::*[string-length(normalize-space(.))=19 and substring(normalize-space(.),5,1)="-" and substring(normalize-space(.),11,1)=" " and substring(normalize-space(.),14,1)=":"][1])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:64] `생성일시` YYYY-MM-DD hh:mm:ss 형식");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s65-failed.png') }).catch((e2) => console.warn('[screenshot] step #s65: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `세부 정보`
  await test.step('[TMLO:65] 탭 `세부 정보`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:65] 탭 `세부 정보`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s66-failed.png') }).catch((e2) => console.warn('[screenshot] step #s66: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `YAML`
  await test.step('[TMLO:66] 탭 `YAML`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="YAML"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:66] 탭 `YAML`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s67-failed.png') }).catch((e2) => console.warn('[screenshot] step #s67: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 순서 세부 정보→YAML
  await test.step('[TMLO:67] 탭 순서 세부 정보→YAML', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"]/following::*[@role="tab"][normalize-space(.)="YAML"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:67] 탭 순서 세부 정보→YAML");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s68-failed.png') }).catch((e2) => console.warn('[screenshot] step #s68: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 진입 시 `세부 정보` 선택
  await test.step('[TMLO:68] 진입 시 `세부 정보` 선택', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"][@aria-selected="true"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:68] 진입 시 `세부 정보` 선택");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s69-failed.png') }).catch((e2) => console.warn('[screenshot] step #s69: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `세부 정보` 고유 정보(연결 게이트웨이 표)
  await test.step('[TMLO:69] `세부 정보` 고유 정보(연결 게이트웨이 표)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-resource-connected-gateway-table-table')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:69] `세부 정보` 고유 정보(연결 게이트웨이 표)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s70-failed.png') }).catch((e2) => console.warn('[screenshot] step #s70: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 섹션 순서 연결 게이트웨이→상태
  await test.step('[TMLO:70] 섹션 순서 연결 게이트웨이→상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-tab-content-layout-sub-title"][normalize-space(.)="연결 게이트웨이"]/following::*[normalize-space(.)="상태"][ancestor::*[@data-testid="adm-page-viola-gatewayclass-detail-main"]])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:70] 섹션 순서 연결 게이트웨이→상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s71-failed.png') }).catch((e2) => console.warn('[screenshot] step #s71: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 섹션 제목 `연결 게이트웨이`
  await test.step('[TMLO:71] 섹션 제목 `연결 게이트웨이`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-tab-content-layout-sub-title"])[1]')).toContainText('연결 게이트웨이', { timeout: 30000 }); }, 3, "[TMLO:71] 섹션 제목 `연결 게이트웨이`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s72-failed.png') }).catch((e2) => console.warn('[screenshot] step #s72: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 연결 게이트웨이 목록 표
  await test.step('[TMLO:72] 연결 게이트웨이 목록 표', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:72] 연결 게이트웨이 목록 표");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s73-failed.png') }).catch((e2) => console.warn('[screenshot] step #s73: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컬럼 순서 이름→상태→게이트웨이 주소
  await test.step('[TMLO:73] 컬럼 순서 이름→상태→게이트웨이 주소', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//thead//th[contains(normalize-space(.),"이름")]/following-sibling::th[contains(normalize-space(.),"상태")]/following-sibling::th[contains(normalize-space(.),"게이트웨이 주소")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:73] 컬럼 순서 이름→상태→게이트웨이 주소");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s74-failed.png') }).catch((e2) => console.warn('[screenshot] step #s74: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 값 링크
  await test.step('[TMLO:74] `이름` 값 링크', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//tbody//*[@data-testid="adm-name-cell"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:74] `이름` 값 링크");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s75-failed.png') }).catch((e2) => console.warn('[screenshot] step #s75: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 배지
  await test.step('[TMLO:75] `상태` 배지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//tbody//*[@data-testid="adm-status-tag"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:75] `상태` 배지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s76-failed.png') }).catch((e2) => console.warn('[screenshot] step #s76: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 전체 건수 요약
  await test.step('[TMLO:76] 전체 건수 요약', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-resource-connected-gateway-table-pagination-total')).toContainText('전체 수', { timeout: 30000 }); }, 3, "[TMLO:76] 전체 건수 요약");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s77-failed.png') }).catch((e2) => console.warn('[screenshot] step #s77: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 페이지 이동 컨트롤
  await test.step('[TMLO:77] 페이지 이동 컨트롤', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-resource-connected-gateway-table-pagination-next')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:77] 페이지 이동 컨트롤");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s78-failed.png') }).catch((e2) => console.warn('[screenshot] step #s78: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 리스트 수 선택 컨트롤
  await test.step('[TMLO:78] 리스트 수 선택 컨트롤', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-resource-connected-gateway-table-pagination-page-size')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:78] 리스트 수 선택 컨트롤");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s79-failed.png') }).catch((e2) => console.warn('[screenshot] step #s79: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `이름` 헤더 정렬 아이콘
  await test.step('[TMLO:79] `이름` 헤더 정렬 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//th[contains(normalize-space(.),"이름")]//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:79] `이름` 헤더 정렬 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s80-failed.png') }).catch((e2) => console.warn('[screenshot] step #s80: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 헤더 help 아이콘
  await test.step('[TMLO:80] `상태` 헤더 help 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-connected-gateway-table-table"]//th[contains(normalize-space(.),"상태")]//*[normalize-space(text())="help"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:80] `상태` 헤더 help 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s81-failed.png') }).catch((e2) => console.warn('[screenshot] step #s81: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 섹션 제목 `상태`
  await test.step('[TMLO:81] 섹션 제목 `상태`', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-main"]//*[normalize-space(.)="상태"][not(ancestor::table)])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:81] 섹션 제목 `상태`");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s82-failed.png') }).catch((e2) => console.warn('[screenshot] step #s82: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상태 표 컬럼 유형→상태→업데이트 일시→이유→메시지
  await test.step('[TMLO:82] 상태 표 컬럼 유형→상태→업데이트 일시→이유→메시지', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//thead//th[contains(normalize-space(.),"유형")]/following-sibling::th[contains(normalize-space(.),"상태")]/following-sibling::th[contains(normalize-space(.),"업데이트 일시")]/following-sibling::th[contains(normalize-space(.),"이유")]/following-sibling::th[contains(normalize-space(.),"메시지")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:82] 상태 표 컬럼 유형→상태→업데이트 일시→이유→메시지");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s83-failed.png') }).catch((e2) => console.warn('[screenshot] step #s83: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상태 표 정렬 아이콘 전 컬럼 미표출
  await test.step('[TMLO:83] 상태 표 정렬 아이콘 전 컬럼 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//th//*[contains(concat(" ", normalize-space(@class), " "), " ant-table-column-sorter ")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:83] 상태 표 정렬 아이콘 전 컬럼 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s84-failed.png') }).catch((e2) => console.warn('[screenshot] step #s84: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상태 표 `상태` help 아이콘
  await test.step('[TMLO:84] 상태 표 `상태` help 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//th[contains(normalize-space(.),"상태")]//*[normalize-space(text())="help"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:84] 상태 표 `상태` help 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s85-failed.png') }).catch((e2) => console.warn('[screenshot] step #s85: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 상태 help 아이콘 클릭(호버 대용)
  await test.step('[TMLO:85] 상태 help 아이콘 클릭(호버 대용)', async () => {
    try {
      await page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//th[contains(normalize-space(.),"상태")]//*[normalize-space(text())="help"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s86-failed.png') }).catch((e2) => console.warn('[screenshot] step #s86: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 툴팁 노출
  await test.step('[TMLO:86] 툴팁 노출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.ant-tooltip:not(.ant-tooltip-hidden) .ant-tooltip-inner')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:86] 툴팁 노출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s87-failed.png') }).catch((e2) => console.warn('[screenshot] step #s87: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `유형` 평문 값
  await test.step('[TMLO:87] `유형` 평문 값', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[1])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:87] `유형` 평문 값");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s88-failed.png') }).catch((e2) => console.warn('[screenshot] step #s88: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `상태` 값 표출
  await test.step('[TMLO:88] `상태` 값 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][1]//td[2])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:88] `상태` 값 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s89-failed.png') }).catch((e2) => console.warn('[screenshot] step #s89: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `업데이트 일시` 형식
  await test.step('[TMLO:89] `업데이트 일시` 형식', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//tbody//tr[1]/td[3][string-length(normalize-space(.))=19 and substring(normalize-space(.),5,1)="-" and substring(normalize-space(.),14,1)=":"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:89] `업데이트 일시` 형식");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s90-failed.png') }).catch((e2) => console.warn('[screenshot] step #s90: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `메시지` 복사 아이콘
  await test.step('[TMLO:90] `메시지` 복사 아이콘', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-resource-condition-table-table"]//tbody//*[@data-testid="adm-copy-button"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:90] `메시지` 복사 아이콘");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s91-failed.png') }).catch((e2) => console.warn('[screenshot] step #s91: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `YAML` 선택
  await test.step('[TMLO:91] 탭 `YAML` 선택', async () => {
    try {
      await page.locator('xpath=(//*[@role="tab"][normalize-space(.)="YAML"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s92-failed.png') }).catch((e2) => console.warn('[screenshot] step #s92: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `YAML` 선택 상태 전환
  await test.step('[TMLO:92] `YAML` 선택 상태 전환', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="YAML"][@aria-selected="true"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:92] `YAML` 선택 상태 전환");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s93-failed.png') }).catch((e2) => console.warn('[screenshot] step #s93: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `YAML` 고유 정보(코드 뷰어)
  await test.step('[TMLO:93] `YAML` 고유 정보(코드 뷰어)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail-main"]//textarea/ancestor::*[1])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:93] `YAML` 고유 정보(코드 뷰어)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s94-failed.png') }).catch((e2) => console.warn('[screenshot] step #s94: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 내용(apiVersion)
  await test.step('[TMLO:94] YAML 내용(apiVersion)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-viola-gatewayclass-detail-main')).toContainText('apiVersion', { timeout: 30000 }); }, 3, "[TMLO:94] YAML 내용(apiVersion)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s95-failed.png') }).catch((e2) => console.warn('[screenshot] step #s95: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 라인 번호 열
  await test.step('[TMLO:95] YAML 라인 번호 열', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-page-viola-gatewayclass-detail-main')).toContainText('1 2 3', { timeout: 30000 }); }, 3, "[TMLO:95] YAML 라인 번호 열");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s96-failed.png') }).catch((e2) => console.warn('[screenshot] step #s96: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:96] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 상세', { timeout: 30000 }); }, 3, "[TMLO:96] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s97-failed.png') }).catch((e2) => console.warn('[screenshot] step #s97: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // breadcrumb 경로 검증
  await test.step('[TMLO:97] breadcrumb 경로 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('워크플로우/ 네트워크/ 게이트웨이 API/ 게이트웨이 클래스 상세', { timeout: 30000 }); }, 3, "[TMLO:97] breadcrumb 경로 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s98-failed.png') }).catch((e2) => console.warn('[screenshot] step #s98: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `대시보드` 표출
  await test.step('[TMLO:98] LNB 대분류 `대시보드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"대시보드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:98] LNB 대분류 `대시보드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s99-failed.png') }).catch((e2) => console.warn('[screenshot] step #s99: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `기본 설정` 표출
  await test.step('[TMLO:99] LNB 대분류 `기본 설정` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:99] LNB 대분류 `기본 설정` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s100-failed.png') }).catch((e2) => console.warn('[screenshot] step #s100: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `워크플로우` 표출
  await test.step('[TMLO:100] LNB 대분류 `워크플로우` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:100] LNB 대분류 `워크플로우` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s101-failed.png') }).catch((e2) => console.warn('[screenshot] step #s101: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `서비스 카탈로그` 표출
  await test.step('[TMLO:101] LNB 대분류 `서비스 카탈로그` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:101] LNB 대분류 `서비스 카탈로그` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s102-failed.png') }).catch((e2) => console.warn('[screenshot] step #s102: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 대분류 `모니터링` 표출
  await test.step('[TMLO:102] LNB 대분류 `모니터링` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(normalize-space(.),"모니터링")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:102] LNB 대분류 `모니터링` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s103-failed.png') }).catch((e2) => console.warn('[screenshot] step #s103: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크플로우` 확장 상태
  await test.step('[TMLO:103] `워크플로우` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"워크플로우")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:103] `워크플로우` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s104-failed.png') }).catch((e2) => console.warn('[screenshot] step #s104: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `기본 설정` 미확장
  await test.step('[TMLO:104] `기본 설정` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"기본 설정")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:104] `기본 설정` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s105-failed.png') }).catch((e2) => console.warn('[screenshot] step #s105: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `서비스 카탈로그` 미확장
  await test.step('[TMLO:105] `서비스 카탈로그` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"서비스 카탈로그")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:105] `서비스 카탈로그` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s106-failed.png') }).catch((e2) => console.warn('[screenshot] step #s106: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링` 미확장
  await test.step('[TMLO:106] `모니터링` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " menu-first ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][contains(normalize-space(.),"모니터링")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:106] `모니터링` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s107-failed.png') }).catch((e2) => console.warn('[screenshot] step #s107: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `워크로드` 표출
  await test.step('[TMLO:107] LNB 하위 `워크로드` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:107] LNB 하위 `워크로드` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s108-failed.png') }).catch((e2) => console.warn('[screenshot] step #s108: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `네트워크` 표출
  await test.step('[TMLO:108] LNB 하위 `네트워크` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:108] LNB 하위 `네트워크` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s109-failed.png') }).catch((e2) => console.warn('[screenshot] step #s109: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하위 `스토리지` 표출
  await test.step('[TMLO:109] LNB 하위 `스토리지` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:109] LNB 하위 `스토리지` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s110-failed.png') }).catch((e2) => console.warn('[screenshot] step #s110: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `네트워크` 확장 상태
  await test.step('[TMLO:110] `네트워크` 확장 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"네트워크")])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:110] `네트워크` 확장 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s111-failed.png') }).catch((e2) => console.warn('[screenshot] step #s111: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `워크로드` 미확장
  await test.step('[TMLO:111] `워크로드` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"워크로드")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:111] `워크로드` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s112-failed.png') }).catch((e2) => console.warn('[screenshot] step #s112: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `스토리지` 미확장
  await test.step('[TMLO:112] `스토리지` 미확장', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu ")][contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-open ")][not(contains(concat(" ", normalize-space(@class), " "), " menu-first "))]/div[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ")][contains(normalize-space(.),"스토리지")])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:112] `스토리지` 미확장");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s113-failed.png') }).catch((e2) => console.warn('[screenshot] step #s113: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스` 표출
  await test.step('[TMLO:113] LNB 메뉴 `서비스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:113] LNB 메뉴 `서비스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s114-failed.png') }).catch((e2) => console.warn('[screenshot] step #s114: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `인그레스` 표출
  await test.step('[TMLO:114] LNB 메뉴 `인그레스` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="인그레스"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:114] LNB 메뉴 `인그레스` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s115-failed.png') }).catch((e2) => console.warn('[screenshot] step #s115: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `게이트웨이 API` 표출
  await test.step('[TMLO:115] LNB 메뉴 `게이트웨이 API` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:115] LNB 메뉴 `게이트웨이 API` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s116-failed.png') }).catch((e2) => console.warn('[screenshot] step #s116: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `네트워크 폴리시` 표출
  await test.step('[TMLO:116] LNB 메뉴 `네트워크 폴리시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="네트워크 폴리시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:116] LNB 메뉴 `네트워크 폴리시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s117-failed.png') }).catch((e2) => console.warn('[screenshot] step #s117: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 메뉴 `서비스 메시` 표출
  await test.step('[TMLO:117] LNB 메뉴 `서비스 메시` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[@role="menuitem"][normalize-space(.)="서비스 메시"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:117] LNB 메뉴 `서비스 메시` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s118-failed.png') }).catch((e2) => console.warn('[screenshot] step #s118: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `게이트웨이 API` 선택 상태
  await test.step('[TMLO:118] `게이트웨이 API` 선택 상태', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//li[contains(concat(" ", normalize-space(@class), " "), " ant-menu-item-selected ")][normalize-space(.)="게이트웨이 API"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:118] `게이트웨이 API` 선택 상태");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s119-failed.png') }).catch((e2) => console.warn('[screenshot] step #s119: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `알림` 표출
  await test.step('[TMLO:119] LNB 하단 `알림` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*알림\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:119] LNB 하단 `알림` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s120-failed.png') }).catch((e2) => console.warn('[screenshot] step #s120: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 하단 `프로필` 표출
  await test.step('[TMLO:120] LNB 하단 `프로필` 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*프로필\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:120] LNB 하단 `프로필` 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s121-failed.png') }).catch((e2) => console.warn('[screenshot] step #s121: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // LNB 접기 아이콘(first_page) 표출
  await test.step('[TMLO:121] LNB 접기 아이콘(first_page) 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*first_page\.?\s*$/).first()).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:121] LNB 접기 아이콘(first_page) 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s122-failed.png') }).catch((e2) => console.warn('[screenshot] step #s122: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 우상단 클러스터 선택기 표출
  await test.step('[TMLO:122] 우상단 클러스터 선택기 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:122] 우상단 클러스터 선택기 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s123-failed.png') }).catch((e2) => console.warn('[screenshot] step #s123: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 선택기 교체 아이콘(sync_alt)
  await test.step('[TMLO:123] 클러스터 선택기 교체 아이콘(sync_alt)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('.btn-navigator')).toContainText('sync_alt', { timeout: 30000 }); }, 3, "[TMLO:123] 클러스터 선택기 교체 아이콘(sync_alt)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s124-failed.png') }).catch((e2) => console.warn('[screenshot] step #s124: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 모니터링 현황 차트 아이콘(browse_activity)
  await test.step('[TMLO:124] 모니터링 현황 차트 아이콘(browse_activity)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-the-header-toggle-panel"]//*[normalize-space(text())="browse_activity"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:124] 모니터링 현황 차트 아이콘(browse_activity)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s125-failed.png') }).catch((e2) => console.warn('[screenshot] step #s125: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `모니터링 현황` 버튼 라벨
  await test.step('[TMLO:125] `모니터링 현황` 버튼 라벨', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-the-header-toggle-panel')).toContainText('모니터링 현황', { timeout: 30000 }); }, 3, "[TMLO:125] `모니터링 현황` 버튼 라벨");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s126-failed.png') }).catch((e2) => console.warn('[screenshot] step #s126: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: 뒤로가기·타이틀
  await test.step('[TMLO:126] YAML 탭: 뒤로가기·타이틀', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//h1)[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:126] YAML 탭: 뒤로가기·타이틀");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s127-failed.png') }).catch((e2) => console.warn('[screenshot] step #s127: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: 탭 순서
  await test.step('[TMLO:127] YAML 탭: 탭 순서', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"]/following::*[@role="tab"][normalize-space(.)="YAML"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:127] YAML 탭: 탭 순서");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s128-failed.png') }).catch((e2) => console.warn('[screenshot] step #s128: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: `수정` 버튼
  await test.step('[TMLO:128] YAML 탭: `수정` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-detail-button-groups-button')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:128] YAML 탭: `수정` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s129-failed.png') }).catch((e2) => console.warn('[screenshot] step #s129: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: `삭제` 버튼
  await test.step('[TMLO:129] YAML 탭: `삭제` 버튼', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-title"]//button[normalize-space(.)="delete 삭제"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:129] YAML 탭: `삭제` 버튼");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s130-failed.png') }).catch((e2) => console.warn('[screenshot] step #s130: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: 기본 정보 패널(접힘/펼침 아이콘)
  await test.step('[TMLO:130] YAML 탭: 기본 정보 패널(접힘/펼침 아이콘)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@data-testid="adm-page-viola-gatewayclass-detail"]//*[normalize-space(text())="left_panel_close" or normalize-space(text())="left_panel_open"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:130] YAML 탭: 기본 정보 패널(접힘/펼침 아이콘)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s131-failed.png') }).catch((e2) => console.warn('[screenshot] step #s131: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // YAML 탭: `연결 게이트웨이` 섹션 미표출
  await test.step('[TMLO:131] YAML 탭: `연결 게이트웨이` 섹션 미표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await waitForHiddenAssertionReady(page, 15000); await expect(page.locator('xpath=(//*[@data-testid="adm-tab-content-layout-sub-title"][normalize-space(.)="연결 게이트웨이"])[1]')).toBeHidden({ timeout: 15000 }); }, 3, "[TMLO:131] YAML 탭: `연결 게이트웨이` 섹션 미표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s132-failed.png') }).catch((e2) => console.warn('[screenshot] step #s132: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 탭 `세부 정보` 선택
  await test.step('[TMLO:132] 탭 `세부 정보` 선택', async () => {
    try {
      await page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s133-failed.png') }).catch((e2) => console.warn('[screenshot] step #s133: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `세부 정보` 선택 전환
  await test.step('[TMLO:133] `세부 정보` 선택 전환', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator('xpath=(//*[@role="tab"][normalize-space(.)="세부 정보"][@aria-selected="true"])[1]')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:133] `세부 정보` 선택 전환");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s134-failed.png') }).catch((e2) => console.warn('[screenshot] step #s134: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `세부 정보` 고유 정보 전환
  await test.step('[TMLO:134] `세부 정보` 고유 정보 전환', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-gateway-api-gateway-class-resource-connected-gateway-table-table')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:134] `세부 정보` 고유 정보 전환");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s135-failed.png') }).catch((e2) => console.warn('[screenshot] step #s135: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
