import { test, expect } from '@playwright/test';
import { selectAntdOption } from '../../_helpers/antdSelect';
import { selectAntdTableRow } from '../../_helpers/antdTableRow';
import { fillCodeMirror } from '../../_helpers/codeMirror';

test('instance_create', async ({ page }, testInfo) => {
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

  // https://example.invalid/env-1/login 이동
  await test.step('[TMLO:1] https://example.invalid/env-1/login 이동', async () => {
    try {
      await page.goto('https://example.invalid/env-1/login', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요 입력
  await test.step('[TMLO:2] 아이디를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.?\s*$/ }).fill('<ID>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s2-failed.png') }).catch((e2) => console.warn('[screenshot] step #s2: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 아이디를 입력해 주세요 키 누르기
  await test.step('[TMLO:3] 아이디를 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*아이디를\s+입력해\s+주세요\.?\s*$/ }).press('Tab', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 비밀번호를 입력해 주세요 입력
  await test.step('[TMLO:4] 비밀번호를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.?\s*$/ }).fill('<PASSWORD>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 비밀번호를 입력해 주세요 키 누르기
  await test.step('[TMLO:5] 비밀번호를 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
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

  // add 생성 클릭
  await test.step('[TMLO:10] add 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*add\s+생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*add\s+생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 클릭
  await test.step('[TMLO:11] 이름을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 입력
  await test.step('[TMLO:12] 이름을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).fill('gkgksjdje', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 자동 지정 클릭
  await test.step('[TMLO:13] 자동 지정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*자동\s+지정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // nova 클릭
  await test.step('[TMLO:14] nova 클릭', async () => {
    try {
      await page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown ") and not(contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown-hidden "))]//*[(@role="option" or contains(concat(" ", normalize-space(@class), " "), " ant-select-item-option ")) and (translate(normalize-space(.), \' \', \'\')=\'nova\' or .//*[translate(normalize-space(.), \' \', \'\')=\'nova\'])])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // nova 클릭
  await test.step('[TMLO:15] nova 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*nova\.?\s*$/).nth(1); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // nova 클릭
  await test.step('[TMLO:16] nova 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*nova\.?\s*$/).nth(1); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:17] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:18] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:19] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().fill('hh', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:20] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: hh-ca-image ACTIVE
  await test.step('[TMLO:21] AntD 표 행 선택: hh-ca-image ACTIVE', async () => {
    try {
      await selectAntdTableRow(page, { match: ['hh-ca-image ACTIVE'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 볼륨을 입력해 주세요 클릭
  await test.step('[TMLO:22] 볼륨을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*볼륨을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 볼륨을 입력해 주세요 입력
  await test.step('[TMLO:23] 볼륨을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*볼륨을\s+입력해\s+주세요\.?\s*$/ }).fill('045', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스와 일괄 삭제: __DEFAULT__ 선택
  await test.step('[TMLO:24] 인스턴스와 일괄 삭제: __DEFAULT__ 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'auto', root: page.getByText(/^\s*인스턴스와\s+일괄\s+삭제\.?\s*$/), option: '__DEFAULT__', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // js-type 클릭
  await test.step('[TMLO:25] js-type 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*js-type\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: 4C4M
  await test.step('[TMLO:26] AntD 표 행 선택: 4C4M', async () => {
    try {
      await selectAntdTableRow(page, { match: ['4C4M'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:27] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 고정 IP 추가 클릭
  await test.step('[TMLO:28] 고정 IP 추가 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*고정\s+IP\s+추가\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*고정\s+IP\s+추가\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:29] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:30] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('hh', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:31] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: hh-ca-seg ACTIVE
  await test.step('[TMLO:32] AntD 표 행 선택: hh-ca-seg ACTIVE', async () => {
    try {
      await selectAntdTableRow(page, { match: ['hh-ca-seg ACTIVE'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 추가 클릭
  await test.step('[TMLO:33] 추가 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'세그먼트설정warningIP할당관련안내사항세그먼트내자동할당:세그먼트내자동할당으로만들어진인스턴스삭제시포트도함께삭제됩니다.서브넷내수동할당:세그먼트내수동할당으로만들어진인스턴스삭제시포트도함께삭제됩니다.포트지정:포트지정으로만들어진인스턴스삭제시인스턴스만삭제됩니다.close\')]//button[translate(normalize-space(.), \' \', \'\')=\'추가\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:34] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // keyboard_arrow_right 클릭
  await test.step('[TMLO:35] keyboard_arrow_right 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*keyboard_arrow_right\.?\s*$/ }).nth(1).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*keyboard_arrow_right\.?\s*$/ }).nth(1).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: hh-ky 16:09:38:1c:
  await test.step('[TMLO:36] AntD 표 행 선택: hh-ky 16:09:38:1c:', async () => {
    try {
      await selectAntdTableRow(page, { match: ['hh-ky 16:09:38:1c:'], control: 'checkbox', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:37] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 사용자 정의 스크립트를 입력해 주세요. 클릭
  await test.step('[TMLO:38] 사용자 정의 스크립트를 입력해 주세요. 클릭', async () => {
    try {
      await page.locator('xpath=//div[contains(concat(" ", normalize-space(@class), " "), " CodeMirror ")][.//*[contains(concat(" ", normalize-space(@class), " "), " CodeMirror-placeholder ")][translate(normalize-space(.), \' \', \'\')=\'사용자정의스크립트를입력해주세요.\']]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // CodeMirror #1 입력
  await test.step('[TMLO:39] CodeMirror #1 입력', async () => {
    try {
      await fillCodeMirror(page.locator('xpath=(//div[contains(concat(" ", normalize-space(@class), " "), " CodeMirror ")])[1]'), '#!/bin/bash\necho "root:cloud1234" | chpasswd\nsystemctl restart sshd', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 클릭
  await test.step('[TMLO:40] 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:41] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:42] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('gkgksjdje', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:43] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // BUILD 표시 검증
  await test.step('[TMLO:44] BUILD 표시 검증', async () => {
    try {
      await expect(page.getByText(/^\s*BUILD\.?\s*$/)).toBeVisible({ timeout: 150000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // ACTIVE 표시 검증
  await test.step('[TMLO:45] ACTIVE 표시 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*ACTIVE\.?\s*$/)).toBeVisible({ timeout: 150000 }); }, 3, "[TMLO:45] ACTIVE 표시 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:46] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'gkgksjdje\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인 클릭
  await test.step('[TMLO:47] 확인 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'알림\')]//button[translate(normalize-space(.), \' \', \'\')=\'종료\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // SHUTOFF 표시 검증
  await test.step('[TMLO:48] SHUTOFF 표시 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*SHUTOFF\.?\s*$/)).toBeVisible({ timeout: 150000 }); }, 3, "[TMLO:48] SHUTOFF 표시 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:49] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'gkgksjdje\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인했습니다. 선택
  await test.step('[TMLO:50] 확인했습니다. 선택', async () => {
    try {
      await page.getByRole('checkbox', { name: /^\s*확인했습니다\.\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 삭제 클릭
  await test.step('[TMLO:51] 삭제 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'알림\')]//button[translate(normalize-space(.), \' \', \'\')=\'삭제\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스(gkgksjdje) 삭제가 완료되었습니다 표시 검증
  await test.step('[TMLO:52] 인스턴스(gkgksjdje) 삭제가 완료되었습니다 표시 검증', async () => {
    try {
      await runTmloStepWithRetry(async () => { await expect(page.getByText(/^\s*인스턴스\(gkgksjdje\)\s+삭제가\s+완료되었습니다\.?\s*$/)).toBeVisible({ timeout: 150000 }); }, 3, "[TMLO:52] 인스턴스(gkgksjdje) 삭제가 완료되었습니다 표시 검증");
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
