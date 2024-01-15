const { jest, describe, afterEach, expect, it } = require('@jest/globals');
jest.mock('../../rds/client');
jest.mock('../../../config', () => ({
  DB_SCHEMA: 'public',
  DB_TABLE_NAME: 'room'
}));

const { query } = require('../../rds/client');
const repository = require('../../rds/repository');

describe('integration test on rds/repository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('findByRefIdAndLocationCode', () => {
    it('should find record by unique ID', async () => {
      const refId = 'edd98821-0455-447b-95d9-6b0cc40688ce';
      const locationCode = '1001';
      await repository.findByRefIdAndLocationCode(refId, locationCode);
      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM public.room WHERE ref_id = 'edd98821-0455-447b-95d9-6b0cc40688ce' AND location_code = '1001'"
      );
    });
  });

  describe('findByLocationCode', () => {
    it('should find records by location id without paging', async () => {
      await repository.findByLocationCode('1001');
      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM public.room WHERE location_code = '1001'"
      );
    });

    it('should find records by location id with paging', async () => {
      await repository.findByLocationCode('1002', { page: 2, pageSize: 3 });
      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM public.room WHERE location_code = '1002' LIMIT 3 OFFSET 3"
      );
    });
  });
});
