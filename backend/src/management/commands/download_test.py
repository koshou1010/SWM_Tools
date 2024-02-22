from django.core.management import BaseCommand
import sys
import subprocess
from django.conf import settings
import pymongo
import requests, json, time, random


class Command(BaseCommand):
    def handle(self, *args, **options):
        print('start')
        client = pymongo.MongoClient("mongodb://koshou:ZjNrOTB5OGc0aG91aT0tMHVpOXlnaDQ4OTNnai00Mw%3D%3D@34.81.244.14:27017/?authMechanism=DEFAULT&authSource=rawdata_db")
        db = client["rawdata_db"]
        collection = db["raw_data"]
        _query ={"uuId":"1811","tt":{ "$gte": 1704816000000 ,"$lte":1704877200000}}
        mydoc = list(collection.find(_query))
        print(len(mydoc))

        # end_point = 'http://127.0.0.1:8001/download_rawdata/'
        # r = requests.post(end_point, json={"status":True})
        # res = json.loads(r.text)
        # print(res)
