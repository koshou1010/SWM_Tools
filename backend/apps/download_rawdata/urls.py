# projects/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path("query/", QueryData.as_view()),
    path("download/", DownloadData.as_view()),
]
