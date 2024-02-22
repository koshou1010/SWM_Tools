# data/views.py
from django.conf import settings
from django.http import HttpResponse, FileResponse, JsonResponse
from django.views import View
import json
from .models import *
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import time
import os
from .utils import *
import threading
from io import BytesIO


@method_decorator(csrf_exempt, name='dispatch')
class QueryData(View):
    def get(self, request):
        uuId = str(request.GET.get('uuId'))
        start_tt = int(request.GET.get('start_tt'))

        mongo_manager = MongoManager()
        events = mongo_manager.get_events_by_current_ts(
            uuId=uuId, start_tt=start_tt)
        if not events:
            return JsonResponse({"status": False, "data": []})
        ts_list = []
        ts_list.append(events[0]['startTT'])
        ts_list.append(events[0]['endTT'])
        return JsonResponse({"status": True, "data": ts_list, "startswith_str": str(int(time.time()*1000))})

    def post(self, request):
        data = json.loads(request.body)
        mongo_manager = MongoManager()
        raw_data = mongo_manager.get_rawdata_by_tt(data)
        if not raw_data:
            return JsonResponse({"status": False, "data": []})
        dt_list = []
        for i in raw_data:
            dt_list.append(str(datetime.fromtimestamp(i['tt']/1000).date()))
        dt_set_list = list(set(dt_list))
        return JsonResponse({"status": True, "data": dt_set_list, "startswith_str": str(int(time.time()*1000))})


@method_decorator(csrf_exempt, name='dispatch')
class DownloadData(View):

    def get(self, request):
        filename = request.GET.get('filename')
        zip_file_path = os.path.join(settings.BASE_DIR, 'data', filename)
        if os.path.exists(zip_file_path):
            with open(zip_file_path, 'rb') as f:
                file_data = f.read()
            file_data_io = BytesIO(file_data)
            file_name = os.path.basename(zip_file_path)
            response = FileResponse(
                file_data_io, content_type='application/zip')
            response['Content-Disposition'] = "attachment;filename=test.zip"
            return response
        else:
            return HttpResponse(status=404)

    def post(self, request):
        data = json.loads(request.body)
        os.makedirs(os.path.join(settings.BASE_DIR, 'data'), exist_ok=True)
        if data['byEvent']:
            mongo_manager = MongoManager()
            events = mongo_manager.get_events_by_current_ts(
                uuId=str(data['uuId']), start_tt=int(data['start_ts']))
            progress_bar_max = 1
        else:
            events = get_package_event_length(data)
            progress_bar_max = len(events)
        timer_thread = threading.Thread(
            target=start_package_rawdata_event, args=(data, events,))
        timer_thread.start()
        return JsonResponse({"status": True, "progress_bar_max": progress_bar_max})
