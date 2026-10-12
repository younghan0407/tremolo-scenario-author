import { test, expect } from '@playwright/test';
import { selectAntdOption } from '../../_helpers/antdSelect';
import { selectAntdTableRow } from '../../_helpers/antdTableRow';
import { resolveRuntimeValue, exportRuntimeValue } from '../../_helpers/dynamicValue';

test('[CICD]-[파이프라인 설정]-[빌드 관리]-[1. 빌드 생성, 작업-수정, 삭제]', async ({ page }, testInfo) => {
  // https://306tst.bf.okestro.cloud/login 이동
  await test.step('[TMLO:1] https://306tst.bf.okestro.cloud/login 이동', async () => {
    try {
      await page.goto('https://306tst.bf.okestro.cloud/login', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s1-1784103465694-0-0-failed.png') }).catch((e2) => console.warn('[screenshot] step #s1-1784103465694-0-0: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 아이디 클릭
  await test.step('[TMLO:2] * 아이디 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+아이디\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s2-1784103465694-0-1-failed.png') }).catch((e2) => console.warn('[screenshot] step #s2-1784103465694-0-1: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 아이디 입력
  await test.step('[TMLO:3] * 아이디 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+아이디\.?\s*$/ }).fill('<ID>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s3-1784103465694-0-2-failed.png') }).catch((e2) => console.warn('[screenshot] step #s3-1784103465694-0-2: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // * 비밀번호 입력
  await test.step('[TMLO:4] * 비밀번호 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*\*\s+비밀번호\.?\s*$/ }).fill('<PASSWORD>', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s8-1784103465694-0-3-failed.png') }).catch((e2) => console.warn('[screenshot] step #s8-1784103465694-0-3: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 로그인 클릭
  await test.step('[TMLO:5] 로그인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*로그인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s9-1784103465694-0-4-failed.png') }).catch((e2) => console.warn('[screenshot] step #s9-1784103465694-0-4: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 파이프라인 설정 클릭
  await test.step('[TMLO:6] 파이프라인 설정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*파이프라인\s+설정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s10-failed.png') }).catch((e2) => console.warn('[screenshot] step #s10: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 빌드 관리 클릭
  await test.step('[TMLO:7] 빌드 관리 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*빌드\s+관리\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s11-failed.png') }).catch((e2) => console.warn('[screenshot] step #s11: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // add 생성 클릭
  await test.step('[TMLO:8] add 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*add\s+생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*add\s+생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s12-failed.png') }).catch((e2) => console.warn('[screenshot] step #s12: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 클릭
  await test.step('[TMLO:9] 이름을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s13-failed.png') }).catch((e2) => console.warn('[screenshot] step #s13: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이름을 입력해 주세요 입력
  await test.step('[TMLO:10] 이름을 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-build{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*이름을\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('build_name', __tmloValue, { scope: 'runSet', source: { stepId: 's14', title: '이름을 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s14-failed.png') }).catch((e2) => console.warn('[screenshot] step #s14: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 중복확인 클릭
  await test.step('[TMLO:11] 중복확인 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*중복확인\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s15-failed.png') }).catch((e2) => console.warn('[screenshot] step #s15: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // biz 클릭
  await test.step('[TMLO:12] biz 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*biz\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s16-failed.png') }).catch((e2) => console.warn('[screenshot] step #s16: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:13] element 클릭', async () => {
    try {
      await page.locator('(//*[contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown ") and not(contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown-hidden "))]//*[(@role="option" or contains(concat(" ", normalize-space(@class), " "), " ant-select-item-option ")) and (translate(normalize-space(.), \' \', \'\')=\'biz\' or .//*[translate(normalize-space(.), \' \', \'\')=\'biz\'])])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s17-failed.png') }).catch((e2) => console.warn('[screenshot] step #s17: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-start id=b1784106957678 네임스페이스 선택
  // 네임스페이스: auto-namespace 선택
  await test.step('[TMLO:14] 네임스페이스: auto-namespace 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '네임스페이스', option: 'auto-namespace', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s18-failed.png') }).catch((e2) => console.warn('[screenshot] step #s18: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1784021404237 test
  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:15] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s19-failed.png') }).catch((e2) => console.warn('[screenshot] step #s19: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:16] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().fill(resolveRuntimeValue('{{registry_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s20-failed.png') }).catch((e2) => console.warn('[screenshot] step #s20: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:17] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).first().press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s21-failed.png') }).catch((e2) => console.warn('[screenshot] step #s21: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: auto-coderegistry
  await test.step('[TMLO:18] AntD 표 행 선택: auto-coderegistry', async () => {
    try {
      await selectAntdTableRow(page, { match: [resolveRuntimeValue('{{registry_name}}')], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s22-failed.png') }).catch((e2) => console.warn('[screenshot] step #s22: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 전체 수 1: main 선택
  await test.step('[TMLO:19] 전체 수 1: main 선택', async () => {
    try {
      await selectAntdOption(page, { by: 'label', label: '전체 수 1', option: 'main', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s23-failed.png') }).catch((e2) => console.warn('[screenshot] step #s23: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: 1.21
  await test.step('[TMLO:20] AntD 표 행 선택: 1.21', async () => {
    try {
      await selectAntdTableRow(page, { match: ['1.21'], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s24-failed.png') }).catch((e2) => console.warn('[screenshot] step #s24: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // switch 클릭
  await test.step('[TMLO:21] switch 클릭', async () => {
    try {
      await page.getByRole('switch').nth(1).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s25-failed.png') }).catch((e2) => console.warn('[screenshot] step #s25: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // AntD 표 행 선택: auto-imageregistry
  await test.step('[TMLO:22] AntD 표 행 선택: auto-imageregistry', async () => {
    try {
      await selectAntdTableRow(page, { match: [resolveRuntimeValue('{{imageregistry_name}}')], control: 'radio', timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s26-failed.png') }).catch((e2) => console.warn('[screenshot] step #s26: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1784021695325 추가
  // item-ant-form 클릭
  await test.step('[TMLO:23] item-ant-form 클릭', async () => {
    try {
      await page.locator('div:nth-child(4) > .item-ant-form > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input-group > .ant-select > .ant-select-selector').click({ timeout: 300000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s27-failed.png') }).catch((e2) => console.warn('[screenshot] step #s27: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // @block-start id=b1784022113591 test
  // auto-project 클릭
  await test.step('[TMLO:24] auto-project 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*auto-project\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s28-failed.png') }).catch((e2) => console.warn('[screenshot] step #s28: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // 도커 이미지 이름을 입력해 주세요 클릭
  await test.step('[TMLO:25] 도커 이미지 이름을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*도커\s+이미지\s+이름을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s29-failed.png') }).catch((e2) => console.warn('[screenshot] step #s29: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 도커 이미지 이름을 입력해 주세요 입력
  await test.step('[TMLO:26] 도커 이미지 이름을 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-dockerimage{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*도커\s+이미지\s+이름을\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('dockerimage_name', __tmloValue, { scope: 'runSet', source: { stepId: 's30', title: '도커 이미지 이름을 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s30-failed.png') }).catch((e2) => console.warn('[screenshot] step #s30: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이미지 태그를 입력해 주세요 클릭
  await test.step('[TMLO:27] 이미지 태그를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이미지\s+태그를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s31-failed.png') }).catch((e2) => console.warn('[screenshot] step #s31: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이미지 태그를 입력해 주세요 입력
  await test.step('[TMLO:28] 이미지 태그를 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-tag{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*이미지\s+태그를\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('tag_name', __tmloValue, { scope: 'runSet', source: { stepId: 's32', title: '이미지 태그를 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s32-failed.png') }).catch((e2) => console.warn('[screenshot] step #s32: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 생성 클릭
  await test.step('[TMLO:29] 생성 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*생성\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s33-failed.png') }).catch((e2) => console.warn('[screenshot] step #s33: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:30] element 클릭', async () => {
    try {
      await page.locator('(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'알림\')]//button[translate(normalize-space(.), \' \', \'\')=\'확인\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s34-failed.png') }).catch((e2) => console.warn('[screenshot] step #s34: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:31] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s35-failed.png') }).catch((e2) => console.warn('[screenshot] step #s35: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:32] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill(resolveRuntimeValue('{{build_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s36-failed.png') }).catch((e2) => console.warn('[screenshot] step #s36: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:33] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s37-failed.png') }).catch((e2) => console.warn('[screenshot] step #s37: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-start id=b1784107589310 READY 검증
  // auto-build 표시 검증
  await test.step('[TMLO:34] auto-build 표시 검증', async () => {
    try {
      await expect(page.getByText('READY')).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s38-failed.png') }).catch((e2) => console.warn('[screenshot] step #s38: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // @block-end
  // more_horiz 클릭
  await test.step('[TMLO:35] more_horiz 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*more_horiz\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*more_horiz\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s39-failed.png') }).catch((e2) => console.warn('[screenshot] step #s39: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 클릭
  await test.step('[TMLO:36] 수정 클릭', async () => {
    try {
      await (async () => { const target = page.getByText(/^\s*수정\.?\s*$/); const menuTarget = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]'); const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click({ timeout: 15000 }); return; } await target.click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click({ timeout: 15000 }); }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s40-failed.png') }).catch((e2) => console.warn('[screenshot] step #s40: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인했습니다 체크
  await test.step('[TMLO:37] 확인했습니다 체크', async () => {
    try {
      await page.getByRole('checkbox', { name: /^\s*확인했습니다\.?\s*$/ }).check({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s41-failed.png') }).catch((e2) => console.warn('[screenshot] step #s41: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:38] element 클릭', async () => {
    try {
      await page.locator('(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'빌드수정\')]//button[translate(normalize-space(.), \' \', \'\')=\'수정\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s42-failed.png') }).catch((e2) => console.warn('[screenshot] step #s42: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이미지 태그를 입력해 주세요 클릭
  await test.step('[TMLO:39] 이미지 태그를 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*이미지\s+태그를\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s43-failed.png') }).catch((e2) => console.warn('[screenshot] step #s43: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 이미지 태그를 입력해 주세요 입력
  await test.step('[TMLO:40] 이미지 태그를 입력해 주세요 입력', async () => {
    try {
      await (async () => { const __tmloValue = resolveRuntimeValue('auto-change{RUN_ID}'); await page.getByRole('textbox', { name: /^\s*이미지\s+태그를\s+입력해\s+주세요\.?\s*$/ }).fill(__tmloValue, { timeout: 15000 }); exportRuntimeValue('changetag_name', __tmloValue, { scope: 'runSet', source: { stepId: 's44', title: '이미지 태그를 입력해 주세요 입력' } }); })();
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s44-failed.png') }).catch((e2) => console.warn('[screenshot] step #s44: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 수정 클릭
  await test.step('[TMLO:41] 수정 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*수정\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*수정\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s45-failed.png') }).catch((e2) => console.warn('[screenshot] step #s45: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:42] element 클릭', async () => {
    try {
      await page.locator('(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'알림\')]//button[translate(normalize-space(.), \' \', \'\')=\'확인\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s46-failed.png') }).catch((e2) => console.warn('[screenshot] step #s46: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:43] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s47-failed.png') }).catch((e2) => console.warn('[screenshot] step #s47: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:44] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill(resolveRuntimeValue('{{build_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s48-failed.png') }).catch((e2) => console.warn('[screenshot] step #s48: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:45] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s49-failed.png') }).catch((e2) => console.warn('[screenshot] step #s49: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // {{build_name}} 클릭
  await test.step('[TMLO:46] {{build_name}} 클릭', async () => {
    try {
      await page.getByRole('button', { name: resolveRuntimeValue('{{build_name}}'), exact: true }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: resolveRuntimeValue('{{build_name}}'), exact: true }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s50-failed.png') }).catch((e2) => console.warn('[screenshot] step #s50: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // okestro-cicd 텍스트 포함 검증
  await test.step('[TMLO:47] okestro-cicd 텍스트 포함 검증', async () => {
    try {
      await expect(page.locator('#okestro-cicd')).toContainText(resolveRuntimeValue('{{changetag_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s51-failed.png') }).catch((e2) => console.warn('[screenshot] step #s51: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // delete 삭제 클릭
  await test.step('[TMLO:48] delete 삭제 클릭', async () => {
    try {
      await page.getByRole('button', { name: /^\s*delete\s+삭제\.?\s*$/ }).click({ timeout: 15000 }).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await page.getByRole('button', { name: /^\s*delete\s+삭제\.?\s*$/ }).filter({ visible: true }).last().click({ timeout: 15000 }); });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s52-failed.png') }).catch((e2) => console.warn('[screenshot] step #s52: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 확인했습니다 체크
  await test.step('[TMLO:49] 확인했습니다 체크', async () => {
    try {
      await page.getByRole('checkbox', { name: /^\s*확인했습니다\.?\s*$/ }).check({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s53-failed.png') }).catch((e2) => console.warn('[screenshot] step #s53: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // element 클릭
  await test.step('[TMLO:50] element 클릭', async () => {
    try {
      await page.locator('(//*[@role="dialog" or @aria-modal="true" or contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ") or contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")][contains(translate(normalize-space(.), \' \', \'\'), \'빌드삭제\')]//button[translate(normalize-space(.), \' \', \'\')=\'삭제\'])[last()]').click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s54-failed.png') }).catch((e2) => console.warn('[screenshot] step #s54: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 클릭
  await test.step('[TMLO:51] 항목 이름 또는 값을 입력해 주세요 클릭', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).click({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s55-failed.png') }).catch((e2) => console.warn('[screenshot] step #s55: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 입력
  await test.step('[TMLO:52] 항목 이름 또는 값을 입력해 주세요 입력', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).fill(resolveRuntimeValue('{{build_name}}'), { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s56-failed.png') }).catch((e2) => console.warn('[screenshot] step #s56: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 항목 이름 또는 값을 입력해 주세요 키 누르기
  await test.step('[TMLO:53] 항목 이름 또는 값을 입력해 주세요 키 누르기', async () => {
    try {
      await page.getByRole('textbox', { name: /^\s*항목\s+이름\s+또는\s+값을\s+입력해\s+주세요\.?\s*$/ }).press('Enter', { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s57-failed.png') }).catch((e2) => console.warn('[screenshot] step #s57: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

  // 검색어나 검색 필터를 변경해 주세요. 표시 검증
  await test.step('[TMLO:54] 검색어나 검색 필터를 변경해 주세요. 표시 검증', async () => {
    try {
      await expect(page.getByText(/^\s*검색어나\s+검색\s+필터를\s+변경해\s+주세요\.\s*$/)).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: testInfo.outputPath('step-s58-failed.png') }).catch((e2) => console.warn('[screenshot] step #s58: ' + (e2 && (e2.message || e2))));
      throw e;
    }
  });

});
