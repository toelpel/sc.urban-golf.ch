import { vi } from 'vitest'

export function createMockClient() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: vi.fn(),
  }
}

export function mockGetClient(mockClient) {
  vi.mock('../../db/pg.js', () => ({
    getClient: vi.fn().mockResolvedValue(mockClient || createMockClient()),
  }))
}
