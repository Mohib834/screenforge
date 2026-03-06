import { desktopCapturer } from 'electron';
import type { DesktopSource } from '../../../src/types/index';
import log from '../../lib/logger';

let cachedSources: DesktopSource[] = [];

export async function initializeSources(): Promise<void> {
  try {
    const raw = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 200, height: 120 },
      fetchWindowIcons: true,
    });
    cachedSources = raw.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL(),
      appIcon: s.appIcon?.toDataURL() ?? null,
    }));
  } catch (e) {
    log.warn('desktopCapturer failed:', e);
    cachedSources = [];
  }
}

export const getSources = (): DesktopSource[] => cachedSources;

export async function fetchSources(): Promise<DesktopSource[]> {
  try {
    const raw = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 200, height: 120 },
      fetchWindowIcons: true,
    });
    return raw.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail?.toDataURL() ?? null,
      appIcon: s.appIcon?.toDataURL() ?? null,
    }));
  } catch {
    return getSources();
  }
}
