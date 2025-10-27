import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () =>
    ({ ok: true, json: async () => ({ ok: true }) } as any)
  ));
});

afterEach(() => {
  vi.restoreAllMocks();
});
