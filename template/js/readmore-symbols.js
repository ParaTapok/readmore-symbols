'use strict';


(function($) {
    var ENDCHARS,
        TAGDIC,
        TMPL;

    if ($.fn.readmore) return;
    
    // символы окончания слова
    ENDCHARS = [' ', '.', ',', ';', '!', '?'];

    // словарь тегов, требуемых закрытия
    TAGDIC = ['strong', 'b', 'em', 'i', 'a', 'u', 'sup', 'sub', 'p', 'span', 'div', 'font', 'blockquote', 'address', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dd', 'dt'];

    // шаблон
    TMPL = function(opt) {
        return '<div class="b-readmore"><a class="b-readmore__toggle" href="#"><span class="b-readmore__link b-readmore__open">' + opt.textOpen + '</span><span class="b-readmore__link b-readmore__close">' + opt.textClose + '</span></a></div>';
    };

    $.fn.readmore = function(o) {
        var elem,
            opt,
            RDM;

        if (this.length == 0) return this;

        // применяем плагин ко всем элементам выборки
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).readmore(o);
                }
            );
        }

        elem = this;

        // мержим переданные параметры с дефолтными
        opt = $.extend(true, {}, $.fn.readmore.defaults, o);

        RDM = (function() {
            var person = {},
                common = {},
                data;

            // инициализация элементов
            person.initData = function() {
                var html = elem.html();

                // очищаем html от лишних пробелов
                html = $.trim(html.replace(/\s+/g," "));

                return {
                    limit: {
                        total: opt['brief'],
                        delta: opt['addition']
                    },
                    parent: elem,
                    classname: elem.attr('class'),
                    html: html,
                    text: elem.text()
                };
            };

            // определяем сколько символов
            person.howMuchSymbols = function() {
                var result;

                // очищаем от повторяющихся пробелов
                result = data.text.replace(/\s+/g,' ');

                // очищаем от лишних пробелов в начале и конце
                result = $.trim(result);

                return result.length;
            };

            // формирование анонса
            person.cutBrief = function() {
                var tmp,
                    i = 0,                          // счетчик циклов
                    j = 0,                          // счетчик циклов
                    html = data.html,               // html блока
                    htmlLength = html.length,       // количество символов html блока
                    count = 0,                      // счетчик текстовых символов
                    countFlag = true,               // текущий символ не является html-разметкой
                    endCharsLen = ENDCHARS.length,  // размер массива символов, указывающих на окончание слова
                    end = htmlLength,               // позиция конца анонса при поиске
                    resultLimit = data.limit.total - data.limit.delta,    // требуемое количество символов
                    tagName,                        // название тега
                    tagStack = [];                  // стек тегов, которые необходимо закрыть в конце анонса

                if (data.count > data.limit.total) {
                    // формируем анонс
 
                    for (; i < htmlLength; i++) {
                        // если открывается тег
                        if (html[i] === '<') {
                            countFlag = false;

                            // символ не последний
                            if (i < htmlLength - 1) {
                                // тег является закрывающим
                                if (html[i+1] === '/') {
                                    tmp = html.indexOf('>', i+1);
                                    if (tmp > 0) {
                                        // верный формат закрытия тега
                                        tagName = html.substr(i+2, tmp-i-2);
                                        // обнаруженный тег должен иметь закрывающую часть ?
                                        if ($.inArray(tagName, TAGDIC) >= 0) {
                                            tagStack.pop();
                                        }
                                    }
                                } else {
                                    // тег является открывающим
                                    // следующий символ - любая латинская буква ?
                                    if (/\w/gi.test(html[i+1])) {
                                        // получение имени тега и опредение его на необходимость закрытия
                                        tmp = html.indexOf('>', i+1);
                                        if (tmp > 0) {
                                            tagName = html.substr(i+1, tmp-i-1);
                                            // тег должен иметь закрывающую часть
                                            if ($.inArray(tagName, TAGDIC) >= 0) {
                                                tagStack.push(tagName);
                                            }
                                        } else {
                                            // не является тегом
                                            countFlag = true;
                                        }
                                    } else {
                                        // не является тегом
                                        countFlag = true;
                                    }
                                }
                            }
                        }

                        // инкрементим счетчик текстовых символов
                        if (countFlag) {
                            count++;
                        }

                        // если закрывается тег
                        if (html[i] === '>') {
                            countFlag = true;
                        }

                        // дошли до конца требуемого размера анонса
                        if (count >= resultLimit) {
                            // текущий символ не является концом слова
                            if ($.inArray(html[i], ENDCHARS) < 0) {
                                // символ не последний
                                if (i < htmlLength - 1) {
                                    // следующий символ тоже не конец слова
                                    if ($.inArray(html[i+1], ENDCHARS) < 0) {
                                        // ищем первое вхождение каждого символа из набора и выбираем ближайший
                                        for (; j < endCharsLen; j++) {
                                            tmp = html.indexOf(ENDCHARS[j], i+1);
                                            if ((tmp > 0) && (tmp < end)) {
                                                end = tmp;
                                            }
                                        };
                                        i = end;
                                    }
                                }
                            } else {
                                // слово закончилось целиком
                                count--;
                            }
                            break;
                        }
                    };

                    // вырезаем кусок html
                    data.brief = html.substr(0, i);

                    // добавляем точки
                    data.brief += opt.ellipsis;

                    // закрываем открытые теги
                    for (i = tagStack.length - 1; i >= 0; i--) {
                        data.brief += '</' + tagStack[i] + '>';
                    };
                } else {
                    // не обрезаем
                    data.brief = html;
                }
            };

            // вычисление высоты анонса
            person.getBriefHeight = function(content) {
                var fake,
                    result;

                // формируем фейк элемент
                data.parent.after('<div class="' + data.classname + '" style="visibility: hidden;">' + content + '</div>');
                fake = data.parent.next();

                // вычисляем высоту
                result = fake.outerHeight();

                // удаляем фейк элемент
                fake.remove();

                return result;
            };

            // функционирование кнопок Развернуть/свернуть
            person.events = function() {
                data.parent.on('click', '.b-readmore__toggle', function(e) {
                    var self = $(this),
                        parent = self.parent().parent(),
                        state;

                    e.preventDefault();

                    if (parent.hasClass('b-readmore--opened')) {
                        person.createDots(opt.smoothly);
                        // state = false;
                    } else {
                        person.destroyDots(opt.smoothly);
                        // state = true;
                    }

                    parent.toggleClass('b-readmore--opened');
                });
            };

            // добавляем точки
            person.createDots = function(time) {
                // задаем высоту
                data.parent.animate({
                    height: data.briefHeight
                }, time, function() {
                    // пишем анонс со ссылкой раскрытия
                    data.parent.html(data.brief + TMPL(opt));

                    if (typeof opt.callback === 'function') {
                        opt.callback(elem, false);
                    }
                });
            };

            // убираем точки
            person.destroyDots = function(time) {

                // пишем исходный код блока со ссылкой сворачивания
                data.parent.html(data.html + TMPL(opt));

                // меняем высоту
                data.parent.animate({
                    height: person.getBriefHeight(data.html)
                }, time, function() {
                    if (typeof opt.callback === 'function') {
                        opt.callback(elem, true);
                    }
                });
            };

            person.apply = function() {
                data.parent.css({
                    overflow: 'hidden'
                });

                // вычисляем высоту анонсов
                data.briefHeight = person.getBriefHeight(data.brief);

                // применяем плагин обрезания текста
                person.createDots(0);
            };

            common.init = function() {
                // инициализируем данные
                data = person.initData();

                // подсчитываем количество слов
                data.count = person.howMuchSymbols(),

                // формируем анонсы
                person.cutBrief();

                if (data.count > data.limit.total) {
                    person.apply();
                }

                person.events();
            };

            return common;
        })();

        RDM.init();

        return this;
    };

    $.fn.readmore.defaults = {
        ellipsis: '...',            // string : окончание блока при обрезании
        textOpen: 'Читать далее',   // string : текст ссылки в свернутом состоянии
        textClose: 'Свернуть',      // string : текст ссылки в развернутом состоянии
        callback: null,             // function : функция, исполняющаяся после раскрытия/закрытия блока
        brief: 1500,                // integer : максимальное количество символов анонса, уменьшенное на величину addition
        addition: 300,              // integer : минимальное количество символов раскрываемой части текста
        smoothly: 0                 // integer : время раскрытия/закрытия блока в мс
    };

})(jQuery);