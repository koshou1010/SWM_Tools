# SWM_Tools

SWM_Tools is a develop tools, made by Angular12 + Django4.2

## Table of Contents
- [Usage](#Usage) 
    - [Setup](#Setup)
    - [Containerization](#Containerization)  
# Usage
```
git clone
cd SWM_Tools
```

## Setup
### backend
#### Activate python venv
```
pip install -r requirements.txt
cd backend
```
#### Create .env file in ./src
```
python manage.py runserver     
```
ASGI/Daphne server at <http://127.0.0.1:8000/>
### frontend
```
cd frontend
npm install
npm start
```
web server at <http://localhost:4200/>

## Containerization
### Build image
``` 
docker-compose build
```
## 1. use docker container
```
docker run {$image_name}
```
## 2. use kubernetes
###  Push image
```
docker login
docker push {$image_name}
```
### Apply deployment
```
kubectl apply -f .\k8s\backend.yaml
kubectl apply -f .\k8s\frontend.yaml
```

## Kubernetes Dashboard
### Installation, [ref](https://ciao-chung.com/page/article/kubernetes-dashboard-manage-cluster)
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```
### Create admin user
```
# .\k8s\dashboard-adminuser.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
```

### Apply user and role binding
```
kubectl apply -f .\k8s\dashboard-adminuser.yaml
```
### Get admin user token
```
kubectl -n kubernetes-dashboard create token admin-user
```
### Start Dashboard
```
kubectl proxy
```

### Enter dashboard <http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login>