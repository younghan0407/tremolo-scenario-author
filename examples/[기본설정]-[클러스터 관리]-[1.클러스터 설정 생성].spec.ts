import { test, expect } from '@playwright/test';
import { selectAntdOption } from '../../_helpers/antdSelect';
import { selectAntdTableRow } from '../../_helpers/antdTableRow';

test('[기본설정]-[클러스터 관리]-[1.클러스터 설정 생성]', async ({ page }, testInfo) => {
  // @block-start id=b1783676119776 [찐최종]_로그인
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

  // 비밀번호를 입력해 주세요 입력
  await test.step('[TMLO:3] 비밀번호를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*비밀번호를\s+입력해\s+주세요\.?\s*$/ }).fill('<PASSWORD>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 로그인 클릭
  await test.step('[TMLO:4] 로그인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인증 코드를 입력해 주세요 클릭
  await test.step('[TMLO:5] 인증 코드를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*인증\s+코드를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s5-failed.png') }).catch((e2) => console.warn('[screenshot] step #s5: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 인증 코드를 입력해 주세요 입력
  await test.step('[TMLO:6] 인증 코드를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*인증\s+코드를\s+입력해\s+주세요\.?\s*$/ }).fill('<MFA_CODE>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s6-failed.png') }).catch((e2) => console.warn('[screenshot] step #s6: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1783932082914 클러스터 설정 메뉴 이동
  // 기본 설정 클릭
  await test.step('[TMLO:7] 기본 설정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*기본\s+설정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s7-failed.png') }).catch((e2) => console.warn('[screenshot] step #s7: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 관리 클릭
  await test.step('[TMLO:8] 클러스터 관리 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*클러스터\s+관리\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 클러스터 설정 클릭
  await test.step('[TMLO:9] 클러스터 설정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*클러스터\s+설정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s9-failed.png') }).catch((e2) => console.warn('[screenshot] step #s9: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
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
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).fill('auto-cluster', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 중복확인 클릭
  await test.step('[TMLO:13] 중복확인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // ant-select-selector: 1.31.13 선택
  await test.step('[TMLO:14] ant-select-selector: 1.31.13 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'auto', root: page.locator('.ant-select-selector').first(), option: '1.31.13', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // ant-row: CONTRABASS 선택
  await test.step('[TMLO:15] ant-row: CONTRABASS 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'auto', root: page.locator('div:nth-child(2) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-spin-nested-loading > .ant-spin-container > .ant-select > .ant-select-selector'), option: 'CONTRABASS', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 프로젝트: PQA-VIOLA 선택
  await test.step('[TMLO:16] 프로젝트: PQA-VIOLA 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '프로젝트', option: 'PQA-VIOLA', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 가용성 존: nova 선택
  await test.step('[TMLO:17] 가용성 존: nova 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '가용성 존', option: 'nova', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // PQA-VIOLA: nova 선택
  await test.step('[TMLO:18] PQA-VIOLA: nova 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: 'PQA-VIOLA', option: 'nova', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:19] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // OS 이미지: viola_ubuntu24.04 선택
  await test.step('[TMLO:20] OS 이미지: viola_ubuntu24.04 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: 'OS 이미지', option: 'viola_ubuntu24.04', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * ID 클릭
  await test.step('[TMLO:21] * ID 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+ID\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * ID 입력
  await test.step('[TMLO:22] * ID 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+ID\.?\s*$/ }).fill('ubuntu', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 비밀번호 클릭
  await test.step('[TMLO:23] * 비밀번호 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+비밀번호\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 비밀번호 입력
  await test.step('[TMLO:24] * 비밀번호 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+비밀번호\.?\s*$/ }).fill('Cloud1234', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤 플레인 수를 입력해 주세요 클릭
  await test.step('[TMLO:25] 컨트롤 플레인 수를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*컨트롤\s+플레인\s+수를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 컨트롤 플레인 수를 입력해 주세요 입력
  await test.step('[TMLO:26] 컨트롤 플레인 수를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*컨트롤\s+플레인\s+수를\s+입력해\s+주세요\.?\s*$/ }).fill('1', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:27] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByPlaceholder(/^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/).first().fill('auto-viola-4C8M', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:28] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByPlaceholder(/^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/).first().press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: auto-viola-4C8M
  await test.step('[TMLO:29] AntD 표 행 선택: auto-viola-4C8M', async () => {
    try {
      await selectAntdTableRow(page, { match: ['auto-viola-4C8M'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 워커 노드 수를 입력해 주세요 입력
  await test.step('[TMLO:30] 워커 노드 수를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('spinbutton', { name: /^\s*워커\s+노드\s+수를\s+입력해\s+주세요\.?\s*$/ }).fill('1', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:31] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).nth(1).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:32] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByPlaceholder(/^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/).nth(1).fill('auto-viola-8C16M', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:33] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByPlaceholder(/^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/).nth(1).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: auto-viola-8C16M
  await test.step('[TMLO:34] AntD 표 행 선택: auto-viola-8C16M', async () => {
    try {
      await selectAntdTableRow(page, { match: ['auto-viola-8C16M'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // HAProxy 인스턴스를 별도로 구성하여, 범용적으로 활용할 수 있는 로드밸런서입니다. 클릭
  await test.step('[TMLO:35] HAProxy 인스턴스를 별도로 구성하여, 범용적으로 활용할 수 있는 로드밸런서입니다. 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*HAProxy\s+인스턴스를\s+별도로\s+구성하여,\s+범용적으로\s+활용할\s+수\s+있는\s+로드밸런서입니다\.\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 다음 클릭
  await test.step('[TMLO:36] 다음 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*다음\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-start id=b1783501747382 세그먼트 선택
  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:37] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:38] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('10.255.43.0/24', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:39] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: 10.255.43.0/24
  await test.step('[TMLO:40] AntD 표 행 선택: 10.255.43.0/24', async () => {
    try {
      await selectAntdTableRow(page, { match: ['10.255.43.0/24'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // form_item_networkCidr 클릭
  await test.step('[TMLO:41] form_item_networkCidr 클릭', async () => {
    try {
      await page.locator('#form_item_networkCidr').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // form_item_networkCidr 입력
  await test.step('[TMLO:42] form_item_networkCidr 입력', async () => {
    try {
      await page.locator('#form_item_networkCidr').fill('10.10.10.0', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // form_item_podCidr 클릭
  await test.step('[TMLO:43] form_item_podCidr 클릭', async () => {
    try {
      await page.locator('#form_item_podCidr').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // form_item_podCidr 입력
  await test.step('[TMLO:44] form_item_podCidr 입력', async () => {
    try {
      await page.locator('#form_item_podCidr').fill('20.20.0.0', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // DNS 서버 주소를 입력해 주세요 클릭
  await test.step('[TMLO:45] DNS 서버 주소를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*DNS\s+서버\s+주소를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // DNS 서버 주소를 입력해 주세요 입력
  await test.step('[TMLO:46] DNS 서버 주소를 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*DNS\s+서버\s+주소를\s+입력해\s+주세요\.?\s*$/ }).fill('8.8.8.8', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-start id=b1783502362752 생성버튼
  // 생성 클릭
  await test.step('[TMLO:47] 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:48] element 클릭', async () => {
    try {
      await page.locator('(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'알림\')]//button[translate(normalize-space(.), \' \', \'\')=\'생성\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1783916848694 네임스페이스1
  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:49] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 999000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:50] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill('auto-cluster', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:51] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1783503664038 생성확인
  // auto-cluster 클릭
  await test.step('[TMLO:52] auto-cluster 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*auto-cluster\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*auto-cluster\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 작업 현황 클릭
  await test.step('[TMLO:53] 작업 현황 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*작업\s+현황\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1783931672535 클러스터 생성 텍스트
  // INPROGRESS 표시 검증
  await test.step('[TMLO:54] INPROGRESS 표시 검증', async () => {
    try {
      await expect(page.getByText(/^\s*INPROGRESS\.?\s*$/)).toBeVisible({ timeout: 100000000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // COMPLETED 표시 검증
  await test.step('[TMLO:55] COMPLETED 표시 검증', async () => {
    try {
      await expect(page.getByText(/^\s*COMPLETED\.?\s*$/)).toBeVisible({ timeout: 1000000000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
});
