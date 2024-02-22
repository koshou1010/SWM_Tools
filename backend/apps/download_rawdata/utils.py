import pymongo
from datetime import datetime
import os
from django.conf import settings
import json
import time
from zipfile import ZipFile, ZIP_DEFLATED
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

EVENT_TEMPLATE = {
    'uuId': '0',
    'macId': '',
    'startTT': 0,
    'endTT': 0,
    'magic': 0,
    'pocketno': 0,
    'appVer': '',
    'osVer': '',
    'userInfo': '',
    'deviceInfo': '',
    'extra': '',
    'disconnectReason': '',
    'motionInitArgs': {
        'x': 0.0,
        'y': 0.0,
        'z': 0.0,
        'type': 1,
        'timestamp': 0
    }
}


class MongoManager:

    def __init__(self) -> None:
        self.client = pymongo.MongoClient(settings.MONGO_ENGINE_URL)
        self.event_db = self.client["event_db"]
        self.rawdata_db = self.client["rawdata_db"]
        self.event_collection = self.event_db["event"]
        self.rawdata_collection = self.rawdata_db["raw_data"]

    def get_rawdata_by_tt(self, data: dict) -> list:
        _query = {"uuId": str(data["uuId"]), "tt": {
            "$gte": data['start'], "$lte": data['end']}}
        return list(self.rawdata_collection.find(_query, {'_id': False, 'tt': True}))

    def get_events_not_end(self, uuId: str, start_tt: int, end_tt: int) -> list:
        _query = {"uuId": uuId, "startTT": {
            "$lte": end_tt}, "endTT": 0, "pocketno": 0}
        return list(self.event_collection.find(_query, {'_id': False}))

    def get_rawdata_last_tt(self, ended_event_list: list) -> list:
        result = []
        for event in ended_event_list:
            print(f"uuId: {event['uuId']}, magic: {event['magic']}")
            _query = {"uuId": event['uuId'], "magic": event['magic']}

            last_rawdata = self.rawdata_collection.find_one(
                _query, {'_id': False, 'tt': True}, sort=[('tt', pymongo.DESCENDING)])
            last_tt = last_rawdata['tt']
            # add 10 second.
            _end_tt = last_tt + (10 * 1000)
            closed_event = {"uuId": event['uuId'],
                            "magic": event['magic'], "end_tt": _end_tt}
            result.append(closed_event)
        return result

    def update_events_not_end(self, event_not_end_list: list, ended_event_list: list) -> list:
        for event in event_not_end_list:
            for ended_event in ended_event_list:
                if event['uuId'] == ended_event['uuId'] and event['magic'] == ended_event['magic']:
                    event['endTT'] = ended_event['end_tt']
                    event['extra'] = 'ended by koshou scripts'
        return event_not_end_list

    def get_events(self, uuId: str, start_tt: int, end_tt: int) -> list:
        _query = {"uuId": uuId, "startTT": {
            "$lte": end_tt}, "endTT": {"$gte": start_tt}}
        return list(self.event_collection.find(_query,  {'_id': False}).sort({"startTT": pymongo.ASCENDING, "uuId": pymongo.ASCENDING}))

    def get_events_by_current_ts(self, uuId: str, start_tt: int) -> list:
        _query = {"uuId": uuId, "startTT": start_tt}
        return list(self.event_collection.find(_query,  {'_id': False}).sort({"startTT": pymongo.ASCENDING, "uuId": pymongo.ASCENDING}))

    def get_event_rawdatas(self, event: dict) -> list:
        _end_tt = event['endTT'] + 10000
        _query = {"uuId": event['uuId'], "tt": {
            "$lte": _end_tt}, "magic": event['magic']}
        # print(_query)
        return list(self.rawdata_collection.find(_query, {'_id': False}).sort({"tt": pymongo.ASCENDING}))


def get_package_event_length(data: dict) -> list:
    uuId = str(data['uuId'])
    start_tt = datetime.strptime(
        data['start_dt'], '%Y-%m-%d').timestamp() * 1000
    end_tt = datetime.strptime(
        data['end_dt'], '%Y-%m-%d').timestamp() * 1000 + (1 * 24 * 60 * 60 * 1000 - 1)
    mongo_manager = MongoManager()
    print('find events')
    events = mongo_manager.get_events(
        uuId=uuId, start_tt=start_tt, end_tt=end_tt)
    event_not_end_list = mongo_manager.get_events_not_end(
        uuId=uuId, start_tt=start_tt, end_tt=end_tt)
    if not event_not_end_list:
        print("No no end event.")
    else:
        print("Start ended event.")
        ended_event_list = mongo_manager.get_rawdata_last_tt(
            ended_event_list=event_not_end_list)
        ended_evevnt_result = mongo_manager.update_events_not_end(
            event_not_end_list, ended_event_list)
        # start put ended event in events list
        for i in ended_evevnt_result:
            events.append(i)
    return events


def start_package_rawdata_event(data: dict, events: list):
    uuId = str(data['uuId'])
    if data['byEvent']:
        start_tt = data['start_ts']
        end_tt = data['end_ts']
    else:
        start_tt = datetime.strptime(
            data['start_dt'], '%Y-%m-%d').timestamp() * 1000
        end_tt = datetime.strptime(
            data['end_dt'], '%Y-%m-%d').timestamp() * 1000 + (1 * 24 * 60 * 60 * 1000 - 1)
    _startswith_str = data['startswith_str']

    event_extension = '.evt'
    rawData_extension = '.srj'
    zip_extension = '.zip'
    print("Start pagckage events.")
    print(f"uuId:{uuId}")
    print(f"start_tt:{start_tt}")
    print(f"end_tt:{end_tt}")
    print(
        f"start_datetime:{datetime.fromtimestamp(start_tt/1000).strftime('%Y-%m-%d %H:%M:%S')}")
    print(
        f"end_datetime:{datetime.fromtimestamp(end_tt/1000).strftime('%Y-%m-%d %H:%M:%S')}")
    print("Ended events.")
    print("check no end_event")
    mongo_manager = MongoManager()
    zip_files = []

    all_event_folder_name_list = []
    for index, event in enumerate(events):
        print(
            f"Begin physiological event migration: uuId={event['uuId']}, magic={event['magic']}")
        print('start query rawdata')
        rawdatas = mongo_manager.get_event_rawdatas(event)
        if not rawdatas:
            # break if no data.
            print("No rawdata exist.")
            continue

        # find event folder.
        event_date = datetime.fromtimestamp(event['startTT'] / 1000.0)
        event_folder_name = f"{uuId}_{_startswith_str}_{event_date.strftime('%Y%m%d')}"
        print(f"Start finding event folder: {event_folder_name}")
        event_files_path = os.path.join(
            settings.BASE_DIR, 'data', event_folder_name)
        os.makedirs(event_files_path, exist_ok=True)
        all_event_folder_name_list.append(event_folder_name)

        macId = event['macId'].replace(':', '')
        file_name = event['uuId'] + "_" + \
            str(int(event['startTT'])) + "_" + macId
        event_file_name = f"{event_files_path}/{file_name}{event_extension}"
        rawdata_file_name = f"{event_files_path}/{file_name}{rawData_extension}"
        zip_file_name = f"{event_files_path}/{file_name}{zip_extension}"

        try:
            # create rawdata file.
            with open(rawdata_file_name, "w") as rawdata_file:
                print(f"Start writing RawData: {rawdata_file_name}")
                need_new_line = False
                for rawdata in rawdatas:
                    # newline when already wrote data.
                    if need_new_line:
                        rawdata_file.write('\n')
                    else:
                        need_new_line = True
                    rawdata_json = json.dumps(rawdata)
                    rawdata_file.write(rawdata_json)

            # create event file.
            with open(event_file_name, "w") as event_file:
                print(f"Start writing Event: {event_file_name}")
                event_json = json.dumps(event)
                event_file.write(event_json)

            if not os.path.isfile(event_file_name) or not os.path.isfile(rawdata_file_name):
                # remove exist local files.
                if os.path.isfile(event_file_name):
                    os.remove(event_file_name)
                if os.path.isfile(rawdata_file_name):
                    os.remove(rawdata_file_name)
                continue

            # create zip file.
            with ZipFile(file=zip_file_name, mode='w', compression=ZIP_DEFLATED) as zip_file:
                zip_file.write(rawdata_file_name,
                               os.path.basename(rawdata_file_name))
                zip_file.write(event_file_name,
                               os.path.basename(event_file_name))

            zip_files.append(zip_file_name)
            print("Physiological event migration success.")
        except StopIteration as ex:
            message = f"StopIteration:{ex} line:{ex.__traceback__.tb_lineno}"
            print(message)
        except Exception as ex:
            message = f"Exception: {ex} line:{ex.__traceback__.tb_lineno}"
            print(message)
        finally:
            # remove local files.
            print("Removing temporary files.")
            if os.path.isfile(event_file_name):
                os.remove(event_file_name)
                print(f"Removing event file folder: {event_file_name}.")
            if os.path.isfile(rawdata_file_name):
                os.remove(rawdata_file_name)
                print(f"Removing rawdata file folder: {rawdata_file_name}.")
            socket_message({"process": index+1})

    all_event_folder_name_set = set(all_event_folder_name_list)
    final_zip_filename = f"{uuId}_{int(time.time())}{zip_extension}"
    # create zip file.
    with ZipFile(file=os.path.join(settings.BASE_DIR, 'data', final_zip_filename), mode='w', compression=ZIP_DEFLATED) as zip_file:
        for i in all_event_folder_name_set:
            for root, dirs, files in os.walk(os.path.join(settings.BASE_DIR, 'data', i)):
                for file in files:
                    zip_file.write(os.path.join(root, file),
                                   os.path.basename(os.path.join(root, file)))

    socket_message({"final_filename": final_zip_filename})
    print("End pagckage events.")
    print("Finish!")


def socket_message(message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'websocket_demo',  # room_'name'
        {
            "type": "send_message",
            "message": message,
        }
    )
