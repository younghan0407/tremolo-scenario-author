import { test, expect } from '@playwright/test';
import { selectAntdOption } from '../../_helpers/antdSelect';
import { resolveRuntimeValue, exportRuntimeValue } from '../../_helpers/dynamicValue';

test('[CICD]-[저장소 관리]-[소스코드저장소, 이미지저장소]-[등록]', async ({ page }, testInfo) => {
  // https://306tst.bf.okestro.cloud/login 이동
  await test.step('[TMLO:1] https://306tst.bf.okestro.cloud/login 이동', async () => {
    try {
      await page.goto('https://306tst.bf.okestro.cloud/login', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s1-1784103406385-0-0-1784106280698-0-0-failed.png') }).catch((e2) => console.warn('[screenshot] step #s1-1784103406385-0-0-1784106280698-0-0: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 아이디 클릭
  await test.step('[TMLO:2] * 아이디 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+아이디\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s2-1784103406385-0-1-1784106280698-0-1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s2-1784103406385-0-1-1784106280698-0-1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 아이디 입력
  await test.step('[TMLO:3] * 아이디 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+아이디\.?\s*$/ }).fill('<ID>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-1784103406385-0-2-1784106280698-0-2-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3-1784103406385-0-2-1784106280698-0-2: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 비밀번호 입력
  await test.step('[TMLO:4] * 비밀번호 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+비밀번호\.?\s*$/ }).fill('<PASSWORD>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-1784103406385-0-3-1784106280698-0-3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8-1784103406385-0-3-1784106280698-0-3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 로그인 클릭
  await test.step('[TMLO:5] 로그인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s9-1784103406385-0-4-1784106280698-0-4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s9-1784103406385-0-4-1784106280698-0-4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 관리 클릭
  await test.step('[TMLO:6] 저장소 관리 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*저장소\s+관리\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-1784106280698-0-5-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10-1784106280698-0-5: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 소스 코드 저장소 클릭
  await test.step('[TMLO:7] 소스 코드 저장소 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*소스\s+코드\s+저장소\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-1784106280698-0-6-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11-1784106280698-0-6: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // add 등록 클릭
  await test.step('[TMLO:8] add 등록 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*add\s+등록\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*add\s+등록\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-1784106280698-0-7-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12-1784106280698-0-7: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 클릭
  await test.step('[TMLO:9] 이름을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-1784106280698-0-8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13-1784106280698-0-8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 입력
  await test.step('[TMLO:10] 이름을 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-coderegistry{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('registry_name', __tmloValue, { scope: 'runSet', source: { stepId: 's14-1784106280698-0-9', title: '이름을 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-1784106280698-0-9-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14-1784106280698-0-9: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 중복확인 클릭
  await test.step('[TMLO:11] 중복확인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-1784106280698-0-10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15-1784106280698-0-10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 유형: Gitea 선택
  await test.step('[TMLO:12] 저장소 유형: Gitea 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '저장소 유형', option: 'Gitea', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-1784106280698-0-11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16-1784106280698-0-11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // http 클릭
  await test.step('[TMLO:13] http 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*http\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-1784106280698-0-12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17-1784106280698-0-12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 도메인을 입력해 주세요 클릭
  await test.step('[TMLO:14] 저장소 도메인을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+도메인을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-1784106280698-0-13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18-1784106280698-0-13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 도메인을 입력해 주세요 입력
  await test.step('[TMLO:15] 저장소 도메인을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+도메인을\s+입력해\s+주세요\.?\s*$/ }).fill('gitea.example.com:30800', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-1784106280698-0-14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19-1784106280698-0-14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 레파지토리 경로를 입력해 주세요 클릭
  await test.step('[TMLO:16] 레파지토리 경로를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*레파지토리\s+경로를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-1784106280698-0-15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20-1784106280698-0-15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 레파지토리 경로를 입력해 주세요 입력
  await test.step('[TMLO:17] 레파지토리 경로를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*레파지토리\s+경로를\s+입력해\s+주세요\.?\s*$/ }).fill('gitea_admin/build_go', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-1784106280698-0-16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21-1784106280698-0-16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 연결 토큰을 입력해 주세요 클릭
  await test.step('[TMLO:18] 연결 토큰을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*연결\s+토큰을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-1784106280698-0-17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22-1784106280698-0-17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 연결 토큰을 입력해 주세요 입력
  await test.step('[TMLO:19] 연결 토큰을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*연결\s+토큰을\s+입력해\s+주세요\.?\s*$/ }).fill('0af6fb7519709940505d9b2c4d6a16ed82baf6ce', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-1784106280698-0-18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23-1784106280698-0-18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 테스트 클릭
  await test.step('[TMLO:20] 저장소 연결 테스트 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*저장소\s+연결\s+테스트\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*저장소\s+연결\s+테스트\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-1784106280698-0-19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24-1784106280698-0-19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // form 텍스트 포함 검증
  await test.step('[TMLO:21] form 텍스트 포함 검증', async () => {
    try {
      await expect(page.locator('form')).toContainText('연결 테스트에 성공했습니다.', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-1784106280698-0-20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25-1784106280698-0-20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 등록 클릭
  await test.step('[TMLO:22] 등록 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*등록\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*등록\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-1784106280698-0-21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26-1784106280698-0-21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:23] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-1784106280698-0-22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27-1784106280698-0-22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:24] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill(resolveRuntimeValue('{{registry_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-1784106280698-0-23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28-1784106280698-0-23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:25] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-1784106280698-0-24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29-1784106280698-0-24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이미지 저장소 클릭
  await test.step('[TMLO:26] 이미지 저장소 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*이미지\s+저장소\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-1784106283727-0-6-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11-1784106283727-0-6: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // add 등록 클릭
  await test.step('[TMLO:27] add 등록 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*add\s+등록\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*add\s+등록\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-1784106283727-0-7-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12-1784106283727-0-7: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // biz 클릭
  await test.step('[TMLO:28] biz 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*biz\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-1784106283727-0-8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13-1784106283727-0-8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // biz 클릭
  await test.step('[TMLO:29] biz 클릭', async () => {
    try {
      await page.locator('xpath=(//*[contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown ") and not(contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown-hidden "))]//*[(@role="option" or contains(concat(" ", normalize-space(@class), " "), " ant-select-item-option ")) and (translate(normalize-space(.), \' \', \'\')=\'biz\' or .//*[translate(normalize-space(.), \' \', \'\')=\'biz\'])])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-1784106283727-0-9-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14-1784106283727-0-9: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 클릭
  await test.step('[TMLO:30] 이름을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-1784106283727-0-10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15-1784106283727-0-10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 입력
  await test.step('[TMLO:31] 이름을 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-imageregistry{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('imageregistry_name', __tmloValue, { scope: 'runSet', source: { stepId: 's16-1784106283727-0-11', title: '이름을 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-1784106283727-0-11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16-1784106283727-0-11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 중복확인 클릭
  await test.step('[TMLO:32] 중복확인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-1784106283727-0-12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17-1784106283727-0-12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 도메인을 입력해 주세요 클릭
  await test.step('[TMLO:33] 저장소 도메인을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+도메인을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-1784106283727-0-13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18-1784106283727-0-13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // https 클릭
  await test.step('[TMLO:34] https 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*https\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-1784106283727-0-14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19-1784106283727-0-14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 도메인을 입력해 주세요 입력
  await test.step('[TMLO:35] 저장소 도메인을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+도메인을\s+입력해\s+주세요\.?\s*$/ }).fill('306tst.harbor.bf.okestro.cloud', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-1784106283727-0-15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29-1784106283727-0-15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 사용자를 입력해 주세요 클릭
  await test.step('[TMLO:36] 저장소 연결 사용자를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+연결\s+사용자를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-1784106283727-0-16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30-1784106283727-0-16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 사용자를 입력해 주세요 입력
  await test.step('[TMLO:37] 저장소 연결 사용자를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+연결\s+사용자를\s+입력해\s+주세요\.?\s*$/ }).fill('admin', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-1784106283727-0-17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31-1784106283727-0-17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 비밀번호를 입력해 주세요 클릭
  await test.step('[TMLO:38] 저장소 연결 비밀번호를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+연결\s+비밀번호를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-1784106283727-0-18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32-1784106283727-0-18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 비밀번호를 입력해 주세요 입력
  await test.step('[TMLO:39] 저장소 연결 비밀번호를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*저장소\s+연결\s+비밀번호를\s+입력해\s+주세요\.?\s*$/ }).fill('Cloud1234', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-1784106283727-0-19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36-1784106283727-0-19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 저장소 연결 테스트 클릭
  await test.step('[TMLO:40] 저장소 연결 테스트 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*저장소\s+연결\s+테스트\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*저장소\s+연결\s+테스트\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-1784106283727-0-20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37-1784106283727-0-20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // form 텍스트 포함 검증
  await test.step('[TMLO:41] form 텍스트 포함 검증', async () => {
    try {
      await expect(page.locator('form')).toContainText('연결 테스트에 성공했습니다.', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-1784106283727-0-21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38-1784106283727-0-21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 등록 클릭
  await test.step('[TMLO:42] 등록 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*등록\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*등록\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-1784106283727-0-22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39-1784106283727-0-22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:43] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-1784106283727-0-23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40-1784106283727-0-23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:44] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill(resolveRuntimeValue('{{imageregistry_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-1784106283727-0-24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41-1784106283727-0-24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:45] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-1784106283727-0-25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42-1784106283727-0-25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
