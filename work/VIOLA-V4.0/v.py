import json,sys
f=sys.argv[1]; flt=sys.argv[2] if len(sys.argv)>2 else ''
d=json.load(open(f))
for p in d:
  if not isinstance(p,dict): continue
  if 'tag' not in p: print('#',json.dumps(p,ensure_ascii=False)[:1500]); continue
  if flt and flt not in p['tag']: continue
  print('##',p['tag'],p['url'][40:150],'|bc',p['bc'],'|pt',p['pt'][:100])
  for k in ['h','tabs','btn','ph','lab','sel','chk']:
    if p.get(k): print(' ',k,p[k][:60])
  for t in p['tables']: print('  T',t['tid'],t['th'],t['rows'],t['row1'][:10])
  print('  tids',[x[0]+('('+x[2][:25]+')' if x[1] in('button','input') else '') for x in p['tids'] if x[0] not in('adm-app-header','adm-breadcrumb','adm-breadcrumb-item','adm-the-header-toggle-panel')][:80])
  if p.get('modal'): print('  modal',[m[:400] for m in p['modal']])
