# Настройка окружения

Для удобства разработки используется общее ядро платформы 1С-Битрикс.
Поскольку таскать за собой ядро из проекта в проект довольно накладно, то это решение проблемы.

По сути в проектах нам требуется изменять настройки для подключения к базе данных.
Эти настройки вынесены в папку /config/ проекта

## Настройка общей папки
Выносим куда нибудь в удобное место вашей системы папку bitrix
Создаем симлинк на нее в папке проекта
Симлинк должен называться bitrix и лежать в корне веб части

Если вы взяли чистое ядро битрикса, то нужно изменить файлы настроек следующим образом:
* Файл /bitrix/.settings.php
В `начале` файла после открытия тега `<?php` на новой строке вставьте следующие строки

```php
$config = include($_SERVER['DOCUMENT_ROOT'] . '/../config/.settings.php');
if (is_array($config)) {
    return $config;
}
```

* Файл /bitrix/php_interface/dbconn.php
В `конце` файла перед закрытием тега `?>` на новой строке вставьте следующие строки

```php
include($_SERVER['DOCUMENT_ROOT'] . '/../config/dbconn.php');
```

## Настройка подключения к базе данных для проекта
Подключение к базе данных задается в 2-х файлах
Файл dbconn.php - Настройки для старого ядра битрикса
Файл .settings.php - Настройки для нового ядра D7 битрикса

Настройки переопределются для каждого проекта в папке /config/
/config/dbconn.php и /config/.settings.php соответственно

Данные файлы должны находится в git ignore.
В качестве шаблона добавлены файлы
* /config/.settings.example.php
* /config/dbconn.example.php

Их необходимо скопировать и переименовать в
* /config/dbconn.php
* /config/.settings.php

Меняем в файлах настройки соединения и будет вам счастье.


# Если не понятно, что за ерезь написана выше, то делаем по шагам:
* Открываем папку с текущим проектом и создаем на верхнем уровне папку config
* Копируем в нее файлы

* `dbconn.php` - берем из /www/bitrix/php_interface/dbconn.php
* `.settings.php` - берем из /www/bitrix/.settings.php

* Перемещаем папку bitrix куда нибудь, например к ~/Documents/
Добавляем в файл ~/Documents/bitrix/.settings.php в начале строчку

```php
$config = include($_SERVER['DOCUMENT_ROOT'] . '/../config/.settings.php');
if (is_array($config)) {
    return $config;
}
```

До

```php
<?php
return array (
  'utf_mode' =>
  .....

```

После

```php
<?php
$config = include($_SERVER['DOCUMENT_ROOT'] . '/../config/.settings.php');
if (is_array($config)) {
    return $config;
}

return array (
  'utf_mode' =>
  .....

```

* Добавляем в файл ~/Documents/bitrix/dbconn.php в конце строчку

```php
include($_SERVER['DOCUMENT_ROOT'] . '/../config/dbconn.php');
```

До

```php
<?php
......
@ini_set("memory_limit", "512M");
define("BX_DISABLE_INDEX_PAGE", true);
?>
```

После

```php
<?php
......
@ini_set("memory_limit", "512M");
define("BX_DISABLE_INDEX_PAGE", true);

include($_SERVER['DOCUMENT_ROOT'] . '/../config/dbconn.php');
?>
```


### Создаем симлинк bitrix в папке проекта (www/bitrix) на нашу перенесенную папку ~/Documents/bitrix

* Для Linux это команда `ln -s путь_к_реальной_папке путь_расположения_симлинка`
* Для нашего примера `ln -s ~/Documents/bitrix /some_project/www/bitrix`

 Готово.

 `При создании симлинка убедитесь что папки www/bitrix в проекте нет.`


