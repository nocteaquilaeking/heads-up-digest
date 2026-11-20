import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';
import type { Highlight } from './data/demo';

type Handler = (action: 'select' | 'back' | 'next' | 'menu', index?: number) => void;
let bridge: any = null;
let started = false;

const safe = async (fn: () => Promise<unknown> | unknown) => {
  try { if (bridge) await fn(); } catch (error) { console.warn('Even Hub bridge call failed', error); }
};

// SDK 0.0.14 container shapes (from the installed .d.ts):
// - positions are xPosition / yPosition (not x / y)
// - list items live in a nested itemContainer { itemCount, itemName }
// - textObject / listObject are ARRAYS of container objects
const text = (id: number, name: string, content: string, x = 0, y = 0, w = 576, h = 270, capture = false) => ({
  containerID: id, containerName: name, xPosition: x, yPosition: y, width: w, height: h,
  content, isEventCapture: capture ? 1 : 0,
});
const list = (id: number, name: string, items: string[], x = 0, y = 0, w = 576, h = 270, capture = false) => ({
  containerID: id, containerName: name, xPosition: x, yPosition: y, width: w, height: h,
  itemContainer: { itemCount: items.length, itemName: items }, isEventCapture: capture ? 1 : 0,
});

export async function initSdk(onAction: Handler): Promise<boolean> {
  try {
    bridge = await Promise.race([
      waitForEvenAppBridge(),
      new Promise<null>(resolve => setTimeout(() => resolve(null), 1200)),
    ]);
  } catch { bridge = null; return false; }
  if (!bridge) return false;
  try {
    bridge.onEvenHubEvent((event: any) => {
      // Host JSON is proto3-style: default values are OMITTED. A listEvent therefore
      // IS a click (eventType 0 is never sent); its item index is
      // currentSelectItemIndex, also omitted when it is 0.
      if (event?.listEvent) { onAction('select', Number(event.listEvent.currentSelectItemIndex ?? 0)); return; }
      const e = event?.textEvent ?? event?.sysEvent;
      if (!e) return;
      const raw = e?.eventType;
      const type = typeof raw === 'number' ? raw : String(raw ?? '').toUpperCase();
      // OsEventTypeList: 0 CLICK, 1 SCROLL_TOP, 2 SCROLL_BOTTOM, 3 DOUBLE_CLICK
      if (type === 3 || (typeof type === 'string' && type.includes('DOUBLE'))) onAction('back');
      else if (type === 2 || (typeof type === 'string' && type.includes('SCROLL_BOTTOM'))) onAction('back');
      else if (type === 1 || (typeof type === 'string' && type.includes('SCROLL_TOP'))) onAction('next');
      else if (type === 0 || type === '' || (typeof type === 'string' && type.includes('CLICK'))) onAction('select', Number(e?.currentSelectItemIndex ?? 0));
      else if (typeof type === 'string' && type.includes('LONG')) onAction('menu');
    });
  } catch (e) { console.warn('Could not subscribe to Even Hub events', e); }
  return true;
}

async function show(data: any) {
  if (!bridge) return;
  if (!started) { await safe(() => bridge.createStartUpPageContainer(data)); started = true; }
  else await safe(() => bridge.rebuildPageContainer(data));
}

export async function showMenu() {
  await show({
    containerTotalNum: 2,
    textObject: [text(2, 'Heads Up', 'HEADS-UP DIGEST\nTap to open', 0, 0, 576, 54)],
    listObject: [list(1, 'Menu', ['Digest', 'Watchlist'], 0, 56, 576, 220, true)],
  });
}

export async function showDigest(items: Highlight[]) {
  const clipped = items.slice(0, 20).map(i => `${i.source}: ${i.line}`.replace(/[^\x20-\x7E]/g, ' ').slice(0, 64));
  await show({
    containerTotalNum: 2,
    textObject: [text(2, 'Title', 'Digest', 0, 0, 576, 50)],
    listObject: [list(1, 'Digest', clipped, 0, 52, 576, 230, true)],
  });
}

export async function showDetail(item: Highlight) {
  const body = `${item.source}  ${item.time}\n\n${item.summary}\n\nWHY IT MATTERS\n${item.why}\n\nDouble press to return`;
  await show({
    containerTotalNum: 1,
    textObject: [text(1, 'Highlight', body, 0, 0, 576, 280, true)],
  });
}

export async function showWatchlist(lines: string[]) {
  const body = [...lines.slice(0, 5), '', 'ALERT EXAMPLE', 'BTC above 100k'].join('\n');
  await show({
    containerTotalNum: 1,
    textObject: [text(1, 'Watchlist', body, 0, 0, 576, 280, true)],
  });
}

export function hasBridge() { return Boolean(bridge); }
