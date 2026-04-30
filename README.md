# Bonds filter (Tinkoff)

Подбор облигаций для покупки доступных у брокера Тинькофф.

![screen1.png](assets/screen1.png)

Часть данных собирается из [Tinkoff Invest API](https://tinkoff.github.io/investAPI/), часть
из [API Московской биржи](https://www.moex.com/a2193).

⚠ Поскольку сбор данных занимает долгое время, сервер обновляет снимок по расписанию (раз в 4 часа), хранит его в
SQLite и отдает поиск, фильтрацию, сортировку и пагинацию с backend, не выгружая весь список облигаций в браузер.

## Доступ без установки
Текущая версия рабочего приложения доступна по адресу [https://bonds.rame0.ru/](https://bonds.rame0.ru/).

## Установка

Из исходного кода:

```bash
# Загрузка исходного кода
$ git clone https://github.com/rame0/bonds-filter-tinkoff.git
```

## Запуск

Варианты запуска:

* [Docker](#docker)
* [Исходный код](#запуск-из-исходников)
* [Kubernetes](#kubernetes)

> На данный момент рекомендуется запускать из исходников.
> Запуск из Docker сейчас требует наличие установленного и настроенного `Traefik`.

### Предварительная настройка

В папке `server`, скопируйте файл `.env.example` в `.env` и откройте его в любом текстовом редакторе.

Для работы приложения нужно получить токен для доступа к [Tinkoff Invest API](https://tinkoff.github.io/investAPI/).
Для этого нужно:

1. Зарегистрироваться в [Tinkoff Invest](https://www.tinkoff.ru/invest/).
2. Перейти в [личный кабинет](https://www.tinkoff.ru/invest/settings/).
3. В самом низу страницы будет раздел "Токены Tinkoff Invest API"
4. Нажать на кнопку "Создать токен".
5. В открывшемся окне выбрать счет (или оставить по умолчанию "Все счета")
    * Для большей безопасности, можно создать отдельный пустой счет и использовать его, поскольку приложению нужно
      только API. Ему не нужен доступ к портфелю и операциям.
6. Поставить галочку на "Только для чтения" (это важно, чтобы приложение точно не могло ни чего делать со счетом)
7. Нажать на кнопку "Выпустить токен"
8. В открывшемся окне нажмите "Скопировать токен"

Этот токен нужно вставить в открытый файл `.env`. В свойство `TINKOFF_API_TOKEN`. Должно получиться так:

```dotenv
# Тинькоф API токен
TINKOFF_API_TOKEN=t.j6Ij**************tmQDoD4-J1LJc8f9sFvC7HWb****************************************UCEzA

# ID боевого счете
REAL_ACCOUNT_ID=
# ID счета в песочнице
SANDBOX_ACCOUNT_ID=
```

Все остальные свойства можно не заполнять. В данной версии они не нужны.

Сохраните и закройте файл.

## Запуск из исходников

### Требования

* [Bun](https://bun.sh/) 1.3.7.

### Установка зависимостей

Переходим в папку с проектом:

```bash
$ cd bonds-filter-tinkoff
```

Устанавливаем зависимости сервера:

```bash
$ cd server && bun install && cd ..
```

Устанавливаем зависимости UI:

```bash
$ cd UI && bun install && cd ..
```

### Запуск

Для запуска нужно открыть 2 окна терминала и в каждом из них перейти в папку с проектом.

В первом окне запускаем сервер в dev-режиме:

```bash
$ cd server && bun run dev
```

Результат выполнения команды должен быть примерно такой:

```log
> bonds-filter-tinkoff-server@0.2.3 dev /home/ra/projects/bonds-filter-tinkoff/server
> bun ./node_modules/moleculer/bin/moleculer-runner.js --hot --repl --config moleculer.config.ts src/services/{**,**/**,**/**/**}/*.service.ts

[2023-08-13T13:04:08.740Z] INFO  ra-243915/BROKER: Moleculer v0.14.28 is starting...
...
...
[2023-08-13T13:04:08.953Z] INFO  ra-243915/$NODE: Service '$node' started.
[2023-08-13T13:04:08.953Z] INFO  ra-243915/BONDS: Service 'bonds' started.
[2023-08-13T13:04:08.953Z] INFO  ra-243915/API: API Gateway listening on http://0.0.0.0:3000
...
...
[2023-08-13T13:04:08.955Z] INFO  ra-243915/BROKER: ✔ ServiceBroker with 3 service(s) started successfully in 9ms.
[2023-08-13T13:04:09.457Z] DEBUG ra-243915/BROKER: Broadcast '$api.aliases.regenerated' event.
[2023-08-13T13:04:09.457Z] DEBUG ra-243915/BROKER: Broadcast '$api.aliases.regenerated' local event.


```

Во втором окне запускаем UI:

```bash
$ cd UI && bun run dev
```

Результат выполнения команды должен быть примерно такой:

```log
> bonds-filter-tinkoff-ui@0.2.3 dev /home/ra/projects/bonds-filter-tinkoff/UI
> vite

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Интерфейс доступен по адресу указанному в консоли (в примере выше это `http://localhost:5173/`).

## Docker

### Требования

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* [Traefik](https://doc.traefik.io/traefik/)

### Установка

! Текущая реализация требует наличия `Traefik`. В будущем это будет исправлено.

Нужно добавить в файл `/etc/hosts` запись:

```text
127.0.0.1       bonds-filter.local
```

Переходим в папку с проектом:

```bash
$ cd bonds-filter-tinkoff
```

Запускаем:

```bash
docker-compose up --build
```

После успешной сборки и запуска контейнеров, интерфейс будет доступен по
адресу [http://bonds-filter.local/](http://bonds-filter.local/).

## Kubernetes

В корне проекта есть файл `kube.example.yaml`. В нем описаны все необходимые ресурсы для запуска приложения в
Kubernetes.

Также, в настройках `ingress` закомментированы примеры настроек для `Traefik`. 

### Настройка
* Заменить `<YOUR_API_KEY>` на ваш ключ API Tinkoff.
* Заменить в `ingress` с `<YOUR_HOST>` на свой домен. 
