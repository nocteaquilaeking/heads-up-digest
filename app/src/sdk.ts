import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';
import type { Highlight } from './data/demo';

type Screen = 'menu' | 'digest' | 'detail' | 'watchlist';
type Handler = (action: 'select' | 'back' | 'next' | 'menu', index?: number) => void;
let bridge: any = null;
const safe = async (fn: () => Promise<unknown> | unknown) => { try { if (bridge) await fn(); } catch (error) { console.warn('Even Hub bridge call failed', error); } };
const text = (id: number, name: string, content: string, x=0, y=0, w=576, h=270) => ({ containerID:id, containerName:name, x, y, width:w, height:h, content, isEventCapture: id===1 ? 1 : 0 });
const list = (id:number,name:string,items:string[],x=0,y=0,w=576,h=270) => ({ containerID:id,containerName:name,x,y,width:w,height:h,itemCount:items.length,items,isEventCapture:id===1?1:0 });
export async function initSdk(onAction: Handler): Promise<boolean> {
  try { bridge = await Promise.race([waitForEvenAppBridge(), new Promise<null>(resolve => setTimeout(() => resolve(null), 1200))]); } catch { bridge = null; return false; }
  if (!bridge) return false;
  try { bridge.onEvenHubEvent((event: any) => {
    const e = event?.listEvent ?? event?.textEvent ?? event?.sysEvent;
    const type = String(e?.eventType ?? e?.type ?? '').toUpperCase();
    if (type.includes('DOUBLE') || type.includes('SCROLL_BOTTOM')) onAction('back');
    else if (type.includes('SCROLL_TOP')) onAction('next');
    else if (type.includes('CLICK')) onAction('select', Number(e?.currentSelectItemIndex ?? e?.itemIndex ?? 0));
    else if (type.includes('LONG_PRESS')) onAction('menu');
  }); } catch (e) { console.warn('Could not subscribe to Even Hub events', e); }
  return true;
}
export async function showMenu() { const data = { containerTotalNum:2, textObject:text(2,'Heads Up','HEADS-UP DIGEST\nTap to open',0,0,576,54), listObject:list(1,'Menu',['Digest','Watchlist'],0,56,576,220) }; if (bridge) { if (!(bridge as any).__started) { await safe(()=>bridge.createStartUpPageContainer(data)); bridge.__started=true; } else await safe(()=>bridge.rebuildPageContainer(data)); } }
export async function showDigest(items: Highlight[]) { await rebuild('Digest', items.map(i=>`${i.source}: ${i.line}`)); }
export async function showWatchlist(lines: string[]) { const body=[...lines.slice(0,5),'','ALERT EXAMPLE','BTC above 100k'].join('\n'); await safe(()=>bridge?.rebuildPageContainer({containerTotalNum:1,textObject:text(1,'Watchlist',body)})); }
export async function showDetail(item: Highlight) { await safe(()=>bridge?.rebuildPageContainer({ containerTotalNum:2, textObject:text(1,'Highlight',`${item.source}  ${item.time}\n\n${item.summary}\n\nWHY IT MATTERS\n${item.why}\n\nDouble press to return`), listObject:list(2,'Action',['Back to digest'],0,272,576,1) })); }
async function rebuild(title:string, items:string[]) { const clipped=items.slice(0,20).map(s=>s.replace(/[^\x20-\x7E]/g,' ').slice(0,64)); await safe(()=>bridge?.rebuildPageContainer({containerTotalNum:2,textObject:text(2,'Title',title,0,0,576,50),listObject:list(1,title,clipped,0,52,576,230)})); }
export function hasBridge() { return Boolean(bridge); }
