## Changelog
### [0.2.3](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.2...v0.2.3) (2023-08-18)


### Bug Fixes

* **server:** исправил базовые образы docker ([182fc46](https://github.com/rame0/bonds-filter-tinkoff/commit/182fc4688794768cf049317bad5ef8d22ceaa537))
* **server:** перенес указание `NODE_ENV` в `modules-fetch-stage` ([d8e3e6e](https://github.com/rame0/bonds-filter-tinkoff/commit/d8e3e6e2020686dbb5488d20a7a33776d04c8ed0))
* **ui:** исправил базовые образы docker ([d73284c](https://github.com/rame0/bonds-filter-tinkoff/commit/d73284c5235a6ffab76891e5b3abf14267afa477))
* исправил название свойства ([e00552b](https://github.com/rame0/bonds-filter-tinkoff/commit/e00552bb79d16c5aa99afa4daa3a6b04c915f7b6))

### [0.2.2](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.1...v0.2.2) (2023-08-18)


### Bug Fixes

* добавил/поправил `.dockerignore` файлы ([77bccfb](https://github.com/rame0/bonds-filter-tinkoff/commit/77bccfb427af295f5c59d8b03bbe9caf42e16e56))
* исправил сборку докер образов ([fed4e6f](https://github.com/rame0/bonds-filter-tinkoff/commit/fed4e6fddabea71fcddf2a7571fa6a57e4aed758)), closes [#21](https://github.com/rame0/bonds-filter-tinkoff/issues/21)
* переписал `docker-ci.yaml` и `docker-compose.yaml` для соответствия текущим докерфайлам ([d704c86](https://github.com/rame0/bonds-filter-tinkoff/commit/d704c86edf1fba5b37c927b616fb014060cee7c5)), closes [#21](https://github.com/rame0/bonds-filter-tinkoff/issues/21)
* создал симлинк в UI на интерфейсы из server ([768f7a8](https://github.com/rame0/bonds-filter-tinkoff/commit/768f7a8bc664f095d62fb591272030da1ea1f3dc))

### [0.2.1](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.0...v0.2.1) (2023-08-17)


### Bug Fixes

* **server:** корректный импорт типа ([e4f89f5](https://github.com/rame0/bonds-filter-tinkoff/commit/e4f89f5cf77ef73c2cb5aae55f42a5e0f2b184fa))
* **server:** удалил из зависимостей сервера `@types/cron` вызывавший ошибку при сборке ([40cb590](https://github.com/rame0/bonds-filter-tinkoff/commit/40cb590c88f445fc584adfc2d1ebaa7c45215d11))

## [0.2.0](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.1.0...v0.2.0) (2023-08-17)


### Features

* **server:** перенес сбор данных об облигациях в отдельный сервис ([65a6a88](https://github.com/rame0/bonds-filter-tinkoff/commit/65a6a885876e02c451451b1d61456ee162c5c487))


### Bug Fixes

* `engine` and `@types/node` versions ([48399f8](https://github.com/rame0/bonds-filter-tinkoff/commit/48399f83adc4c3d674fc23841185a50e6a4d1924))
* **server:** добавил проверку наличия валидных данных в кеше при перезапуске сервереа ([a9df7ee](https://github.com/rame0/bonds-filter-tinkoff/commit/a9df7ee9b606d1a78613fe1b889d660dffef2611))
* **server:** убрал некорректный вызов логгера ([3d624bc](https://github.com/rame0/bonds-filter-tinkoff/commit/3d624bc1dfe5001ad91b9f47b4695e418c870c3f))
* исправил `package.json` в `UI` и `server` ([acc4c08](https://github.com/rame0/bonds-filter-tinkoff/commit/acc4c086bd7752dcb14e47b58b17c289f5011027))
