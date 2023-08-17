## Changelog
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
