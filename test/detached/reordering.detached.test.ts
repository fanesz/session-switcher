import { test, expect } from '@jest/globals';

interface Session {
  id: string;
  name: string;
  order: number;
  domain: string;
}

var mockSavedSessions: Session[] = [
  {
    id: '1',
    name: 'Test',
    order: 0,
    domain: 'google.com'
  },
  {
    id: '2',
    name: 'Test 2',
    order: 1,
    domain: 'google.com'
  },
  {
    id: '3',
    name: 'Test 3',
    order: 2,
    domain: 'google.com'
  },
  {
    id: '4',
    name: 'Different Domain Session',
    order: 0,
    domain: 'example.com'
  }
];

var currentDomain = 'google.com'

/**
 * @module PopupService
 * See the `PopupService.reorderingSessions` method in `src/popup/services/popup.service.ts`
 * @param sessionIds 
 * @returns Session[]
 */
function reorderSessions(sessionIds: string[]): Session[] {
  let result: Session[] = [];

  sessionIds.forEach((id, index) => {
    const session = mockSavedSessions
      .filter(x => x.domain === currentDomain)
      .find((s) => s.id === id);
    if (!session) {
      throw new Error("Session not found");
    }

    session.order = index;

    result.push(session);
  });

  return result;
}

test('reorderSessions moves sessions correctly', () => {
  const updatedSessions = reorderSessions([
    '2',
    '1',
    '3'
  ]);

  expect(updatedSessions.find(s => s.id === '2')?.order).toBe(0);
  expect(updatedSessions.find(s => s.id === '1')?.order).toBe(1);
  expect(updatedSessions.find(s => s.id === '3')?.order).toBe(2);
});