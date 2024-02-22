from django.http import HttpResponse, FileResponse, JsonResponse, HttpResponseRedirect
from django.views import View
from django.conf import settings

class DashboardSPA(View):
    def get(self, request, *args, **kwargs):
        return FileResponse(open(settings.BASE_DIR / "../frontend/dist/frontend/index.html", 'rb'))
