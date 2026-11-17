# Практична робота №10
## Kubernetes — практична частина (60 балів)

**Виконав:** Омельчук Максим, ІПЗ-33.

### Мета
Навчитися запускати Node.js-застосунок у Docker та розгортати його в Kubernetes через Minikube.

### 1. Локальний запуск
Використав навчальний проєкт k8s-demo.

Команди:
- `npm install`
- `npm run dev`
- `Invoke-RestMethod http://localhost:8080/api/status`

Результат: сервер запустився на порту 8080, API повернув status: ok.

### 2. Docker
Зібрав Docker-образ та запустив контейнер.

Команди:
- `docker build -t k8s-demo-app:1.0.0 .`
- `docker run -d --rm --name k8s-demo-local -p 8081:8080 -e SECRET_TOKEN=local k8s-demo-app:1.0.0`
- `docker ps`

Результат: контейнер працював, /api/status та /healthz відповідали успішно.

### 3. Kubernetes
Запустив Minikube через Docker.

Команди:
- `minikube start --driver=docker --memory=4096 --cpus=2`
- `minikube status`
- `kubectl get nodes`
- `kubectl get pods -A`

Результат: вузол minikube отримав статус Ready.

### 4. Розгортання
Завантажив Docker-образ до Minikube і застосував готові YAML-маніфести.

Команди:
- `minikube image load k8s-demo-app:1.0.0`
- `kubectl apply -f k8s/namespace.yaml`
- `kubectl apply -f k8s/configmap.yaml`
- `kubectl apply -f k8s/secret.yaml`
- `kubectl apply -f k8s/deployment.yaml`
- `kubectl apply -f k8s/service.yaml`
- `kubectl get deployment,rs,pods,svc -n k8s-demo`

Результат:
- Namespace: k8s-demo.
- Deployment: 2/2 Ready.
- Обидва Pod-и: 1/1 Running.
- Service: ClusterIP, порт 80.

### 5. Перевірка API
Виконав:
`kubectl port-forward svc/k8s-demo-api -n k8s-demo 8082:80`

Перевірив такі адреси:
- /api/status — status: ok, appMode: prod.
- /api/items — Item A, Item B, Item C.
- /api/items?filter=a — HTTP 200.
- /api/slow — HTTP 200, delayMs: 1500.
- /api/error — HTTP 200, повідомлення No error.
- /healthz — ok.
- /ready — status: ready.

### 6. Контрольні запитання

**Чим відрізняються ConfigMap і Secret?**

ConfigMap зберігає звичайні налаштування застосунку. Secret призначений для конфіденційних даних, наприклад токенів і паролів. Для захисту Secret також потрібні належні права доступу.

**Чим відрізняються liveness і readiness?**

Liveness перевіряє, чи контейнер потрібно перезапустити. Readiness визначає, чи готовий Pod отримувати запити через Service.

**Як отримати доступ до сервісу?**

Для локальної перевірки використав kubectl port-forward. Після цього API став доступним на localhost:8082. Для доступу через домен можна використовувати Ingress, але в цій роботі його не налаштовував.

**Як оновлюється конфігурація через ConfigMap?**

Після зміни YAML можна повторно виконати kubectl apply. Якщо налаштування передаються через змінні середовища, Pod-и потрібно перезапустити, наприклад через kubectl rollout restart deployment/k8s-demo-api -n k8s-demo.

### Висновок
Під час практичної роботи я навчився збирати Docker-образ, запускати Minikube та розгортати Node.js API у Kubernetes. Перевірив стан Pod-ів і доступ до сервісу через port-forward. Застосунок працював із двома готовими репліками.

Примітка: у публічні матеріали не додавав робочий файл Secret.

## Фактичні результати kubectl

### Стан Pod-ів

```text
NAME                           READY   STATUS    RESTARTS   AGE
k8s-demo-api-65596c66d-dhk49   1/1     Running   0          18m
k8s-demo-api-65596c66d-dsns8   1/1     Running   0          18m
```

### Deployment, ReplicaSet, Pod та Service

```text
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/k8s-demo-api   2/2     2            2           18m

NAME                                     DESIRED   CURRENT   READY   AGE
replicaset.apps/k8s-demo-api-65596c66d   2         2         2       18m

NAME                               READY   STATUS    RESTARTS   AGE
pod/k8s-demo-api-65596c66d-dhk49   1/1     Running   0          18m
pod/k8s-demo-api-65596c66d-dsns8   1/1     Running   0          18m

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/k8s-demo-api   ClusterIP   10.107.86.162   <none>        80/TCP    18m
```

### Опис Deployment

```text
Name:                   k8s-demo-api
Namespace:              k8s-demo
CreationTimestamp:      Tue, 17 Nov 2026 14:19:03 +0200
Labels:                 <none>
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=k8s-demo-api
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=k8s-demo-api
  Containers:
   k8s-demo-api:
    Image:      k8s-demo-app:1.0.0
    Port:       8080/TCP
    Host Port:  0/TCP
    Limits:
      cpu:     500m
      memory:  512Mi
    Requests:
      cpu:      100m
      memory:   256Mi
    Liveness:   http-get http://:8080/healthz delay=5s timeout=1s period=10s #success=1 #failure=3
    Readiness:  http-get http://:8080/ready delay=3s timeout=1s period=5s #success=1 #failure=3
    Environment Variables from:
      k8s-demo-config  ConfigMap  Optional: false
      k8s-demo-secret  Secret     Optional: false
    Environment:       <none>
    Mounts:            <none>
  Volumes:             <none>
  Node-Selectors:      <none>
  Tolerations:         <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   k8s-demo-api-65596c66d (2/2 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  18m   deployment-controller  Scaled up replica set k8s-demo-api-65596c66d from 0 to 2
```

### Логи застосунку

```text
[2026-11-17T12:37:00.669Z] GET /ready 200 1ms
[2026-11-17T12:37:04.268Z] GET /healthz 200 0ms
[2026-11-17T12:37:05.668Z] GET /ready 200 0ms
[2026-11-17T12:37:10.670Z] GET /ready 200 1ms
[2026-11-17T12:37:14.268Z] GET /healthz 200 1ms
[2026-11-17T12:37:15.669Z] GET /ready 200 0ms
[2026-11-17T12:37:20.670Z] GET /ready 200 1ms
[2026-11-17T12:37:24.268Z] GET /healthz 200 0ms
[2026-11-17T12:37:25.669Z] GET /ready 200 0ms
[2026-11-17T12:37:30.670Z] GET /ready 200 1ms
[2026-11-17T12:37:34.268Z] GET /healthz 200 1ms
[2026-11-17T12:37:35.670Z] GET /ready 200 1ms
[2026-11-17T12:37:40.670Z] GET /ready 200 1ms
[2026-11-17T12:37:44.269Z] GET /healthz 200 1ms
[2026-11-17T12:37:45.669Z] GET /ready 200 1ms
```