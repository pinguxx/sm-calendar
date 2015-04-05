/*global m, Calendar, window*/
(function (m, Calendar) {
    var module = {};


    module.controller = function () {
        module.vm.init();
        this.calendar = new Calendar({
            mindate: new Date(new Date().getTime() + 10*24*60*60*1000),
            maxdate: new Date(new Date().getTime() + 30*24*60*60*1000 + 10000000)
        });
        this.calendar2 = new Calendar({small: true});
        this.calendar3 = new Calendar({small: true, time: false, pageclass: true, onclick: function (date) {
            alert(date);
        }});
    };

    module.vm = {};
    module.vm.init = function (data) {
        this.customers = data;
        this.rowsperpage = 10;
        this.filter = m.prop('');
    };


    module.view = function (ctrl) {
        return m('', [
            m('.ui.grid.page', [
                m('br'),
                m('h1.ui.dividing.header', 'Calendar Widget')
            ]),
            m('.ui.grid.page', [
                m('h2', 'Basic Calendar'),
                ctrl.calendar.view(),
                m('button.ui..button.primary', {
                    onclick: function() {
                        console.log(ctrl.calendar.getDate());
                    }
                }, 'get')
            ]),
            m('.ui.grid.page.stackable', [
                m('h2', 'Small Calendar'),
                m('.row', [
                    m('.ui.column.five.wide', [
                        m('.ui.grid', [
                            ctrl.calendar2.view()
                        ])
                    ])
                ]),
                m('button.ui.button.primary', {
                    onclick: function() {
                        console.log(ctrl.calendar2.getDate());
                    }
                }, 'get')
            ]),
            m('h2', 'Another calendar wth floating div'),
            m('.ui.form.fluid', [
                m('.two.fields', [
                    m('.field.required', [
                       m('', {
                            style: 'display: block; position: absolute; left: 5px; top: 40px; width: 99%; border: 1px solid gray; z-index: 100; background-color: rgb(255, 255, 255);border-radius: 0 0 5px 5px;box-shadow: 2px 2px 3px gray;'
                        }, [
                            ctrl.calendar3.view()
                        ])
                    ])
                ])
            ]),
            m('button.ui.button.primary', {
                onclick: function() {
                    ctrl.calendar3.setMinDate(new Date(2011, 9, 11));
                }
            }, 'mindate to 11/11/11'),
            m('button.ui.button.primary', {
                onclick: function() {
                    ctrl.calendar3.setMaxDate(new Date(2012, 8, 11));
                }
            }, 'maxdate to 11/11/12')
        ]);
    };

    m.module(window.document.body, module);
}(m, Calendar));
