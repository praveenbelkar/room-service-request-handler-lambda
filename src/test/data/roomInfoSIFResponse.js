const room = {
  RefId: 'D3E34B35-9D75-101A-8C3D-00AA001A1652',
  SchoolInfoRefId: 'E3E34B35-9D75-101A-8C3D-00AA001A1652',
  LocalId: 'urn:ams:roomid:80936',
  RoomNumber: 'OS 602 11763',
  Description: 'Classroom',
  Size: 76,
  Capacity: 30,
  RoomType: 'C',
  AvailableForTimetable: 'Y',
  SIF_ExtendedElements: {
      SIF_ExtendedElement: [
        {
          Name: "Status",
          value: ""
        },
        {
          Name: "Source",
          value: ""
        },
        {
          Name: "RoomTypeDescription",
          value: ""
        }
      ]
    }

};

const roomInfo = {
  RoomInfo: room
};

const roomInfoList = {
  RoomInfos: {
    RoomInfo: [room, room]
  }
};

module.exports = {
  roomInfo,
  roomInfoList
};
