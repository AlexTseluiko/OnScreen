import { BaseApiClient } from '../client';
import { API_STATUS } from '../../../constants/api';

describe('BaseApiClient', () => {
  let client: BaseApiClient;
  const baseUrl = 'https://api.example.com';

  beforeEach(() => {
    client = new BaseApiClient(baseUrl);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make successful GET request', async () => {
    const mockResponse = { data: { id: 1 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await client.get('/test');

    expect(response.status).toBe(API_STATUS.SUCCESS);
    expect(response.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/test`,
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should handle failed request', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await client.get('/test');

    expect(response.status).toBe(API_STATUS.ERROR);
    expect(response.error).toBe("Cannot read properties of undefined (reading 'ok')");
  });

  it('should retry failed request', async () => {
    const mockResponse = { data: { id: 1 } };
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

    const response = await client.get('/test', { retry: true, maxRetries: 2 });

    expect(response.status).toBe(API_STATUS.SUCCESS);
    expect(response.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
