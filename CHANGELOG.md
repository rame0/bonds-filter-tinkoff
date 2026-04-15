## Changelog
### [0.2.6](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.5...v0.2.6) (2026-04-15)


### Bug Fixes

* **ui:** исключить external интерфейсы из type-check ([7a5f609](https://github.com/rame0/bonds-filter-tinkoff/commit/7a5f609bf0d5bbefd83a738a928de9f5fab19b30))

### [0.2.5](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.4...v0.2.5) (2026-04-14)


### Bug Fixes

* **ui:** отвязать типы интерфейса от SDK ([0e77d2f](https://github.com/rame0/bonds-filter-tinkoff/commit/0e77d2f3fab7a510c99a75ea07cff8a62c80ec5d))

### [0.2.4](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.3...v0.2.4) (2026-04-14)


### Features

* made first 2 columns fixed to the left ([2bc16c4](https://github.com/rame0/bonds-filter-tinkoff/commit/2bc16c4cadfa924066d2663c342e6a5fb871feea))
* **server:** добавить TypeORM-раннер для Bun ([de61875](https://github.com/rame0/bonds-filter-tinkoff/commit/de618750e092eb173d3ac0638cbbb6fe7d622e6a))
* **ui:** увеличить радиусы и размеры в тймной теме, заменить светлую тему на autumn ([98c1734](https://github.com/rame0/bonds-filter-tinkoff/commit/98c1734f2d682aba89e1f93b9186306cbf6c1668))
* update UI packages ([08d3040](https://github.com/rame0/bonds-filter-tinkoff/commit/08d3040815e1d2993aad2a282336e393ecabd18c))
* добавил возможность вставки счетчика метрики через .env файл ([de63d4c](https://github.com/rame0/bonds-filter-tinkoff/commit/de63d4c586aa4bdfbbb0fcc6f3a841d7de8db41c))
* поиск по названию тикеру или figi ([aa506ba](https://github.com/rame0/bonds-filter-tinkoff/commit/aa506ba97a14af3156741b97ffc2ff2c1d68cb87))


### Bug Fixes

* **docker:** исключил env-файлы из контекста сборки ([e16c590](https://github.com/rame0/bonds-filter-tinkoff/commit/e16c59038ec1ec10f2ca2e171ac862e605d3f6c4))
* **server:** добавил fail-fast токена и logLevel из env ([eb30778](https://github.com/rame0/bonds-filter-tinkoff/commit/eb3077804bcbb7973c14de7639f383d1096e1882))
* **server:** добавил single-flight сборки и безопасные ошибки API ([d43fadd](https://github.com/rame0/bonds-filter-tinkoff/commit/d43fadd80ebc4712dfe03b2b09acfba951bcb14f))
* **server:** добавил таймауты и ретраи для запросов к MOEX ([9e8a8f2](https://github.com/rame0/bonds-filter-tinkoff/commit/9e8a8f2b48260540cde8718de53b0423040afb74))
* **server:** добавить fallback при пустом кэше облигаций ([e260aeb](https://github.com/rame0/bonds-filter-tinkoff/commit/e260aeb122cc8da6d338d444e8d7cb3e49f5dd63))
* **server:** исправить расписание cron и защитить от overlap ([976c4ce](https://github.com/rame0/bonds-filter-tinkoff/commit/976c4ce31e379816554ff57f132ae45507ca0c65))
* **server:** исправить расчет суммы купонов за год ([ef917f9](https://github.com/rame0/bonds-filter-tinkoff/commit/ef917f926d4b561ccacae42bf6ad659560911f28))
* **server:** исправление зависания getMoexData, обработка ошибок и лимит купонов ([234fcf5](https://github.com/rame0/bonds-filter-tinkoff/commit/234fcf5f3eae25b2739e3f4fff768989cee5b3bc))
* **server:** перенес API токен в Secret в примере Kubernetes ([c1f57cf](https://github.com/rame0/bonds-filter-tinkoff/commit/c1f57cfb616c1ab3742f0518ead8643478d48328))
* **server:** повысить устойчивость сбора данных MOEX ([90bec3b](https://github.com/rame0/bonds-filter-tinkoff/commit/90bec3b805baef9f56ce25eaf5a61d3c93e65329))
* **server:** привести logLevel к типу Moleculer ([147aa10](https://github.com/rame0/bonds-filter-tinkoff/commit/147aa10abd66e19f6a2ac0fab66d26c618717047))
* **server:** сделать dev-запуск Bun совместимым с Moleculer ([08f5b55](https://github.com/rame0/bonds-filter-tinkoff/commit/08f5b551864f4e7d2fb817e11521b1ff408c0fb2))
* **server:** централизовать округление чисел в API облигаций ([e9aed0f](https://github.com/rame0/bonds-filter-tinkoff/commit/e9aed0fa27cf7313c68876e4660bbfa3c8588c10))
* **ui:** filter range inputs vertical layout and add minus/plus stepper buttons ([cc8c4c7](https://github.com/rame0/bonds-filter-tinkoff/commit/cc8c4c7610ed2bcae6e2720ea0c9a727620eec66))
* **UI:** resolve tsconfig extends path for @vue/tsconfig ([87a39bd](https://github.com/rame0/bonds-filter-tinkoff/commit/87a39bd03dbfb2de75d312ea88b81571fd091985))
* **ui:** tbody в PortfolioStats, шире колонка Свойства в таблице ([e739e81](https://github.com/rame0/bonds-filter-tinkoff/commit/e739e810f964d4fcb9d7c8800840625f6ba50aef))
* **ui:** вынос директив Tailwind в отдельный CSS из-за порядка [@use](https://github.com/use) в Sass ([9d6a2ae](https://github.com/rame0/bonds-filter-tinkoff/commit/9d6a2aef894ca9473a4ff3d8b08b2e5fc757a1e4))
* **ui:** выпадающий мультиселект с возможностью не выбирать ничего ([97f3cb0](https://github.com/rame0/bonds-filter-tinkoff/commit/97f3cb0611bb48e1081ab75e4acae36e7a9d8350))
* **ui:** выровнять блоки фильтров и уменьшить кнопки опций ([85c3fa7](https://github.com/rame0/bonds-filter-tinkoff/commit/85c3fa7550ccb8dfa933aea22b687d6286148997))
* **ui:** исправить высоту карточек/таблиц и переключить тему на autumn ([d341dfe](https://github.com/rame0/bonds-filter-tinkoff/commit/d341dfeff8653f7f7fa0f491bbfb29544a984c3d))
* **ui:** показывать текст в селекте Купонов для числовых опций ([38065e1](https://github.com/rame0/bonds-filter-tinkoff/commit/38065e180121cccfe9cc791a14013cf433f967c0))
* **ui:** починить тёмную тему и двухколоночный layout ([0e33172](https://github.com/rame0/bonds-filter-tinkoff/commit/0e3317201dce394d7162bfac57b362eb8b7864b6))
* **ui:** привести BondOptionsChecks к шаблону checkboxes/reset ([8a83932](https://github.com/rame0/bonds-filter-tinkoff/commit/8a8393272d438368663553566951c8856b9fe116))
* **ui:** убрать filter-класс из BondOptionsChecks ([8e10242](https://github.com/rame0/bonds-filter-tinkoff/commit/8e102428922ef27588fce99136bae2155b9dc7ef))
* **ui:** убрать h-auto у кнопки BondOptionsSelect ([f515b91](https://github.com/rame0/bonds-filter-tinkoff/commit/f515b915487b4126fedbbc4e8d1169a98c8e62e4))
* переименовал колонку "Дюрация" -> в "Погашение" (от "Дата погашения") ([bbb0037](https://github.com/rame0/bonds-filter-tinkoff/commit/bbb00372434fe96f1aa2d8a92e135f2c3adfbcb3))
* сломанный симлинк ([cdf45b3](https://github.com/rame0/bonds-filter-tinkoff/commit/cdf45b3169146ba493c23db6b3bd3a62a23f13b0))

### [0.2.4](https://github.com/rame0/bonds-filter-tinkoff/compare/v0.2.3...v0.2.4) (2026-04-14)


### Features

* made first 2 columns fixed to the left ([2bc16c4](https://github.com/rame0/bonds-filter-tinkoff/commit/2bc16c4cadfa924066d2663c342e6a5fb871feea))
* **server:** добавить TypeORM-раннер для Bun ([de61875](https://github.com/rame0/bonds-filter-tinkoff/commit/de618750e092eb173d3ac0638cbbb6fe7d622e6a))
* **ui:** увеличить радиусы и размеры в тймной теме, заменить светлую тему на autumn ([98c1734](https://github.com/rame0/bonds-filter-tinkoff/commit/98c1734f2d682aba89e1f93b9186306cbf6c1668))
* update UI packages ([08d3040](https://github.com/rame0/bonds-filter-tinkoff/commit/08d3040815e1d2993aad2a282336e393ecabd18c))
* добавил возможность вставки счетчика метрики через .env файл ([de63d4c](https://github.com/rame0/bonds-filter-tinkoff/commit/de63d4c586aa4bdfbbb0fcc6f3a841d7de8db41c))
* поиск по названию тикеру или figi ([aa506ba](https://github.com/rame0/bonds-filter-tinkoff/commit/aa506ba97a14af3156741b97ffc2ff2c1d68cb87))


### Bug Fixes

* **docker:** исключил env-файлы из контекста сборки ([e16c590](https://github.com/rame0/bonds-filter-tinkoff/commit/e16c59038ec1ec10f2ca2e171ac862e605d3f6c4))
* **server:** добавил fail-fast токена и logLevel из env ([eb30778](https://github.com/rame0/bonds-filter-tinkoff/commit/eb3077804bcbb7973c14de7639f383d1096e1882))
* **server:** добавил single-flight сборки и безопасные ошибки API ([d43fadd](https://github.com/rame0/bonds-filter-tinkoff/commit/d43fadd80ebc4712dfe03b2b09acfba951bcb14f))
* **server:** добавил таймауты и ретраи для запросов к MOEX ([9e8a8f2](https://github.com/rame0/bonds-filter-tinkoff/commit/9e8a8f2b48260540cde8718de53b0423040afb74))
* **server:** добавить fallback при пустом кэше облигаций ([e260aeb](https://github.com/rame0/bonds-filter-tinkoff/commit/e260aeb122cc8da6d338d444e8d7cb3e49f5dd63))
* **server:** исправить расписание cron и защитить от overlap ([976c4ce](https://github.com/rame0/bonds-filter-tinkoff/commit/976c4ce31e379816554ff57f132ae45507ca0c65))
* **server:** исправить расчет суммы купонов за год ([ef917f9](https://github.com/rame0/bonds-filter-tinkoff/commit/ef917f926d4b561ccacae42bf6ad659560911f28))
* **server:** исправление зависания getMoexData, обработка ошибок и лимит купонов ([234fcf5](https://github.com/rame0/bonds-filter-tinkoff/commit/234fcf5f3eae25b2739e3f4fff768989cee5b3bc))
* **server:** перенес API токен в Secret в примере Kubernetes ([c1f57cf](https://github.com/rame0/bonds-filter-tinkoff/commit/c1f57cfb616c1ab3742f0518ead8643478d48328))
* **server:** повысить устойчивость сбора данных MOEX ([90bec3b](https://github.com/rame0/bonds-filter-tinkoff/commit/90bec3b805baef9f56ce25eaf5a61d3c93e65329))
* **server:** привести logLevel к типу Moleculer ([147aa10](https://github.com/rame0/bonds-filter-tinkoff/commit/147aa10abd66e19f6a2ac0fab66d26c618717047))
* **server:** сделать dev-запуск Bun совместимым с Moleculer ([08f5b55](https://github.com/rame0/bonds-filter-tinkoff/commit/08f5b551864f4e7d2fb817e11521b1ff408c0fb2))
* **server:** централизовать округление чисел в API облигаций ([e9aed0f](https://github.com/rame0/bonds-filter-tinkoff/commit/e9aed0fa27cf7313c68876e4660bbfa3c8588c10))
* **ui:** filter range inputs vertical layout and add minus/plus stepper buttons ([cc8c4c7](https://github.com/rame0/bonds-filter-tinkoff/commit/cc8c4c7610ed2bcae6e2720ea0c9a727620eec66))
* **UI:** resolve tsconfig extends path for @vue/tsconfig ([87a39bd](https://github.com/rame0/bonds-filter-tinkoff/commit/87a39bd03dbfb2de75d312ea88b81571fd091985))
* **ui:** tbody в PortfolioStats, шире колонка Свойства в таблице ([e739e81](https://github.com/rame0/bonds-filter-tinkoff/commit/e739e810f964d4fcb9d7c8800840625f6ba50aef))
* **ui:** вынос директив Tailwind в отдельный CSS из-за порядка [@use](https://github.com/use) в Sass ([9d6a2ae](https://github.com/rame0/bonds-filter-tinkoff/commit/9d6a2aef894ca9473a4ff3d8b08b2e5fc757a1e4))
* **ui:** выпадающий мультиселект с возможностью не выбирать ничего ([97f3cb0](https://github.com/rame0/bonds-filter-tinkoff/commit/97f3cb0611bb48e1081ab75e4acae36e7a9d8350))
* **ui:** выровнять блоки фильтров и уменьшить кнопки опций ([85c3fa7](https://github.com/rame0/bonds-filter-tinkoff/commit/85c3fa7550ccb8dfa933aea22b687d6286148997))
* **ui:** исправить высоту карточек/таблиц и переключить тему на autumn ([d341dfe](https://github.com/rame0/bonds-filter-tinkoff/commit/d341dfeff8653f7f7fa0f491bbfb29544a984c3d))
* **ui:** показывать текст в селекте Купонов для числовых опций ([38065e1](https://github.com/rame0/bonds-filter-tinkoff/commit/38065e180121cccfe9cc791a14013cf433f967c0))
* **ui:** починить тёмную тему и двухколоночный layout ([0e33172](https://github.com/rame0/bonds-filter-tinkoff/commit/0e3317201dce394d7162bfac57b362eb8b7864b6))
* **ui:** привести BondOptionsChecks к шаблону checkboxes/reset ([8a83932](https://github.com/rame0/bonds-filter-tinkoff/commit/8a8393272d438368663553566951c8856b9fe116))
* **ui:** убрать filter-класс из BondOptionsChecks ([8e10242](https://github.com/rame0/bonds-filter-tinkoff/commit/8e102428922ef27588fce99136bae2155b9dc7ef))
* **ui:** убрать h-auto у кнопки BondOptionsSelect ([f515b91](https://github.com/rame0/bonds-filter-tinkoff/commit/f515b915487b4126fedbbc4e8d1169a98c8e62e4))
* переименовал колонку "Дюрация" -> в "Погашение" (от "Дата погашения") ([bbb0037](https://github.com/rame0/bonds-filter-tinkoff/commit/bbb00372434fe96f1aa2d8a92e135f2c3adfbcb3))
* сломанный симлинк ([cdf45b3](https://github.com/rame0/bonds-filter-tinkoff/commit/cdf45b3169146ba493c23db6b3bd3a62a23f13b0))

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
