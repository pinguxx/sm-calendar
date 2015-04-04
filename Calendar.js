/*global require, module, window*/
var Calendar = function (properties) {
    'use strict';
    properties = properties || {};
    var calendar = {},
        m = window.m || require("mithril/mithril"),
        actual = new Date(),
        functionType = Object.prototype.toString.call(function () {});

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
        var cal = this;
        return m('span', [
            m('span', {
                onclick: function () {
                    calendar.editingYear(true);
                },
                style: calendar.editingYear() ? 'display:none;' : 'cursor: pointer;text-decoration: underline;'
            }, date().getFullYear()),
            m('input', {
                value: date().getFullYear(),
                maxlength: 4,
                type: 'text',
                required: 'required',
                style: !calendar.editingYear() ? 'display:none;' : 'width: 40px;',
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
                    if (calendar.mindate && this.value < calendar.mindate.getFullYear()) {
                        return;
                    }
                    if (calendar.maxdate && this.value > calendar.maxdate.getFullYear()) {
                        return;
                    }
                    cal.date().setFullYear(this.value);
                    calendar.editingYear(false);
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

    //calendar.date = m.prop(new Date());
    calendar.hours = m.prop(calendar.now().getHours());
    calendar.minutes = m.prop(calendar.now().getMinutes());
    calendar.now = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), calendar.now().getDate()));
    calendar.date = m.prop(new Date(calendar.now().getFullYear(), calendar.now().getMonth(), 1));
    calendar.goToDate(properties.value || calendar.now());//m.prop(calendar.now());

    calendar.view = function () {
        var date,
            dates,
            out = [],
            all = [],
            cal = this,
            next = true,
            previous = true;
        //add dates
        //create data view
        date = new Date(cal.date().getFullYear(), cal.date().getMonth(), 1);
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

        if (calendar.mindate && (cal.date().getMonth() - 1) < calendar.mindate.getMonth()) {
            previous = false;
        }
        if (calendar.maxdate && (cal.date().getMonth() + 1) > calendar.maxdate.getMonth()) {
            next = false;
        }
        return m('.ui.row.four.column.sm-calendar' + (cal.small ? '.sm-calendar-small' : ''), {
            config: function (el, init) {
                if (!init) {
                    if (el.parentNode.className.indexOf('grid') < 0) {
                        el.className += " grid page";
                        el.className = el.className.replace('row','');
                    }
                }
            }
        }, [
            m('.column', [
                previous ? m('a[href=#]', {
                    onclick: function (e) {
                        e.preventDefault();
                        cal.date().setDate(cal.date().getDate() - daysInMonth(cal.date().getMonth(), cal.date().getFullYear()));
                    }
                }, [
                    m("i.angle.double.left.icon"),
                    !cal.small ? m('span', cal.i18n.monthsLong[cal.date().getMonth() - 1  < 0 ? cal.i18n.months.length - 1 : cal.date().getMonth() - 1]) : ''
                ]) : ''
            ]),
            m('.column.center.aligned.eight.wide', [
                m('select',  {
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;',
                    value: cal.date().getMonth(),
                    onchange: function () {
                        cal.date().setMonth(this.value);
                    }
                }, cal.i18n.months.map(function (item, idx) {
                    if (calendar.mindate && idx < calendar.mindate.getMonth()) {
                        return '';
                    }
                    if (calendar.maxdate && idx > calendar.maxdate.getMonth()) {
                        return '';
                    }
                    return m('option[value=' + idx + ']', !cal.small ? cal.i18n.monthsLong[idx] : cal.i18n.months[idx]);
                })),
                calendar.editYear (cal.date)
                /*!cal.small ? cal.i18n.monthsLong[cal.date().getMonth()] : cal.i18n.months[cal.date().getMonth()],
                ' ' + cal.date().getFullYear()*/
            ]),
            m('.column.right.aligned', [
                next ? m('a[href=#]', {
                    onclick: function (e) {
                        e.preventDefault();
                        cal.date().setMonth(cal.date().getMonth() + 1);
                    }
                }, [
                    !cal.small ? m('span', cal.i18n.monthsLong[cal.date().getMonth() + 1  >= cal.i18n.months.length ? 0 : cal.date().getMonth() + 1]) : '',
                    m("i.angle.double.right.icon")
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
            m('.column.center.aligned.sixteen.wide', [
                m('select',  {
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;',
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
                    style: 'border: 0;background: transparent;padding: 0 3px;cursor: pointer;-webkit-appearance: none;-moz-appearance: none;appearance: none;text-decoration: underline;',
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
                /*!cal.small ? cal.i18n.monthsLong[cal.date().getMonth()] : cal.i18n.months[cal.date().getMonth()],
                ' ' + cal.date().getFullYear()*/
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