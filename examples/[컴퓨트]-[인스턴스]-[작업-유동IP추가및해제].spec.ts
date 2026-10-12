import { test, expect } from '@playwright/test';
import { selectAntdOption } from '../../_helpers/antdSelect';

test('[컴퓨트]-[인스턴스]-[작업-유동IP추가및해제]', async ({ page }, testInfo) => {
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

  // VPC 클릭
  await test.step('[TMLO:8] VPC 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*VPC\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP 클릭
  await test.step('[TMLO:9] 유동 IP 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*유동\s+IP\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
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

  // networkId: 10.255.42.0/24 선택
  await test.step('[TMLO:11] networkId: 10.255.42.0/24 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'auto', root: page.locator('#networkId'), option: '10.255.42.0/24', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // subnetId 클릭
  await test.step('[TMLO:12] subnetId 클릭', async () => {
    try {
      await page.locator('#subnetId').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // #subnetId: 10.255.42.0/24 선택
  await test.step('[TMLO:13] #subnetId: 10.255.42.0/24 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'auto', root: page.locator('#subnetId'), option: '10.255.42.0/24', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP를 입력해 주세요 클릭
  await test.step('[TMLO:14] 유동 IP를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*유동\s+IP를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-1783922397166-0-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13-1783922397166-0: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP를 입력해 주세요 입력
  await test.step('[TMLO:15] 유동 IP를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*유동\s+IP를\s+입력해\s+주세요\.?\s*$/ }).fill('10.255.42.118', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-1783922397166-1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14-1783922397166-1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 클릭
  await test.step('[TMLO:16] 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컴퓨트 클릭
  await test.step('[TMLO:17] 컴퓨트 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*컴퓨트\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인스턴스 클릭
  await test.step('[TMLO:18] 인스턴스 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*인스턴스\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:19] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:20] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('auto-instance', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:21] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // more_horiz 클릭
  await test.step('[TMLO:22] more_horiz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'auto-instance\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@aria-label), \' \', \'\')=\'more_horiz\' or translate(normalize-space(@title), \' \', \'\')=\'more_horiz\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP 연동 클릭
  await test.step('[TMLO:23] 유동 IP 연동 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*유동\s+IP\s+연동\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP: 10.255.42.171 선택
  await test.step('[TMLO:24] 유동 IP: 10.255.42.171 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '유동 IP', option: '10.255.42.118', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 포트: 46f0b99e-bc97-4443-a2c6-efe1e19999a6 (192.168.14.41 ) 선택
  await test.step('[TMLO:25] 포트: 46f0b99e-bc97-4443-a2c6-efe1e19999a6 (192.168.14.41 ) 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '포트', option: '46f0b99e-bc97-4443-a2c6-efe1e19999a6 (192.168.14.41 )', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인 클릭
  await test.step('[TMLO:26] 확인 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'유동IP연결\')]//button[translate(normalize-space(.), \' \', \'\')=\'확인\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // auto-instance 클릭
  await test.step('[TMLO:27] auto-instance 클릭', async () => {
    try {
      await page.locator('xpath=(//*[self::tr or @role="row" or @data-row-key or contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")][contains(translate(normalize-space(.), \' \', \'\'), \'auto-instance\')]//*[self::button or @role="button"][translate(normalize-space(.), \' \', \'\')=\'auto-instance\' or translate(normalize-space(@aria-label), \' \', \'\')=\'auto-instance\' or translate(normalize-space(@title), \' \', \'\')=\'auto-instance\'])[1]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 유동 IP 클릭
  await test.step('[TMLO:28] 유동 IP 클릭', async () => {
    try {
      await page.getByRole('tab', { name: /^\s*유동\s+IP\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // ⟦tmlo-table-action⟧ {"row":" 클릭
  await test.step('[TMLO:29] ⟦tmlo-table-action⟧ {"row":" 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*⟦tmlo-table-action⟧\s+\{"row":"\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*⟦tmlo-table-action⟧\s+\{"row":"\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-1783924107309-0-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12-1783924107309-0: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 해제 클릭
  await test.step('[TMLO:30] 해제 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*해제\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 해제 클릭
  await test.step('[TMLO:31] 해제 클릭', async () => {
    try {
      await page.locator('xpath=(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'유동IP해제\')]//button[translate(normalize-space(.), \' \', \'\')=\'해제\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // info 데이터가 없습니다.대상을 추가하거나 다시 확인해 주세요. 클릭
  await test.step('[TMLO:32] info 데이터가 없습니다.대상을 추가하거나 다시 확인해 주세요. 클릭', async () => {
    try {
      await page.locator('xpath=//div[translate(normalize-space(.), \' \', \'\')=\'info데이터가없습니다.대상을추가하거나다시확인해주세요.\']').nth(1).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
