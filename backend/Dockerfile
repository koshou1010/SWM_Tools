# 使用官方Python運行時作為父圖像
FROM python:3.10

# 設置工作目錄
WORKDIR /usr/src/app

# 將當前目錄內容複製到容器中的工作目錄
COPY . .

# 安裝requirements.txt中的所有依賴
RUN pip install --no-cache-dir -r requirements.txt

# 對外暴露端口8000
EXPOSE 8000

# 定義容器啟動時執行的命令
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]