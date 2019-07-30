;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfTree2'; //Plugin名稱
    var gfTree;

    $.ajax({
        url: 'node_modules/gf.tree2/src/css/gf.Tree2.css',
        dataType: 'text',
        cache: true
    }).then(function (data) {
        var style = $('<style/>', {
            'text': data
        });
        $('head').append(style);
    });

    $.ajax({
        url: 'node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css',
        dataType: 'text',
        cache: true
    }).then(function (data) {
        var style = $('<style/>', {
            'text': data
        });
        $('head').append(style);
    });
    //Load dependencies first
    $.when(
        $.ajax({
            url: 'node_modules/jquery.nicescroll/dist/jquery.nicescroll.min.js',
            dataType: 'script',
            cache: true
        }),
        $.ajax({
            url: 'node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.js',
            dataType: 'script',
            cache: true
        }),
        $.ajax({
            url: 'node_modules/jquery-contextmenu/dist/jquery.ui.position.min.js',
            dataType: 'script',
            cache: true
        })
    ).done(function () {
        //建構式
        gfTree = function (element, options) {

            this.target = element; //html container
            //this.prefix = pluginName + "_" + this.target.attr('id'); //prefix，for identity
            this.opt = {};
            //o._init(options);
            var initResult = this._init(options); //初始化
            if (initResult) {
                //初始化成功之後的動作
                this._style();
                this._event();
                this._subscribeEvents();

                //如果有設定預設開啟物件
                var self = this;
                if (this.opt.defaultActiveItem.length > 0) {
                    this.opt.defaultActiveItem.forEach(function (ele) {
                        self.target.find('.gfTreeItem[data-' + self.opt.layeridField + '="' + ele + '"]').trigger('click');
                    });
                }

                this.target.trigger('onInitComplete');
            }
        };

        //預設參數
        gfTree.defaults = {
            arrData: [], //原始資料
            activeItem: [], //開啟的物件
            defaultActiveItem: [], //預設開啟的物件
            isFavorite: true,          //是否使用我的最愛?
            isTheme: false,             //是否使用主題圖層?
            isSetLocate: false,         //是否使用設定圖層定位功能?
            css: {
                'width': '300px',
                'background-color': '#364149',
                'overflow-y': 'hidden',
                'overflow-x': 'hidden'
            },

            identityField: 'id', //識別欄位
            nameField: 'name', //名稱欄位
            parentField: 'parent_id', //父層識別欄位
            iconField: 'type', //圖示類型欄位
            sortField: 'seq', //排序欄位
            urlField: 'kmlurl',
            layeridField: 'layerid2d',
            flytoXField: 'x',
            flytoYField: 'y',
            flytoZField: 'z',

            //右鍵選單裡，下拉選單的資料來源
            optionSource: {
                get: '',
                post: '',
            },

            iconType: {
                'folder': {
                   	'close': ' fas fa-folder fa-fw fa-lg',
                    'open': ' fas fa-folder-open fa-fw fa-lg'
               },
                '向量': {
                    'close': ' fas fa fa-square-o fa-fw fa-lg',
                    'open':' far fa fa-check-square-o fa-fw fa-lg'
               },
                'kmlurl': {
                    'close': ' fas fa fa-square-o fa-fw fa-lg',
                    'open':' far fa fa-check-square-o fa-fw fa-lg'
                },
                'wms': {
                    'close': ' fas fa fa-square-o fa-fw fa-lg',
                    'open':' far fa fa-check-square-o fa-fw fa-lg'
                }
            },
            scrollColor: '#ffffff',
            /*
            switch: {
                on: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6I0E0RTI3NjsiIGQ9Ik0zNzIuMzY0LDM0OS4wOTFjLTUxLjMzLDAtOTMuMDkxLTQxLjc2MS05My4wOTEtOTMuMDkxczQxLjc2MS05My4wOTEsOTMuMDkxLTkzLjA5MSAgYzEyLjg1MywwLDIzLjI3My0xMC40MiwyMy4yNzMtMjMuMjczYzAtMTIuODUzLTEwLjQyLTIzLjI3My0yMy4yNzMtMjMuMjczSDEzOS42MzZDNjIuNjQxLDExNi4zNjQsMCwxNzkuMDA1LDAsMjU2ICBzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjdjMTIuODUzLDAsMjMuMjczLTEwLjQyLDIzLjI3My0yMy4yNzNTMzg1LjIxNiwzNDkuMDkxLDM3Mi4zNjQsMzQ5LjA5MXoiLz4KPGNpcmNsZSBzdHlsZT0iZmlsbDojRkZGRkZGOyIgY3g9IjM3Mi4zNjQiIGN5PSIyNTYiIHI9IjExNi4zNjQiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0E5QThBRTsiIGQ9Ik0zNzIuMzY0LDM5NS42MzZjLTc2Ljk5NSwwLTEzOS42MzYtNjIuNjQxLTEzOS42MzYtMTM5LjYzNnM2Mi42NDEtMTM5LjYzNiwxMzkuNjM2LTEzOS42MzYgIFM1MTIsMTc5LjAwNSw1MTIsMjU2UzQ0OS4zNTksMzk1LjYzNiwzNzIuMzY0LDM5NS42MzZ6IE0zNzIuMzY0LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzQ2NS40NTUsMzA3LjMzLDQ2NS40NTUsMjU2UzQyMy42OTQsMTYyLjkwOSwzNzIuMzY0LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=',
                off: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6Izc3NzU3RjsiIGQ9Ik0zNzIuMzY0LDExNi4zNjRIMTM5LjYzNkM2Mi42NDEsMTE2LjM2NCwwLDE3OS4wMDUsMCwyNTZzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjcgIEM0NDkuMzU5LDM5NS42MzYsNTEyLDMzMi45OTUsNTEyLDI1NlM0NDkuMzU5LDExNi4zNjQsMzcyLjM2NCwxMTYuMzY0eiIvPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBjeD0iMTM5LjYzNiIgY3k9IjI1NiIgcj0iMTE2LjM2NCIvPgo8cGF0aCBzdHlsZT0iZmlsbDojQTlBOEFFOyIgZD0iTTEzOS42MzYsMzk1LjYzNkM2Mi42NDEsMzk1LjYzNiwwLDMzMi45OTUsMCwyNTZzNjIuNjQxLTEzOS42MzYsMTM5LjYzNi0xMzkuNjM2ICBTMjc5LjI3MywxNzkuMDA1LDI3OS4yNzMsMjU2UzIxNi42MzIsMzk1LjYzNiwxMzkuNjM2LDM5NS42MzZ6IE0xMzkuNjM2LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzIzMi43MjcsMzA3LjMzLDIzMi43MjcsMjU2UzE5MC45NjcsMTYyLjkwOSwxMzkuNjM2LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='
            },
            */
            toolIcon: {
                list: {
                    class: ' fas fa-list-ul fa',
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjBgQODRGJptLOAAABOElEQVQ4y7WTvUtCYRjFf69eI7pZ4hAWSIY0Gf4N0VRb0WQ0NEhTsy39CVFLSxBB0Fq2F625BNIH9LEoaFC4WPc2mN7T4tLydhfP/BzO7znv+8CgZUALzPHIjfkOZdAWJVw67HLCBAUylmnhGT0xSwSoss4MO+SsAYFDHAOAS5QYLqN2JIcjSgzTpcwHUa6pW5F8ozSLZKlzRY0hphixGroGFCdBG88E4VpKssY0Dco0gTgxe4LDJkVStBjnkBSrpK0BHfSsniSpqpyWdSe7epEw3H9rPe4jndHC4YJbO5JRkgIZGpzzFmZpAxojQZuvsLWmWSJLLezDORT7X2OPfSbZIGs1+KipQJL0orxWdP9PrXL4JIUBfHr84ONZVwgcDtjGpcMp74hLXq1IngHNk+eBSrgTHbx+Abo+tejhuQ7tAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA2LTA0VDEyOjEzOjE3KzAyOjAw6RGc/gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNi0wNFQxMjoxMzoxNyswMjowMJhMJEIAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC',
                    desc: '圖層清單'
                },
                search: {
                    class: ' fas fa-search fa',
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjBgQOFDBez2uIAAACHElEQVQ4y42SzUvUURSGnztZ5kdBiVjhFCEK1aqgREtXA31I5CLIXRQuWvRftBDaBGGgIBUFLip3VvbBUAlBBCZk0Ac1gVQLNRqtfo0287RQdBwNfXf3nPO85557T2BOFnOUExwgTpYvvKCPwTDF/2SzSdPOmDVnzqwzTtpvwlBYGQBs4wI7iHhEkhRQQ4KDbOQNnVwLLnX/4F8HbbHa/TZZbblbPGnSjM9tLSwvNum0gzbaaI8j3rIexDKPeN/I225bDLSaNm2Ljd512Ism3DyXKfO0n3xv+2LgujPesdoehz1j3BJj87ldXvWnNxYiEGM/MZJspZ6HPGY0RCE3nx1liBLibMoHqgmkWMdrHjBe8Iq/GGOaUioWQkXM+n3mEh/JLPNFMcD84xekhnR4Gb7nXWZW5VRRRMREPvCCHAnKXcac7ezjNykm84E+Ig5yiLIl67KRepr4ytPwNz+8wX4zJj1s6eJyjzvgpL1uL3RKOGTGe552l+UGgxvc41kHTPvMNmvcvWj5DJyhnb184wlDjAFV7KOJSoa5yQinWMfl8Da/R7DV2773p1n/mDHrlO/stc0GLxs5YZd1eesN4DaO0UycUiAixVOSrOU851gPpLlFR0gVThOzwjpr3ewaAHd7xQlnNWX3kvGXyjo7/TGHRPZYuTJSa5dTc8i0HSsC4E67jVTNObYKAIzb7bQ5Z3y1KgCstMNxX9nwDzTMWXvXBM3tAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA2LTA0VDEyOjIwOjQ4KzAyOjAwJWw/cQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNi0wNFQxMjoyMDo0OCswMjowMFQxh80AAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC',
                    desc: '圖層搜尋'
                },
                clear: {
                    class: ' fas fa-eye-slash fa',
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjBgQODyzj+PxdAAABlUlEQVQ4y5WTvW4TQRRGT9AWcQGslMJGdEiRtqZCEFIiQYlAdDSR3PMGVImTwhGRTZQCWQaUH9GFh6DbF0BKk82uLVCClcoUPhReG9h4IfmquXe+M3Nn5g6GfnTgLA38YEhBAS2e8Y5zLuo6K8jLQtaBW5TILX8Uc9e4wWkZwCk3LwJXVA74xGOPfXxpgB3OOGPn8sBVS6JOSEg9L3DRzx66OPvq9HUhE5nas+dXXxj/FzAyNTXyjs9LdzD00bgJJvZ8btkDT/zpifs+/A20TNTEyMhsYjdwW83s2LBjT20bjIFzU5+ampmZTVffduSa83lUseHI9gSIwOgv+7K6BtbyuAauq0uob/LkggvTkx2YOW9N3QQ31aoV++7NuFYAUzuQW+MxBnZNStrboav56IsaOwfgqsOAQ+pK+of7aO4T37kFYJN7xNylySvgNt8w9H3hi8bgvj0rVtUm2FRrVuy7W9JiLqkNsJrHVXBDvV/alb515LqV6TtsOLJFuQxsq327NuzaV1sG/Fs+cM/EoYm7k2J+ATzDZahua4cKAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA2LTA0VDEyOjE1OjQ0KzAyOjAwnQf4QAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNi0wNFQxMjoxNTo0NCswMjowMOxaQPwAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC',
                    desc: '清除圖層'
                },
                // history: {
                //     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABqUlEQVQ4T53Uu+vPURzH8cfPfRMpE2WwMEgui5ESYmFxmaRcMlhsklgsNnL5ZXHJwsyAMsklyh+AkoWiTOTaS+fw+R2f7yWnPvX5nM95P9/v83pfJvxds/Gl8/1frxPFaiEe4Awme0gL8AMfRnmpwER3C5uxv4GuxU18x3Y8GwatwJzpgy4vgFkF8hmHcXkQtAtsoQdwCcdwqgEEGHAcTFktMD+X4TlmYhg0V48Er7vEFrgNVzC3HPo5Apok7cHtCu0C1+Ahpje3GAX9itV4Ebs2wk24jnk90IO42Gj6Hjtxry/CureklNDKEdCt2IE3wzRcjHflwDnsHQKNNEncCjzqi3AV7uJlJ3v7cLbUaLWJpvX6cXge6/C01XAaThSNPmI37iCO0kXfsAvHS0cdwgWsx33E0T9JyV7a71opnZPIM7+03iecxtECqNA/yvQVdn52E5MaS7TR7AY24HEZFBsxBToIGOgc1MS8wgwsKpodKSFFii1d6DBgvUZNTMZXJtHVTuYzNDKJEvVSvB0HGPskJh3xuxuaFWhK58mgpPTYjL81boRjE38B5LBgFUVPPZYAAAAASUVORK5CYII=',
                //     desc: '歷史圖層'
                // }

            },
            onClick: undefined,
            onInitComplete: undefined,
            onAddFavorite: undefined,
            onAddLayerTheme: undefined,
            onSetFlyto: undefined,
        };

        //方法
        gfTree.prototype = {
            //私有方法
            _init: function (_options) {
                //合併自訂參數與預設參數
                try {
                    this.opt = $.extend(true, {}, gfTree.defaults, _options);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            _style: function () {
                var o = this;
                o.target.css(o.opt.css);

                //上方工具列
                var toolbar = $('<div/>', {
                    'class': 'gfTreeToolbar'
                });
                Object.keys(o.opt.toolIcon).forEach(function (icontype) {
                    var iconimg = $('<i/>', {
                        'class': 'gfTreeToolbar-Icon'+ o.opt.toolIcon[icontype].class,
                        'title': o.opt.toolIcon[icontype].desc,
                        'data-type': icontype
                    });
                    toolbar.append(iconimg);
                });
                o.target.append(toolbar);

                //子容器
                var subContainer = $('<div/>').appendTo(o.target);
                subContainer.height(o.target.height() - toolbar.outerHeight());


                //歷史圖層
                // var historyContainer = $('<div/>', {
                //     'class': 'gfTreeHistoryContainer',
                //     'text': '1234'
                // }).appendTo(subContainer);


                //搜尋工具容器
                var searchContainer = $('<div/>', {
                    'class': 'gfTreeSearchContainer'
                }).appendTo(subContainer);
                var searchInput = $('<input/>', {
                    'class': 'gfTreeSearchInput',
                    'placeholder': '請輸入圖層關鍵字'
                });
                var searchResultList = $('<div/>', {
                    'class': 'gfTreeSearchResultList'
                });
                searchContainer.append(searchInput);
                searchContainer.append(searchResultList);
                searchResultList.height(o.target.height() - toolbar.outerHeight() - searchInput.outerHeight());

                //圖層清單容器
               	var itemlist = $('<div/>', {
                    'class': 'gfTreeItemList'
                }).appendTo(subContainer);
                itemlist.height(o.target.height() - toolbar.outerHeight());

                //產生圖層清單並塞到容器中
                o.opt.arrData
                    .filter(function (x) {
                        return x[o.opt.parentField] == 0;
                    })
                    //.sort(function(a, b){ return a[o.opt.identityField] * 1 > b[o.opt.identityField] * 1; })
                    //.sort(function (a, b) {
                    //    return a[o.opt.sortField] * 1 > b[o.opt.sortField] * 1;
                    //})
                  .forEach(function (ele) {
                     var div = $('<div/>', {
                            "class": "gfTreeItem",
                            "data-id": ele[o.opt.identityField],
                            "data-type": ele[o.opt.iconField],
                            "data-kmlurl": ele[o.opt.urlField],
                            "data-layerid2d": ele[o.opt.layeridField],
                            "data-parentid": ele[o.opt.parentField],
                            "data-sort": ele[o.opt.sortField],
                            "data-lvl": 0,
                            "data-st": "close",
                            "data-path": ele[o.opt.identityField],
                            "data-x": ele[o.opt.flytoXField],
                            "data-y": ele[o.opt.flytoYField],
                            "data-z": ele[o.opt.flytoZField]
                        });
                        if([ele[o.opt.iconField]]=="folder"){
                            var icon = $('<i/>', {
                                "class": "gfTreeContent-Icon fas fa-folder fa-fw fa-lg"
                            });
                        }else{
                            var icon = $('<i/>', {
                                "class": "gfTreeContent-Icon fas fa fa-square-o fa-fw fa-lg"
                            });
                         }

                        div.append(icon);
                        var span = $('<span/>', {
                            "class": "gfTreeContent-Text",
                            "text": ele[o.opt.nameField]
                        });
                        div.append(span);

                        itemlist.append(div);
                    });


                //捲軸美化
                o.target.find('.gfTreeItemList').niceScroll({
                    cursorcolor: o.opt.scrollColor
                });
                o.target.find('.gfTreeSearchResultList').niceScroll({
                    cursorcolor: o.opt.scrollColor
                });
            },
            _event: function () {
                var o = this;
                //點擊圖層
                o.target
                    .on('click', '.gfTreeItem', function (e) {
                        var et = $(this);
                        var eid = et.data().id;
                        var lvl = et.data().lvl;
                        var st = et.data().st;
                        var path = et.data().path;
                        var tp = et.data().type;
                        var pattern = new RegExp('^' + path + "_");

                        if (st == "close") {
                            $(this).data("st", "open");
                            $(this).attr("data-st", "open");
                            $(this).children('.gfTreeContent-Icon').attr('class', 'gfTreeContent-Icon' + o.opt.iconType[tp]["open"])//原本是img改成font

                            if (tp == "folder") {
                                o.opt.arrData
                                    .filter(function (x) {
                                        return x[o.opt.parentField] == eid;
                                    })
                                    //.sort(function(a, b){ return a[o.opt.identityField] * 1 < b[o.opt.identityField] * 1; })
                                    .sort(function (a, b) {
                                        return a[o.opt.sortField] * 1 < b[o.opt.sortField] * 1;
                                    })
                                    .forEach(function (ele) {
                                        var div = $('<div/>', {
                                            "class": "gfTreeItem",
                                            "data-id": ele[o.opt.identityField],
                                            "data-type": ele[o.opt.iconField],
                                            "data-kmlurl": ele[o.opt.urlField],
                                            "data-layerid2d": ele[o.opt.layeridField],
                                            "data-parentid": ele[o.opt.parentField],
                                            "data-sort": ele[o.opt.sortField],
                                            "data-lvl": lvl + 1,
                                            "data-st": "close",
                                            "data-path": path + "_" + ele[o.opt.identityField],
                                            "data-x": ele[o.opt.flytoXField],
                                            "data-y": ele[o.opt.flytoYField],
                                            "data-z": ele[o.opt.flytoZField]
                                        });
                                        div.css('padding-left', (lvl + 1) * 15 + 10 + "px");

                                        if (o.opt.activeItem.indexOf(ele[o.opt.identityField] * 1) >= 0) {
                                            st = "open";
                                            div.data("st", st);
                                            div.attr("data-st", st);
                                        }
                                        var icon = $('<i/>', {
                                            "class": "gfTreeContent-Icon"+ o.opt.iconType[ele[o.opt.iconField]][st]
                                            //"src": o.opt.iconType[ele[o.opt.iconField]][st]
                                        });
                                        div.append(icon);
                                        var span = $('<span/>', {
                                            "class": "gfTreeContent-Text",
                                            "text": ele[o.opt.nameField]
                                        });
                                        div.append(span);

                                        et.after(div);
                                    });
                            } else {
                                o.opt.activeItem.push($(this).data().id);
                                var r = $(this).data();
                                r.selected = true;
                                o.target.trigger('onClick', r);
                            }
                        } else {
                            $(this).data("st", "close");
                            $(this).attr("data-st", "close");
                            $(this).children('.gfTreeContent-Icon').attr('class', 'gfTreeContent-Icon'+o.opt.iconType[tp]["close"])//原本是img改成font


                            if (tp == "folder") {
                                et.nextAll(".gfTreeItem").each(function () {
                                    if (pattern.test($(this).data().path)) {
                                        $(this).remove();
                                    }
                                });
                            } else {
                                var r = $(this).data();
                                r.selected = false;
                                o.target.trigger('onClick', r);
                                o.opt.activeItem.splice(o.opt.activeItem.indexOf($(this).data().id * 1), 1);
                            }
                        }


                        o.target.find('.gfTreeItemList').getNiceScroll().resize();
                    });

                //工具 - 搜尋
                o.target
                    .on('click', '.gfTreeToolbar-Icon[data-type="search"]', function () {
                        o.target
                            .find('.gfTreeSearchContainer')
                            .show()
                            .siblings()
                            .hide()
                    });
                o.target
                    .on('keyup', '.gfTreeSearchInput', function (e) {
                        var code = e.which;
                        if (code == 13) {
                            e.preventDefault();
                        }
                        if (code == 32 || code == 13 || code == 188 || code == 186) {
                            var val = $(this).val();
                            var resultDiv = $('<div/>');
                            o.opt.arrData
                                .filter(function (x) {
                                    return x[o.opt.iconField] != "folder" && x[o.opt.nameField].indexOf(val.trim()) >= 0;
                                })
                                .forEach(function (ele) {
                                    var st = "close";
                                    if (o.opt.activeItem.indexOf(ele[o.opt.identityField] * 1) >= 0) {
                                        st = "open";
                                    }

                                    var div = $('<div/>', {
                                        "class": "gfTreeItem",
                                        "data-id": ele[o.opt.identityField],
                                        "data-type": ele[o.opt.iconField],
                                        "data-kmlurl": ele[o.opt.urlField],
                                        "data-layerid2d": ele[o.opt.layeridField],
                                        "data-parentid": ele[o.opt.parentField],
                                        "data-lvl": 0,
                                        "data-st": st,
                                        "data-path": ele[o.opt.identityField],
                                        "data-x": ele[o.opt.flytoXField],
                                        "data-y": ele[o.opt.flytoYField],
                                        "data-z": ele[o.opt.flytoZField]
                                    });

                                    var icon = $('<i/>', {
                                        "class": "gfTreeContent-Icon"+ o.opt.iconType[ele[o.opt.iconField]][st]
                                        //"src": o.opt.iconType[ele[o.opt.iconField]][st]
                                    });
                                    div.append(icon);
                                    var span = $('<span/>', {
                                        "class": "gfTreeContent-Text",
                                        "text": ele[o.opt.nameField]
                                    });
                                    div.append(span);

                                    resultDiv.append(div);
                                });
                            o.target.find('.gfTreeSearchResultList')
                                .html(resultDiv);

                            o.target.find('.gfTreeSearchResultList').getNiceScroll().resize();
                        }


                    });
                //工具 - 回到圖層清單
                o.target
                    .on('click', '.gfTreeToolbar-Icon[data-type="list"]', function () {
                        o.target
                            .find('.gfTreeItemList')
                            .show()
                            .siblings()
                            .hide()
                    });

                //工具 - 歷史圖層
                // o.target
                //     .on('click', '.gfTreeToolbar-Icon[data-type="history"]', function () {
                //         o.target
                //             .find('.gfTreeHistoryContainer')
                //             .show()
                //             .siblings()
                //             .hide()
                //     });

                //工具 - 清除圖層
                o.target.on('click', '.gfTreeToolbar-Icon[data-type="clear"]', function () {
                    o._removeActiveData();
                });

                //右鍵選單
                if (o.opt.isTheme) {
                    var themes = {};
                    $.ajax({
                        method: 'GET',
                        url: o.opt.optionSource.get,
                        success: function (theme) {
                            theme.forEach(function (ele) {
                                themes[ele.id] = ele.name;
                            });
                        },
                    });
                }

                $.contextMenu({
                    selector: o._getSelector(o.target) + " .gfTreeItemList .gfTreeItem",
                    build: function($trigger, e) {
                        var target = $trigger.data();
                        var items = {};
                        if (o.opt.isFavorite) {
                            items["favorite"] = {
                                name: "加入最愛",
                                icon: "fa-heart",
                                disabled: (target.type == "folder")
                            };
                        }
                        if (o.opt.isTheme) {
                            items["layertheme"] = {
                                name: "加入主題",
                                type: 'select',
                                options: themes,
                                selected: Object.keys(themes)[0],
                                disabled: (target.type == "folder")
                            };
                            items["layerthemeadd"] = {
                                name: "加入",
                                disabled: (target.type == "folder"),
                            };
                        }
                        if (o.opt.isSetLocate) {
                            items["flyto"] = {
                                name: "定位圖層",
                                icon: "fa-dot-circle-o",
                                disabled: (target.type == "folder")
                            }
                        }
                        items["quit"] = {
                            name: "離開",
                            icon: "fa-sign-out"
                        }
                        return {
                            callback: function(key, options) {
                                //console.log(key);
                                //console.log(target);
                                o._contextMenuAction(key, target);
                            },
                            items: items
                        };
                    }
                });
            },

            _getAllData: function () {
                var o = this;
                return o.opt.arrData;
            },
            _getActiveData: function () {
                var o = this;
                return o.opt.arrData.filter(function (ele) {
                    return o.opt.activeItem.indexOf(ele[o.opt.identityField] * 1) >= 0;
                });
            },
            _getDataById: function (_id) {
                var o = this;
                return o.opt.arrData.filter(function (ele) {
                    return ele[o.opt.identityField] == _id;
                });
            },

            _removeActiveData: function () {
                var o = this;
                o.opt.activeItem.forEach(function (actIdentity) {

                    var domItem = o.target.find('.gfTreeItem[data-' + o.opt.identityField + '=' + actIdentity + ']');
                    var r = domItem.data();

                    domItem.data("st", "close");
                    domItem.attr("data-st", "close");
                    domItem.children('.gfTreeContent-Icon').attr('src', o.opt.iconType[r.type]["close"]);

                    r.selected = false;
                    o.target.trigger('onClick', r);
                });

                o.opt.activeItem = [];
            },

            _contextMenuAction: function(_action, _value){
                var o = this;
                switch(_action){
                    case "favorite":
                        o.target.trigger('onAddFavorite',  _value);
                        break;
                    case "layerthemeadd":
                        o.target.trigger('onAddLayerTheme',  _value);
                        break;
                    case "flyto":
                        o.target.trigger('onSetFlyto',  _value);
                        break;
                }
            },

            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');
                this.target.off('onInitComplete');
                this.target.off('onAddFavorite');
                this.target.off('onAddLayerTheme');
                this.target.off('onSetFlyto');
                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
                if (typeof (this.opt.onInitComplete) === 'function') {
                    this.target.on('onInitComplete', this.opt.onInitComplete);
                }
                if (typeof (this.opt.onAddFavorite) === 'function') {
                    this.target.on('onAddFavorite', this.opt.onAddFavorite);
                }
                if (typeof (this.opt.onAddLayerTheme) === 'function') {
                    this.target.on('onAddLayerTheme', this.opt.onAddLayerTheme);
                }
                if (typeof (this.opt.onSetFlyto) === 'function') {
                    this.target.on('onSetFlyto', this.opt.onSetFlyto);
                }
            },

            _getSelector: function(jqueryObj){
                var selector =
                    jqueryObj
                        .parents()
                        .map(function() { return this.tagName; })
                        .get()
                        .reverse()
                        .concat([this.nodeName])
                        .join(">");

                var id = jqueryObj.attr("id");
                if (id) {
                    selector += "#"+ id;
                }

                var classNames = jqueryObj.attr("class");
                if (classNames) {
                    selector += "." + $.trim(classNames).replace(/\s/gi, ".");
                }

                return selector;
            }

        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gftree;
        this.each(function () {
            gftree = new gfTree($(this), options);
        });
        this.getAllData = function () {
            return gftree._getAllData();
        };
        this.getActiveData = function () {
            return gftree._getActiveData();
        };
        this.getDataById = function (_id) {
            return gftree._getDataById(_id);
        };
        this.removeActiveData = function () {
            return gftree._removeActiveData();
        }
        return this;
    };
})(jQuery, window, document);