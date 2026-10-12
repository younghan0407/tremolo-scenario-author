import { test, expect } from '@playwright/test';
import { resolveRuntimeValue, exportRuntimeValue } from '../../_helpers/dynamicValue';

test('[워크플로우]-[게이트웨이 API]-[게이트웨이 클래스 행 메뉴·삭제]', async ({ page }, testInfo) => {
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
      await (async () => { const __tmloValue = resolveRuntimeValue('qa-trml-{HHMMSS}-gwc'); await page.getByTestId('adm-input-json-name-placeholder').fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('gwc_menu', __tmloValue, { scope: 'runSet', source: { stepId: 's12', title: '이름 입력' } }); })();
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
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').fill(resolveRuntimeValue('{{gwc_menu}}'), { timeout: 15000 });
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
      await runTmloStepWithRetry(async () => { await expect(page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_menu}}")])[1]'))).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:20] 생성 자원 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행 [작업] 더보기 클릭
  await test.step('[TMLO:21] 행 [작업] 더보기 클릭', async () => {
    try {
      await page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(normalize-space(.),"{{gwc_menu}}")]//button[normalize-space(.)="more_horiz"])[1]')).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `수정` 메뉴 항목 표출
  await test.step('[TMLO:22] `수정` 메뉴 항목 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByRole('menuitem', { name: /^\s*수정\.?\s*$/ })).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:22] `수정` 메뉴 항목 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // `삭제` 메뉴 항목 표출
  await test.step('[TMLO:23] `삭제` 메뉴 항목 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByRole('menuitem', { name: /^\s*삭제\.?\s*$/ })).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:23] `삭제` 메뉴 항목 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // [수정] 클릭
  await test.step('[TMLO:24] [수정] 클릭', async () => {
    try {
      await page.getByRole('menuitem', { name: /^\s*수정\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 수정 페이지 이동
  await test.step('[TMLO:25] 게이트웨이 클래스 수정 페이지 이동', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-breadcrumb')).toContainText('게이트웨이 클래스 수정', { timeout: 30000 }); }, 3, "[TMLO:25] 게이트웨이 클래스 수정 페이지 이동");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // /viola/workflow/network/gateway-api 이동
  await test.step('[TMLO:26] /viola/workflow/network/gateway-api 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-2/viola/workflow/network/gateway-api', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 게이트웨이 클래스 탭 클릭
  await test.step('[TMLO:27] 게이트웨이 클래스 탭 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*게이트웨이\s+클래스\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색어 입력
  await test.step('[TMLO:28] 검색어 입력', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').fill(resolveRuntimeValue('{{gwc_menu}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색 실행
  await test.step('[TMLO:29] 검색 실행', async () => {
    try {
      await page.getByTestId('adm-gateway-api-gateway-class-fetch-table-filter-search-input').press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 자원 행 표출
  await test.step('[TMLO:30] 생성 자원 행 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(normalize-space(.),"{{gwc_menu}}")])[1]'))).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:30] 생성 자원 행 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 행 [작업] 더보기 클릭
  await test.step('[TMLO:31] 행 [작업] 더보기 클릭', async () => {
    try {
      await page.locator(resolveRuntimeValue('xpath=(//*[@data-testid="adm-gateway-api-gateway-class-fetch-table-table"]//tbody//tr[contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(normalize-space(.),"{{gwc_menu}}")]//button[normalize-space(.)="more_horiz"])[1]')).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // [삭제] 클릭(팝업 열기)
  await test.step('[TMLO:32] [삭제] 클릭(팝업 열기)', async () => {
    try {
      await page.getByRole('menuitem', { name: /^\s*삭제\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 삭제 팝업 표출
  await test.step('[TMLO:33] 삭제 팝업 표출', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByTestId('adm-check-modal-content')).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:33] 삭제 팝업 표출");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인했습니다. 체크
  await test.step('[TMLO:34] 확인했습니다. 체크', async () => {
    try {
      await page.getByRole('checkbox', { name: /^\s*확인했습니다\.\s*$/ }).check({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 팝업 [삭제] 클릭
  await test.step('[TMLO:35] 팝업 [삭제] 클릭', async () => {
    try {
      await page.getByTestId('adm-check-modal-confirm').click({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 삭제 후 목록 미표출(검색 결과 없음)
  await test.step('[TMLO:36] 삭제 후 목록 미표출(검색 결과 없음)', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*검색어나\s+검색\s+필터를\s+변경해\s+주세요\.\s*$/)).toBeVisible({ timeout: 30000 }); }, 3, "[TMLO:36] 삭제 후 목록 미표출(검색 결과 없음)");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
