/*global require, module, window*/
var Calendar = function (properties) {
    'use strict';
    properties = properties || {};
    var calendar = {},
        m = window.m || require("mithril/mithril"),
        actual = new Date(),
        functionType = Object.prototype.toString.call(function () {});
    
    properties.time = properties.time === undefined ? true : properties.time;

    calendar.actual = m.prop(new Date(actual.getFullYear(), actual.getMonth(), actual.getDate()));

    calendar.now = properties.now ? m.prop(properties.now) : m.prop(new Date());

    calendar.mindate = properties.mindate;
    if (calendar.mindate) {
        calendar.mindate_nt = new Date(calendar.mindate.getFullYear(), calendar.mindate.getMonth(), calendar.mindate.getDate());
    }
    calendar.maxdate = properties.maxdate;
    if (calendar.maxdate) {
        calendar.maxdate_nt = new Date(calendar.maxdate.getFullYear(), calendar.maxdate.getMonth(), calendar.maxdate.getDate());
    }

    if (calendar.mindate && +calendar.now() < +calendar.mindate) {
        calendar.now(calendar.mindate);
    }
    if (calendar.maxdate && +calendar.now() > +calendar.maxdate) {
        calendar.now(calendar.maxdate);
    }

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    function merge(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = merge(obj1[p], obj2[p]);

                } else {
                    obj1[p] = obj2[p];

                }

            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];

            }
        }
        return obj1;
    }

    calendar.editYear = function(date) {
        var cal = this,
            year = date().getFullYear();
        return m('span', [
            m('span', {
                onclick: function () {
                    calendar.editingYear(true);
                },
                style: calendar.editingYear() ? 'display:none;' : 'cursor: pointer;text-decoration: underline;'
            }, year),
            m('input', {
                value: year,
                maxlength: 4,
                type: 'text',
                required: 'required',
                style: !calendar.editingYear() ? 'display:none;' : 'width: 40px;padding: 1px;',
                config: function (element) {
                    if (calendar.editingYear()) {
                        element.focus();
                        element.selectionStart = element.value.length;
                    }
                },
                onblur: function () {
                    if (+this.value < 1800 || +this.value > 2999) {
                        return;
                    }
                    if (cal.mindate && this.value < cal.mindate.getFullYear()) {
                        return;
                    }
                    if (cal.maxdate && this.value > cal.maxdate.getFullYear()) {
                        return;
                    }
                    cal.date().setFullYear(this.value);
                    cal.editingYear(false);
                }
            }),
        ]);
    };

    calendar.editingYear = m.prop(false);

    calendar.i18n = {
        monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };

    calendar.small = properties.small;

    calendar.i18n = merge(calendar.i18n, properties.i18n);
    calendar.formatCell = properties.formatCell || function (date) {
        var style = '',
            claz = '',
            cal = this;
        if (+date === +this.actual()) {
            style = 'background-color:#00b5ad;color:#fff;';
        }
        if (+date === +this.value()) {
            style = 'background-color:#5bbd72;color:#fff;';
        }
        if ((cal.mindate_nt && date < cal.mindate_nt) || (cal.maxdate_nt && date > cal.maxdate_nt)) {
            claz = '.disabled';
        }
        return m('td.center.aligned' + claz, {
            style: style
        }, [
            claz.indexOf('.disabled') < 0 ?
                m('a[href="#"]', {
                    style: style,
                    onclick: function (e) {
                        e.preventDefault();
                        cal.value(date);
                        if (properties.onclick) {
                            properties.onclick(cal.getDate());
                        }
                    }
                }, date.getDate()) :
                date.getDate()
        ]);
    };

    calendar.goToDate = function (date) {
        if (Object.prototype.toString.call(date) === functionType) {
            date = date.date();
        }
        calendar.now(date);
        if (calendar.mindate && +date < +calendar.mindate) {
            calendar.now(calendar.mindate);
        }
        if (calendar.maxdate && +date > +calendar.maxdate) {
            calendar.now(calendar.maxdate);
        }
        calendar.now = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), calendar.now().getDate()));
        calendar.date = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), 1));
        calendar.hours = m.prop(date.getHours());
        calendar.minutes = m.prop(date.getMinutes());
        calendar.value = m.prop(calendar.now());
    };

    calendar.getDate = function () {
        return new Date(this.value().getFullYear(), this.value().getMonth(), this.value().getDate(), this.hours(), this.minutes());
    };

    calendar.hours = properties.time ? m.prop(calendar.now().getHours()) : m.prop(0);
    calendar.minutes = properties.time ? m.prop(calendar.now().getMinutes()) : m.prop(0);
    calendar.now = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), calendar.now().getDate()));
    calendar.date = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), 1));
    calendar.goToDate(properties.value || calendar.now());//m.prop(calendar.now());
    
    calendar.setMaxDate = function (date) {
        m.startComputation();
        calendar.maxdate = date || null;
        if (calendar.maxdate) {
            calendar.maxdate_nt = new Date(calendar.maxdate.getFullYear(), calendar.maxdate.getMonth(), calendar.maxdate.getDate());
        }
        if (calendar.maxdate && +calendar.now() > +calendar.maxdate) {
            calendar.now(calendar.maxdate);
        }
        m.endComputation();
    };
    
    calendar.setMinDate = function (date) {
        m.startComputation();
        calendar.mindate = date || null;
        if (date) {
            calendar.mindate_nt = new Date(calendar.mindate.getFullYear(), calendar.mindate.getMonth(), calendar.mindate.getDate());
        }
        if (calendar.mindate && +calendar.now() < +calendar.mindate) {
            calendar.now(calendar.mindate);
        }
        m.endComputation();
    };

    calendar.view = function () {
        var date,
            dates,
            out = [],
            all = [],
            cal = this,
            next = true,
            year,
            previous = true;
        //add dates
        //create data view
        date = new Date(cal.date().getFullYear(), cal.date().getMonth(), 1);
        year = date.getFullYear();
        
        if (calendar.mindate && (cal.date().getFullYear() <= cal.mindate_nt.getFullYear())) {
            year = cal.mindate.getFullYear();
            cal.date().setFullYear(year);
            if (cal.date().getMonth() - 1 < cal.mindate.getMonth()) {
                date.setMonth(cal.mindate.getMonth());
                previous = false;
            }
            if (cal.date().getMonth() < cal.mindate.getMonth()) {
                cal.date().setMonth(cal.mindate.getMonth());
            }
        }
        
        if (calendar.maxdate && (cal.date().getFullYear() >= cal.maxdate_nt.getFullYear())) {
            year = cal.maxdate.getFullYear();
            cal.date().setFullYear(year);
            if (cal.date().getMonth() + 1 > cal.maxdate.getMonth()) {
                date.setMonth(cal.maxdate.getMonth());
                cal.date().setMonth(cal.maxdate.getMonth());
                next = false;
            }
        }
        
        date.setFullYear(year);
        date.setDate(date.getDate() - date.getDay());
        for (var i = 1; i < 43; i += 1) {
            var d = date.getDate();
            out.push(new Date(date));
            date.setDate(d + 1);
            if (i % 7 === 0) {
                all.push(out);
                out = [];
            }
        }
        dates = m.prop(all);
        
        return m('.ui.row.four.column.sm-calendar' + (cal.small ? '.sm-calendar-small' : ''), {
            config: function (el, init) {
                if (!init) {
                    if (el.parentNode.className.indexOf('grid') < 0) {
                        el.className += " grid";
                        if (properties.pageclass) {
                            el.className += ' page';
                        }
                        el.className = el.className.replace('row','');
                    }
                }
            }
        }, [
            m('.column', {
                style: 'padding-bottom: 0;'
            }, [
                previous ? m('a[href=#].sm-calendar-arrow', {
                    onclick: function (e) {
                        e.preventDefault();
                        cal.date().setDate(cal.date().getDate() - daysInMonth(cal.date().getMonth(), cal.date().getFullYear()));
                    }
                }, [
                    m("i.angle.double.left.icon.sm-calendar-arrow"),
                    !cal.small ? m('span', cal.i18n.monthsLong[cal.date().getMonth() - 1  < 0 ? cal.i18n.months.length - 1 : cal.date().getMonth() - 1]) : ''
                ]) : ''
            ]),
            m('.column.center.aligned.eight.wide', {
                style: 'padding-bottom: 0;'
            }, [
                m('select',  {
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;display: inline;width: auto;',
                    value: cal.date().getMonth(),
                    config: function (el) {
                        el.value = cal.date().getMonth();
                    },
                    onchange: function () {
                        cal.date().setMonth(this.value);
                    }
                }, cal.i18n.months.map(function (item, idx) {
                    if (cal.mindate && (+cal.date().getFullYear() <= +cal.mindate_nt.getFullYear()) && idx < cal.mindate.getMonth()) {
                        return '';
                    }
                    if (cal.maxdate && (+cal.date().getFullYear() >= +cal.maxdate_nt.getFullYear()) && idx > cal.maxdate.getMonth()) {
                        return '';
                    }
                    return m('option[value=' + idx + ']', !cal.small ? cal.i18n.monthsLong[idx] : cal.i18n.months[idx]);
                })),
                calendar.editYear (cal.date)
            ]),
            m('.column.right.aligned', {
                style: 'padding-bottom: 0;'
            }, [
                next ? m('a[href=#].sm-calendar-arrow', {
                    onclick: function (e) {
                        e.preventDefault();
                        cal.date().setMonth(cal.date().getMonth() + 1);
                    }
                }, [
                    !cal.small ? m('span', cal.i18n.monthsLong[cal.date().getMonth() + 1  >= cal.i18n.months.length ? 0 : cal.date().getMonth() + 1]) : '',
                    m("i.angle.double.right.icon.sm-calendar-arrow")
                ]) : ''
            ]),
            m('.column.sixteen.wide', [
                m('table.ui.table.striped.celled.unstackable.seven.column.compact.small', [
                    m('thead', [
                        m('tr', cal.i18n.days.map(function (item) {
                            return m('th', {
                                style: cal.small ? 'padding: 0;' : ''
                            }, item);
                        }))
                    ]),
                    m('tbody', dates().map(function (row) {
                        return m('tr', row.map(cal.formatCell.bind(cal)));
                    }))
                ])
            ]),
            m('.column.center.aligned.sixteen.wide', {
                style: 'padding-top: 0;'
            }, properties.time ? [
                m('select',  {
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;display: inline;width: auto;',
                    value: cal.hours(),
                    onchange: m.withAttr('value', cal.hours),
                    config: function (element) {
                        cal.hours(element.value);
                    }
                }, Array.apply(null, new Array(24)).map(function (item, idx) {
                    idx += 1;
                    if (cal.mindate && (+cal.value() <= +cal.mindate_nt) && idx < cal.mindate.getHours()) {
                        return;
                    }
                    if (cal.maxdate && (+cal.value() >= +cal.maxdate_nt) && idx > cal.maxdate.getHours()) {
                        return;
                    }
                    return m('option[value=' + idx + ']', idx < 10 ? ('0' + idx) : idx);
                })),
                ':',
                m('select',  {
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;display: inline;width: auto;',
                    value: cal.minutes(),
                    onchange: m.withAttr('value', cal.minutes),
                    config: function (element) {
                        cal.minutes(element.value);
                    }
                }, Array.apply(null, new Array(60)).map(function (item, idx) {
                    if (cal.mindate && (+cal.value() <= +cal.mindate_nt) && idx < cal.mindate.getMinutes()) {
                        return;
                    }
                    if (cal.maxdate && (+cal.value() >= +cal.maxdate_nt) && idx > cal.maxdate.getMinutes()) {
                        return;
                    }
                    return m('option[value=' + idx + ']', idx < 10 ? ('0' + idx) : idx);
                })),
                m('a[href="#"]', {
                    style: 'padding: 0 3px;float:right;',
                    onclick: function (e) {
                        e.preventDefault();
                        cal.goToDate(new Date());
                    }
                }, 'Today')
            ] : [
                m('a[href="#"]', {
                    style: 'padding: 0 3px;float:right;',
                    onclick: function (e) {
                        e.preventDefault();
                        cal.goToDate(new Date());
                    }
                }, 'Today')
            ])
        ]);
    };
    return calendar;
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calendar;
}
