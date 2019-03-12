# builds
### es6-modules
 * Сборка компилирует sass-файлы в один стилевой файл
 * Минимизирует все необходимые файлы (но не изображения)
 * Соединяет все скрипты в один main.js файл с помощью подулей (import/export)
 * Подключает babel/babel-polyfill

#### Для подключения фильтров на страницу:

- В pug-шаблоне страницы подключаем стили для кастомизации селектов в блок meta

		block meta
  	      link(href="libs/nice-select/nice-select.css", rel="stylesheet")`

- А также скриты библиотек и полифилл в блоке scripts

		block scripts
          script(src="https://unpkg.com/formdata-polyfill")
          script(src="libs/jquery/jquery-3.3.1.min.js")
          script(src="libs/nice-select/nice-select.js")
 
 - Работа фильтров подключается в файле main.js

		if (document.querySelector(`.filter`)) {
          new Filter();
          new FilterChange();
		}
        
 - Фильтр с кастомными селектами добавляется на страницу с помощью pug-миксина filter с двумя аргументами:
 	- json-данные вида:
            `{
            "name": "имя фильтра",
            "value": "Отображаемое на странице название фильтра",
            "options": [массив со значениями для элементов option фильтра]
            }`
    - дополнительное имя класса для переопределения стилей фильтра

			+filter(data.playbillFilterData, 'playbill-page-header')
            
 - Символьный фильтр добавляется на страницу с помощью pug-миксина character-filter с тремя аргументами:
 	- массив с символьными данными или число, если это фильтр дней месяца
 	- дополнительное имя класса для переопределения стилей фильтра
 	- (необязательный) сегодняшний день месяца в числовой форме, если это фильтр дней месяца 

			+character-filter(31, 'playbill', 13)
