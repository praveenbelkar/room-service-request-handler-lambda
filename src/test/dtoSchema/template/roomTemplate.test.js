const { describe, expect, it } = require('@jest/globals');
const Handlebars = require('handlebars/runtime');
require('../../../dtoSchema/handlebarHelpers.js');
require('../../../dtoSchema/template/roomTemplate.js');
const expectedResponse = require('../../data/roomInfoSIFResponse.js');
const mockData = require('../../data/roomMockData.js');

describe('Handlebar Template', () => {
  describe('should generate RoomInfo Object', () => {
    const roomInfoTemplate = Handlebars.templates['roomInfo'];

    it('when a valid schoolDetail is given as input', () => {
      const response = roomInfoTemplate(mockData.mockRoomInfo);
      expect(JSON.parse(response)).toEqual(expectedResponse.roomInfo);
    });
  });

  describe('should generate RoomInfo List', () => {
    const roomInfoListTemplate = Handlebars.templates['roomInfoList'];

    it('when valid roomInfo array is given as input', () => {
      const response = roomInfoListTemplate(mockData.mockRoomInfoList);
      expect(JSON.parse(response)).toEqual(expectedResponse.roomInfoList);
    });
  });
});
