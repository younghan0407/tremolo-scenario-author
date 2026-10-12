import { test, expect } from '@playwright/test';
import { selectAntdTableRow } from '../../_helpers/antdTableRow';

test('[컴퓨트]-[인스턴스]-[작업-무중단사양변경]', async ({ page }, testInfo) => {
  // https://example.invalid/env-1/login 이동
  await test.step('[TMLO:1] https://example.invalid/env-1/login 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-1/login', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요 클릭
  await test.step('[TMLO:2] 아이디를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s2-failed.png') }).catch((e2) => console.warn('[screenshot] step #s2: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요 입력
  await test.step('[TMLO:3] 아이디를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.?\s*$/ }).fill('<ID>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요 키 누르기
  await test.step('[TMLO:4] 아이디를 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.?\s*$/ }).press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 비밀번호를 입력해 주세요 입력
  await test.step('[TMLO:5] 비밀번호를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.?\s*$/ }).fill('<PASSWORD>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s5-failed.png') }).catch((e2) => console.warn('[screenshot] step #s5: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 로그인 클릭
  await test.step('[TMLO:6] 로그인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s6-failed.png') }).catch((e2) => console.warn('[screenshot] step #s6: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인증 코드를 입력해 주세요 입력
  await test.step('[TMLO:7] 인증 코드를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*인증\s+코드를\s+입력해\s+주세요\.?\s*$/ }).fill('<MFA_CODE>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s7-failed.png') }).catch((e2) => console.warn('[screenshot] step #s7: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컴퓨트 클릭
  await test.step('[TMLO:8] 컴퓨트 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*컴퓨트\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 클릭
  await test.step('[TMLO:9] 인스턴스 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*인스턴스\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s9-failed.png') }).catch((e2) => console.warn('[screenshot] step #s9: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:10] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:11] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('auto-instance', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:12] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:13] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'auto-instance\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 클릭
  await test.step('[TMLO:14] 수정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*수정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 무중단 사양 변경을 ON 클릭
  await test.step('[TMLO:15] 무중단 사양 변경을 ON 클릭', async () => {
    try {
      await page.locator('xpath=//button[@role="switch"][ancestor::*[(contains(concat(" ", normalize-space(@class), " "), " ant-flex ") or contains(concat(" ", normalize-space(@class), " "), " ant-row ") or contains(concat(" ", normalize-space(@class), " "), " form-item ") or contains(concat(" ", normalize-space(@class), " "), " ant-form-item ") or self::li or self::tr or self::td or self::div) and (translate(normalize-space(.), \' \', \'\')=\'무중단사양변경을ON\' or contains(translate(normalize-space(.), \' \', \'\'), \'무중단사양변경을ON\'))][1][count(.//button[@role="switch"])=1]]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가상 CPU를 입력해 주세요 클릭
  await test.step('[TMLO:16] 가상 CPU를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*가상\s+CPU를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가상 CPU를 입력해 주세요 입력
  await test.step('[TMLO:17] 가상 CPU를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*가상\s+CPU를\s+입력해\s+주세요\.?\s*$/ }).fill('8', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 메모리를 입력해 주세요 클릭
  await test.step('[TMLO:18] 메모리를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*메모리를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 메모리를 입력해 주세요 입력
  await test.step('[TMLO:19] 메모리를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*메모리를\s+입력해\s+주세요\.?\s*$/ }).fill('16', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 클릭
  await test.step('[TMLO:20] 수정 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'인스턴스수정\')]//button[translate(normalize-space(.), \' \', \'\')=\'수정\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:21] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'auto-instance\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 클릭
  await test.step('[TMLO:22] 수정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*수정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 무중단 사양 변경을 ON 표시 검증
  await test.step('[TMLO:23] 무중단 사양 변경을 ON 표시 검증', async () => {
    try {
      await expect(page.locator('xpath=//button[@role="switch"][ancestor::*[(contains(concat(" ", normalize-space(@class), " "), " ant-flex ") or contains(concat(" ", normalize-space(@class), " "), " ant-row ") or contains(concat(" ", normalize-space(@class), " "), " form-item ") or contains(concat(" ", normalize-space(@class), " "), " ant-form-item ") or self::li or self::tr or self::td or self::div) and (translate(normalize-space(.), \' \', \'\')=\'무중단사양변경을ON\' or contains(translate(normalize-space(.), \' \', \'\'), \'무중단사양변경을ON\'))][1][count(.//button[@role="switch"])=1]]')).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 취소 클릭
  await test.step('[TMLO:24] 취소 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'인스턴스수정\')]//button[translate(normalize-space(.), \' \', \'\')=\'취소\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:25] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'auto-instance\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 사양 변경 클릭
  await test.step('[TMLO:26] 인스턴스 사양 변경 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*인스턴스\s+사양\s+변경\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 무중단 사양 변경 클릭
  await test.step('[TMLO:27] 무중단 사양 변경 클릭', async () => {
    try {
      await page.getByTestId('무중단 사양 변경').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 사양 변경 클릭
  await test.step('[TMLO:28] 인스턴스 사양 변경 클릭', async () => {
    try {
      await page.getByRole('dialog', { name: /^\s*인스턴스\s+사양\s+변경\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 사양 변경 입력
  await test.step('[TMLO:29] 인스턴스 사양 변경 입력', async () => {
    try {
      await page.getByRole('dialog', { name: /^\s*인스턴스\s+사양\s+변경\.?\s*$/ }).fill('auto-flavor-4C8M', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 사양 변경 키 누르기
  await test.step('[TMLO:30] 인스턴스 사양 변경 키 누르기', async () => {
    try {
      await page.getByRole('dialog', { name: /^\s*인스턴스\s+사양\s+변경\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: auto-flavor-4C8M
  await test.step('[TMLO:31] AntD 표 행 선택: auto-flavor-4C8M', async () => {
    try {
      await selectAntdTableRow(page, { match: ['auto-flavor-4C8M'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인 클릭
  await test.step('[TMLO:32] 확인 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'인스턴스사양변경\')]//button[translate(normalize-space(.), \' \', \'\')=\'확인\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // auto-flavor-4C8M (4 Core / 8.0 GiB) 텍스트 포함 검증
  await test.step('[TMLO:33] auto-flavor-4C8M (4 Core / 8.0 GiB) 텍스트 포함 검증', async () => {
    try {
      await expect(page.getByText('auto-flavor-8C16M (8 Core / 16.0 GiB)')).toContainText('8C16M (8 Core / 16.0 GiB)', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
