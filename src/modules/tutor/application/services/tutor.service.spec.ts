import { Types } from 'mongoose';

import { TutorService } from './tutor.service';

describe('TutorService', () => {
  it('creates an active tutor session with the expected defaults', async () => {
    const createdSession = { id: 'session-1' };
    const create = jest.fn().mockResolvedValue(createdSession);

    const service = new TutorService(
      { generateTutorResponse: jest.fn() } as never,
      { create } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const userId = '507f191e810c19729de860ea';
    const result = await service.createSession(userId, {
      title: 'Movimiento parabólico',
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new Types.ObjectId(userId),
        title: 'Movimiento parabólico',
        status: 'ACTIVE',
        messageCount: 0,
        provider: 'gemini',
      }),
    );
    expect(result).toBe(createdSession);
  });
});
