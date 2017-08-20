;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfTree2'; //Plugin名稱
    var gfTree;

    if($.cachedScript == undefined){
        $.cachedScript = function (url, options) {
            // Allow user to set any option except for dataType, cache, and url
            options = $.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url
            });
            // Use $.ajax() since it is more flexible than $.getScript
            // Return the jqXHR object so we can chain callbacks
            return $.ajax(options);
        };
    }

    //Load dependencies first
    $.cachedScript('./node_modules/jquery.nicescroll/dist/jquery.nicescroll.min.js').done(function(){
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
            }
        };

        //預設參數
        gfTree.defaults = {
            arrData: [],//原始資料
            activeItem: [],//開啟的物件

            css: {
                'width': '300px',
                'height': '300px',
                'background-color': '#e3f0db',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'display': 'inline-block'
            },

            identityField: 'id',//識別欄位
            nameField: 'name',//名稱欄位
            parentField: 'parent_id',//父層識別欄位
            isparentField: 'isparent',//是否為父層欄位
            iconField: 'type',//圖示類型欄位
            urlField: 'kmlurl',
            layeridField: 'layerid2d',
            iconType: {
                'folder': '<img class="gfTreeContent-Icon" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU4IDU4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OCA1ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiNFRkNFNEE7IiBkPSJNNTUuOTgxLDU0LjVIMi4wMTlDMC45MDQsNTQuNSwwLDUzLjU5NiwwLDUyLjQ4MVYyMC41aDU4djMxLjk4MUM1OCw1My41OTYsNTcuMDk2LDU0LjUsNTUuOTgxLDU0LjV6ICAiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0VCQkExNjsiIGQ9Ik0yNi4wMTksMTEuNVY1LjUxOUMyNi4wMTksNC40MDQsMjUuMTE1LDMuNSwyNCwzLjVIMi4wMTlDMC45MDQsMy41LDAsNC40MDQsMCw1LjUxOVYxMC41djEwaDU4ICB2LTYuOTgxYzAtMS4xMTUtMC45MDQtMi4wMTktMi4wMTktMi4wMTlIMjYuMDE5eiIvPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNFQjc5Mzc7IiBkPSJNMTgsMzIuNWgxNGMwLjU1MiwwLDEtMC40NDcsMS0xcy0wLjQ0OC0xLTEtMUgxOGMtMC41NTIsMC0xLDAuNDQ3LTEsMVMxNy40NDgsMzIuNSwxOCwzMi41eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0VCNzkzNzsiIGQ9Ik0xOCwzOC41aDIyYzAuNTUyLDAsMS0wLjQ0NywxLTFzLTAuNDQ4LTEtMS0xSDE4Yy0wLjU1MiwwLTEsMC40NDctMSwxUzE3LjQ0OCwzOC41LDE4LDM4LjV6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRUI3OTM3OyIgZD0iTTQwLDQyLjVIMThjLTAuNTUyLDAtMSwwLjQ0Ny0xLDFzMC40NDgsMSwxLDFoMjJjMC41NTIsMCwxLTAuNDQ3LDEtMVM0MC41NTIsNDIuNSw0MCw0Mi41eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />',
                '向量': '<img class="gfTreeContent-Icon" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYwIDYwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MCA2MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHJlY3QgeD0iMTMiIHk9IjE0IiBzdHlsZT0iZmlsbDojNTU2MDgwOyIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIi8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzM4M0JGOyIgZD0iTTU0LDU3SDZ2LTNIM1Y2aDNWM2g0OHYzaDN2NDhoLTNWNTd6IE04LDU1aDQ0di0zaDNWOGgtM1Y1SDh2M0g1djQ0aDNWNTV6Ii8+Cgk8cG9seWdvbiBzdHlsZT0iZmlsbDojNzM4M0JGOyIgcG9pbnRzPSIzNSwyNSAzNSwzNiAyNCwzNiAyNCw0NyA0Niw0NyA0NiwyNSAgIi8+Cgk8Zz4KCQk8cmVjdCB4PSIxIiB5PSIxIiBzdHlsZT0iZmlsbDojNTU2MDgwOyIgd2lkdGg9IjYiIGhlaWdodD0iNiIvPgoJCTxwYXRoIHN0eWxlPSJmaWxsOiM1NTYwODA7IiBkPSJNOCw4SDBWMGg4Vjh6IE0yLDZoNFYySDJWNnoiLz4KCTwvZz4KCTxnPgoJCTxyZWN0IHg9IjUzIiB5PSIxIiBzdHlsZT0iZmlsbDojNTU2MDgwOyIgd2lkdGg9IjYiIGhlaWdodD0iNiIvPgoJCTxwYXRoIHN0eWxlPSJmaWxsOiM1NTYwODA7IiBkPSJNNjAsOGgtOFYwaDhWOHogTTU0LDZoNFYyaC00VjZ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSIxIiB5PSI1MyIgc3R5bGU9ImZpbGw6IzU1NjA4MDsiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiLz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojNTU2MDgwOyIgZD0iTTgsNjBIMHYtOGg4VjYweiBNMiw1OGg0di00SDJWNTh6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSI1MyIgeT0iNTMiIHN0eWxlPSJmaWxsOiM1NTYwODA7IiB3aWR0aD0iNiIgaGVpZ2h0PSI2Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6IzU1NjA4MDsiIGQ9Ik02MCw2MGgtOHYtOGg4VjYweiBNNTQsNThoNHYtNGgtNFY1OHoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />',
                'kmlurl': '<img class="gfTreeContent-Icon" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDU1MC44MDEgNTUwLjgwMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTUwLjgwMSA1NTAuODAxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ3NS4wOTUsMTMyYy0wLjAzMS0yLjUyOS0wLjgyOC01LjAyMy0yLjU2Mi02Ljk5NUwzNjYuMzI1LDMuNjk0Yy0wLjAyMS0wLjAzMS0wLjA1My0wLjA0Mi0wLjA4NS0wLjA3NCAgICBjLTAuNjMzLTAuNzA5LTEuMzYtMS4yOTItMi4xNDEtMS44MDNjLTAuMjMyLTAuMTUzLTAuNDY0LTAuMjg4LTAuNzA3LTAuNDIyYy0wLjY4Ni0wLjM2OS0xLjM5Mi0wLjY3LTIuMTMtMC44OTIgICAgYy0wLjItMC4wNjEtMC4zOC0wLjE0LTAuNTgtMC4xOTVDMzU5Ljg3LDAuMTE5LDM1OS4wNDgsMCwzNTguMjA0LDBIOTcuMmMtMTEuOTA3LDAtMjEuNiw5LjY5NS0yMS42LDIxLjYwMXY1MDcuNiAgICBjMCwxMS45MTMsOS42OTIsMjEuNjAxLDIxLjYsMjEuNjAxaDM1Ni40YzExLjkxOCwwLDIxLjYtOS42ODgsMjEuNi0yMS42MDFWMTMzLjIxQzQ3NS4yLDEzMi44MDQsNDc1LjEzNywxMzIuMzk4LDQ3NS4wOTUsMTMyeiAgICAgTTE4MC4xNDksNTEyLjcyMWwtMjcuMzgyLTQ4LjI4OWwtOS42MjQsMTEuNzkydjM2LjUwM2gtMjUuMDU0VjQwMC44ODJoMjUuMDU0djQ5LjQzOGgwLjUwNGMyLjQ4OS00LjMxMyw1LjEzOS04LjI5LDcuNjM2LTEyLjI3MSAgICBsMjUuMzg0LTM3LjE2N0gyMDcuN2wtMzcuMDA3LDQ3LjYyNGwzOC45OTUsNjQuMjE1SDE4MC4xNDl6IE0zMTYuMjA2LDUxMi43MjFsLTEuNjU1LTQyLjgxNCAgICBjLTAuNDk2LTEzLjQzOC0xLjAwMi0yOS43LTEuMDAyLTQ1Ljk2NGgtMC40OTZjLTMuNDg1LDE0LjI3NS04LjEyNiwzMC4yMDYtMTIuNDQsNDMuMzExbC0xMy42MSw0My42NDRoLTE5Ljc0NmwtMTEuOTQ0LTQzLjMxMSAgICBjLTMuNjQ5LTEzLjExLTcuNDYyLTI5LjA0Ny0xMC4xMjUtNDMuNjQ0aC0wLjMzNWMtMC42NjUsMTUuMTA0LTEuMTYsMzIuMzUzLTEuOTg1LDQ2LjI5NmwtMS45OTQsNDIuNDc4aC0yMy4zOThsNy4xMzctMTExLjgzOSAgICBoMzMuNjg3bDEwLjk1LDM3LjMzNmMzLjQ4MywxMi45NCw2Ljk2NiwyNi44ODQsOS40NTUsMzkuOTgyaDAuNDk4YzMuMTU0LTEyLjkzNiw2Ljk3Mi0yNy43MTcsMTAuNjIxLTQwLjE1N2wxMS45NDQtMzcuMTY3aDMzLjAyMiAgICBsNi4xMzgsMTExLjgzOWgtMjQuNzIyVjUxMi43MjF6IE00MzAuMTkxLDUxMi43MjFoLTY5Ljg2N1Y0MDAuODgyaDI1LjM5MnY5MC42MDNoNDQuNDc2VjUxMi43MjF6IE05Ny4yLDM2Ni43NThWMjEuNjA1aDI1MC4yMDQgICAgdjExMC41MTljMCw1Ljk2MSw0LjgzLDEwLjgsMTAuOCwxMC44aDk1LjM5NmwwLjAxMSwyMjMuODM0SDk3LjJ6IiBmaWxsPSIjMDA2REYwIi8+CgkJPGc+CgkJCTxwYXRoIGQ9Ik0yNzIuMDI1LDY0LjUwNWM3Mi40NTItMC4yNzYsMTMyLjg5MSw1OS4wMzQsMTMyLjc0OCwxMzIuOTJjLTAuMTQzLDcyLjEwMS01OS41NDIsMTMzLjA0Ni0xMzMuODU1LDEzMi40ODEgICAgIGMtNzIuODM5LTAuNTU5LTEzMS42NjItNjEuNjA2LTEzMS40MjUtMTMzLjMxMkMxMzkuNzM2LDEyNC4xMzcsMTk5LjQ3Niw2NC4yOTksMjcyLjAyNSw2NC41MDV6IE0xNTQuNDYyLDE2MS4xOTYgICAgIGMwLjQzMywwLjMwOSwwLjg2NSwwLjYwNiwxLjI5NSwwLjkxMmMxLjMxMy0wLjc5NCwyLjczNC0xLjQ2MywzLjkxLTIuNDE4YzIuNjE4LTIuMTM4LDUuMDctNC40OTgsNy42NzMtNi42NTcgICAgIGMxNS42MTctMTIuOTY4LDMyLjYxNi0xNi43NTcsNTEuMzcxLTcuMzE3YzYuMzQ0LDMuMTksMTIuNjk2LDYuNTE2LDE4LjYwMiwxMC40MzdjMjYuMTA5LDE3LjMyOCw1MS42NzEsMzUuNTIxLDc4LjIwOCw1Mi4xNjUgICAgIGMyMC45OTksMTMuMTgxLDQzLjg3LDIyLjYxLDY4LjQ2LDI3LjM4MmMzLjc5NywwLjc0MSw1LjUtMC4yNTMsNi4yMjMtMy42NDRjMC45OTEtNC42MTcsMS41NjYtOS4zMzcsMi44MTYtMTMuODc3ICAgICBjMC44MzMtMi45ODctMC4yNzQtNC4wOTUtMi44MTItNC42ODhjLTEzLjA3Mi0zLjA4Mi0yNS4wNjktOC44NzgtMzUuNDk1LTE3LjAxYy0xOS4wNjgtMTQuODgxLTM3LjYtMzAuNDc4LTU2LjA4My00Ni4xMDUgICAgIGMtMTIuNzg4LTEwLjgyNi0yNC45NC0yMi40MDktMzcuNjg3LTMzLjMwMmMtMTcuMzA1LTE0Ljc2OS0zNy41ODktMTcuNDk3LTU5LjE3My0xMy4xNzZjLTUuMzI5LDEuMDYyLTExLjU4OCwyLjI1Mi0xNS4zMjUsNS42NjQgICAgIGMtMTIuODUyLDExLjc1Mi0yMy4wNDIsMjUuNzE2LTI5LjEzMyw0Mi4yODJDMTU2LjE4OSwxNTQuODk1LDE1NS40LDE1OC4wOCwxNTQuNDYyLDE2MS4xOTZ6IE0zNzMuNTEzLDI2Ni41OTkgICAgIGMtMC40OS0wLjUyOS0wLjk3Ni0xLjA0Ni0xLjQ3Mi0xLjU3NmMtMS41NzEsMC4zOTYtMy4xNDMsMC43NTctNC43MDMsMS4xODRjLTE2LjY3NSw0LjU2Ny0zMy41OTgsOC41NjQtNTAuODk5LDcuNjk5ICAgICBjLTE0LjkzOS0wLjc1MS0yOS45MjItMi43ODctNDQuNjI0LTUuNTc5Yy0yNS40MjMtNC44MzEtNDguOTc3LTE1LjQxNC03Mi43OTItMjUuMTk2Yy03LjUzOC0zLjA5My0xNS43MDQtNS43NjItMjMuNzM4LTYuMzA4ICAgICBjLTEwLjc0Ny0wLjczMi0xNi42NDgsMTAuMTM2LTExLjU0MSwxOS40MmMxMi4wMSwyMS44MjEsMjkuMDQ5LDM4LjU4Niw1MS4wNzMsNTAuMjI5YzEuNzY3LDAuOTI4LDMuNzg2LDEuMzcxLDYuNjkyLDIuMzk5ICAgICBjLTAuNTgzLTIuODk2LTAuODM5LTQuNTItMS4yMzctNi4wOTdjLTIuOTE3LTExLjU4NSwxLjgxNC0xNi40MzcsMTMuNjg3LTEzLjk5YzEuNjUzLDAuMzQzLDMuMzEyLDAuNjc1LDQuOTUyLDEuMTA3ICAgICBjMjguNTcxLDcuMzcyLDU3LjQzLDEwLjgyMSw4Ni44NzIsNi4zODFjMTUuNTYyLTIuMzUyLDMwLjc4Ni01LjM3NCw0MC41MjYtMTkuNzIzICAgICBDMzY4LjYwOCwyNzMuMTU0LDM3MS4xMTMsMjY5LjkwMywzNzMuNTEzLDI2Ni41OTl6IE0yMzYuOTMxLDc5Ljc0OGMwLjA4NywwLjcwNywwLjE3MSwxLjQwNSwwLjI1OCwyLjExMiAgICAgYzEuMjM3LDAuMjA2LDIuNDYzLDAuNTQ2LDMuNywwLjYwNGM2LjQxNSwwLjM1OCwxMi44MywwLjU4NSwxOS4yNCwwLjk3M2MyMy40NTcsMS40MjEsNDQuMTQ5LDkuODUxLDYwLjA1NCwyNy4xMDggICAgIGMxMi4zNTUsMTMuMzg3LDIyLjc0NCwyOC41ODIsMzQuMzgzLDQyLjY1NGM1LjEzNiw2LjIyNSwxMC44MTUsMTIuMTM5LDE2Ljk1NCwxNy4zNzhjNC42MTQsMy45MzcsMTAuMTcyLDMuMzc1LDE0LjA3NCwwLjE5MiAgICAgYzQuMjYyLTMuNDc4LDQuOTQ3LTYuNzg3LDIuNzY5LTEzLjIzOWMtNy42OTMtMjIuODA1LTIxLjE1MS00MS43LTQwLjEzNi01Ni4yNTJjLTI3LjUyNy0yMS4xMi01OC43MjUtMzAuMDQ4LTkzLjM3OS0yNS40NDQgICAgIEMyNDguODE3LDc2LjYzMSwyNDIuOTAzLDc4LjQxOSwyMzYuOTMxLDc5Ljc0OHoiIGZpbGw9IiMwMDZERjAiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />',
                'wms': '<img class="gfTreeContent-Icon" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDQgNTA0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MDQgNTA0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGNpcmNsZSBzdHlsZT0iZmlsbDojRkQ4NDY5OyIgY3g9IjI1MiIgY3k9IjI1MiIgcj0iMjUyIi8+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNFNkU5RUU7IiBwb2ludHM9IjMzMS4yLDE0OS41IDQxMC4zLDExOC40IDQxMC4zLDM1NC41IDMzMS4yLDM4NS42ICIvPgo8cG9seWdvbiBzdHlsZT0iZmlsbDojRkZGRkZGOyIgcG9pbnRzPSIzMzEuMiwxNDkuNSAyNTIsMTE4LjQgMjUyLDM1NC41IDMzMS4yLDM4NS42ICIvPgo8cG9seWdvbiBzdHlsZT0iZmlsbDojRTZFOUVFOyIgcG9pbnRzPSIxNzIuOCwxNDkuNSAyNTIsMTE4LjQgMjUyLDM1NC41IDE3Mi44LDM4NS42ICIvPgo8cG9seWdvbiBzdHlsZT0iZmlsbDojRkZGRkZGOyIgcG9pbnRzPSIxNzIuOCwxNDkuNSA5My43LDExOC40IDkzLjcsMzU0LjUgMTcyLjgsMzg1LjYgIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />'
            },
            scrollColor: '#527100',
            switch: {
                on: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6I0E0RTI3NjsiIGQ9Ik0zNzIuMzY0LDM0OS4wOTFjLTUxLjMzLDAtOTMuMDkxLTQxLjc2MS05My4wOTEtOTMuMDkxczQxLjc2MS05My4wOTEsOTMuMDkxLTkzLjA5MSAgYzEyLjg1MywwLDIzLjI3My0xMC40MiwyMy4yNzMtMjMuMjczYzAtMTIuODUzLTEwLjQyLTIzLjI3My0yMy4yNzMtMjMuMjczSDEzOS42MzZDNjIuNjQxLDExNi4zNjQsMCwxNzkuMDA1LDAsMjU2ICBzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjdjMTIuODUzLDAsMjMuMjczLTEwLjQyLDIzLjI3My0yMy4yNzNTMzg1LjIxNiwzNDkuMDkxLDM3Mi4zNjQsMzQ5LjA5MXoiLz4KPGNpcmNsZSBzdHlsZT0iZmlsbDojRkZGRkZGOyIgY3g9IjM3Mi4zNjQiIGN5PSIyNTYiIHI9IjExNi4zNjQiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0E5QThBRTsiIGQ9Ik0zNzIuMzY0LDM5NS42MzZjLTc2Ljk5NSwwLTEzOS42MzYtNjIuNjQxLTEzOS42MzYtMTM5LjYzNnM2Mi42NDEtMTM5LjYzNiwxMzkuNjM2LTEzOS42MzYgIFM1MTIsMTc5LjAwNSw1MTIsMjU2UzQ0OS4zNTksMzk1LjYzNiwzNzIuMzY0LDM5NS42MzZ6IE0zNzIuMzY0LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzQ2NS40NTUsMzA3LjMzLDQ2NS40NTUsMjU2UzQyMy42OTQsMTYyLjkwOSwzNzIuMzY0LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=',
                off: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6Izc3NzU3RjsiIGQ9Ik0zNzIuMzY0LDExNi4zNjRIMTM5LjYzNkM2Mi42NDEsMTE2LjM2NCwwLDE3OS4wMDUsMCwyNTZzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjcgIEM0NDkuMzU5LDM5NS42MzYsNTEyLDMzMi45OTUsNTEyLDI1NlM0NDkuMzU5LDExNi4zNjQsMzcyLjM2NCwxMTYuMzY0eiIvPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBjeD0iMTM5LjYzNiIgY3k9IjI1NiIgcj0iMTE2LjM2NCIvPgo8cGF0aCBzdHlsZT0iZmlsbDojQTlBOEFFOyIgZD0iTTEzOS42MzYsMzk1LjYzNkM2Mi42NDEsMzk1LjYzNiwwLDMzMi45OTUsMCwyNTZzNjIuNjQxLTEzOS42MzYsMTM5LjYzNi0xMzkuNjM2ICBTMjc5LjI3MywxNzkuMDA1LDI3OS4yNzMsMjU2UzIxNi42MzIsMzk1LjYzNiwxMzkuNjM2LDM5NS42MzZ6IE0xMzkuNjM2LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzIzMi43MjcsMzA3LjMzLDIzMi43MjcsMjU2UzE5MC45NjcsMTYyLjkwOSwxMzkuNjM2LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='
            },
            onClick: undefined,
            onSelect: undefined,
            onUnSelect: undefined,
            onInitComplete: undefined,
            onDragStart: undefined,
            onDragEnd: undefined
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
                o.opt.arrData.filter(function(x){ return x[o.opt.parentField] == 0; }).forEach(function(ele){
                    var div = $('<div/>', {
                        "class": "gfTreeItem",
                        "data-id": ele[o.opt.identityField],
                        "data-type": ele[o.opt.iconField],
                        "data-url": ele[o.opt.kmlField],
                        "data-layerid": ele[o.opt.layeridField],
                        "data-parentid": ele[o.opt.parentField],
                        "data-lvl": 0,
                        "data-st": "close",
                        "data-path": ele[o.opt.identityField]
                    });

                    var icon = o.opt.iconType[ele[o.opt.iconField]];
                    div.append(icon);
                    var span = $('<span/>',{
                        "class": "gfTreeContent-Text",
                        "text": ele[o.opt.nameField]
                    });
                    div.append(span);

                    o.target.append(div);
                });

                o.target.niceScroll({ cursorcolor: o.opt.scrollColor});
            },
            _event: function () {
                var o = this;
                o.target
                    .on('click', '.gfTreeItem', function(e){
                        var et = $(this);
                        var eid = et.data().id;
                        var lvl = et.data().lvl;
                        var st = et.data().st;
                        var path = et.data().path;
                        var pattern = new RegExp('^' + path + "_");

                        if(st == "close")
                        {
                            $(this).data("st", "open");
                            $(this).attr("data-st", "open");

                            o.opt.arrData
                                .filter(function(x){ return x[o.opt.parentField] == eid; })
                                .sort(function(a, b){ return a[o.opt.identityField] < b[o.opt.identityField]; })
                                .forEach(function(ele){
                                    var div = $('<div/>', {
                                        "class": "gfTreeItem",
                                        "data-id": ele[o.opt.identityField],
                                        "data-type": ele[o.opt.iconField],
                                        "data-url": ele[o.opt.kmlField],
                                        "data-layerid": ele[o.opt.layeridField],
                                        "data-parentid": ele[o.opt.parentField],
                                        "data-lvl": lvl + 1,
                                        "data-st": "close",
                                        "data-path": path + "_" + ele[o.opt.identityField]
                                    });
                                    div.css('padding-left', (lvl + 1) * 15 + 10 + "px");

                                    var icon = o.opt.iconType[ele[o.opt.iconField]];
                                    div.append(icon);
                                    var span = $('<span/>',{
                                        "class": "gfTreeContent-Text",
                                        "text": ele[o.opt.nameField]
                                    });
                                    div.append(span);

                                    et.after(div);
                                });
                        }
                        else{
                            $(this).data("st", "close");
                            $(this).attr("data-st", "close");

                            et.nextAll(".gfTreeItem").each(function(){
                                if(pattern.test($(this).data().path)){
                                    $(this).remove();
                                }
                            });
                        }
                        o.target.getNiceScroll().resize();
                    });

            },

            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');

                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
            }



        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gftree;
        this.each(function () {
            gftree = new gfTree($(this), options);
        });
        /*
        this.dispose = function () {
            gftree._dispose();
        };

        this.getData = function () {
            return gftree._getData();
        };
        this.getDataById = function (id) {
            return gftree._getDataById(id);
        };
        this.getBreadcrumb = function () {
            return gftree._getBreadcrumb();
        };
        */
        return this;
    };
})(jQuery, window, document);