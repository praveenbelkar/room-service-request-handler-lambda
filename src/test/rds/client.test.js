const { afterEach, describe, jest, expect, it } = require('@jest/globals');
const { withRetry } = require('../../rds/client.js');

describe('client', () => {
  describe('withRetry', () => {
    const successFn = async () => 'Data';
    const temporaryFailureFn = async () => {
      throw new Error('Temporary failure');
    };
    const failureFn = async () => {
      throw new Error('Failed to fetch data');
    };
    const mockAsyncFn = jest.fn(successFn);

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should resolve with data if the request succeeds on the first attempt', async () => {
      const result = await withRetry(3, 1000)(mockAsyncFn);
      expect(result).toBe('Data');
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });

    it('should resolve with data if the request succeeds after multiple attempts', async () => {
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      const result = await withRetry(3, 500)(mockAsyncFn);
      expect(result).toBe('Data');
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
    });

    it('should reject with an error if the request fails and the maximum number of retries is reached', async () => {
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      mockAsyncFn.mockImplementation(failureFn);
      const promise = withRetry(3, 500)(mockAsyncFn);
      await expect(promise).rejects.toThrow('Failed to fetch data');
      expect(mockAsyncFn).toHaveBeenCalledTimes(4);
    });

    it('should retry immediately if the request fails and the delay is set to 0', async () => {
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      mockAsyncFn.mockImplementationOnce(temporaryFailureFn);
      mockAsyncFn.mockImplementation(temporaryFailureFn);
      const promise = withRetry(3, 0)(mockAsyncFn);
      await expect(promise).rejects.toThrow('Temporary failure');
      expect(mockAsyncFn).toHaveBeenCalledTimes(4);
    });
  });
});
