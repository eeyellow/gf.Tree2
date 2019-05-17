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

                this.target.trigger('onInitComplete');
            }
        };

        //預設參數
        gfTree.defaults = {
            arrData: [], //原始資料
            activeItem: [], //開啟的物件

            css: {
                'width': '300px',

                'background-color': '#e3f0db',
                'overflow-y': 'hidden',
                'overflow-x': 'hidden'
            },

            identityField: 'id', //識別欄位
            nameField: 'name', //名稱欄位
            parentField: 'parent_id', //父層識別欄位
            isparentField: 'isparent', //是否為父層欄位
            iconField: 'type', //圖示類型欄位
            sortField: 'seq', //排序欄位
            urlField: 'kmlurl',
            layeridField: 'layerid2d',
            flytoXField: 'x',
            flytoYField: 'y',
            flytoZField: 'z',

            iconType: {
                'folder': {
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAFKElEQVRYhe2XzY4kRxWFv3vjJ7O6zYwR8sCIhVcWrwE7e8HW3voFbL8KNi/ACmFWXmEvkXiB2SJ5wwYYzVhT3dNV+RMRN1hEZnS35B9sWcyGkFqdWRkVceLcc86tlForr3LoK939/wAA2S8++fTzXwN/AN78hrn/AN7/8L13/vp9Nvgujfk715/98vHjhw8e/AQAKwYiiDSMV9dXb/7r308/A17/PgC+a8gnn35eAV5/+IBHb7zBi5sZEUFVMTNqrdRa+dmDS54+e8bxePxBG33w7tvydZ97gF+99RbUynnNnbKcMwDOOQBO88ovHj3i8c8fsbNazRBVzArOOazc3sttdfn7l19+I7Begq9ennHO4ZzrIPZrMyOL8OJmQkTIOeO9p5TSmboLttaKiFBK4aevjd/KjAcQEZ4//ee3Tvyh49n2//d//uJr1XhXhLz/29/ANm0XX1exgMqta0WkPRMQ2mnhDgvbQvsz51yfo6rM68ofv/jbk3sArm4mrk4zh8MBEeF8PnM4HFjXlWEYWJall2Acxw4i50zOGRHp83PODMNwb/MQQgMpcLx+CXCl0MQE4LxnPBw4TxPzslCBaZ4JMbKsK+ocVivj4UAuhWJGBXIpVCDEyJoSPgTGw4E1JRBBnaMC52mCDXSxCnBUANFGbcqFNWUQpVhFnSfEgWVNVIRiFattXi4GopynGaswHi6Y5oVilVyMlAvOB9aUKVbxIRKHkWVNOKe8eHkD8KQB2BxTqR3tMI4gQi6FXAop535vtYIIKWeGcURUOU8Th4sL1Ll+6v07xYxlXdtGInjvu7bu9YLgIyA455mmmZwLqo5xPDAMI6UYIURElBAiKWUaFkXVcTqdm+xESSnjnMc5TylGzoVlWTGr1ArH68aAB7o6ixXWtGJmxBgxM0SFZV2otRJjvM2FNeODZ00r3ntyyhwuDtRamZcZVaVYuVW+0ybYklnTSmqfH+8x0KhVRB3FKvOy9ppWBKtgFdT5fp9yoVhF1DHNC1bp31/WBKI4H7BKXwvRprUdwO5dEcV5z5oSdXPFruRd6SnnezrYHbHXfp8fYkSdI5fCvCzkUkAE55vzr29OfPDu202EO01tceuIK4IPER9iP60630+zKzzEoTtA1FERbk5nEMWHyDAeurPa+rfx4/e06nYUw2olrStx8/We/bkU4hYqcQsZUeW0Bda0+TzG2J+nde3JOY4jWo3nL44AT7oL9tgEmsC2pFNVvPcMw4CIEELoqTfPM9C6Zq2VlBLOud6cVJWUEnuJY4zknHGuOQS46gzcDuE8zYQQKNYWNTPGcWReVlS1dzoQljXhvScOreNVawEErUv6EHHOsSytPGbG5RC3ORw7A7sIEcGH0AW1C2+PXOc9znvUuT5nD6RpnllTIsSIqFKs1XqaZ+IwdOF6J7w8T70E93KgUVpIKW+UtxO0xjIyTROqinOOlFYuLi46cy2cAtM097VOpzMxRuZ5QdX1Eu69pzMge5sVBZEew7t9Us49auuWF7v9dgvucVvMugVDjFitiGpvVCLK9el8nwGz2yT0IWC1dpr3Da1Wbk6n1lrNyHNLu6YXI25CTSlRzChm935T7iVFZRfhcQfw8bPnzz/aqXw4NiU3xTpqBb2Mt83jzrOcC861+xAiOSfC5SV7WdvPMkNVtuuAiLZWnvNV2xH4+E9/+Z2IfMT/cHz43ju+1lpks5UDIvAacLn9BX68N6cKZGACboBrYLkL4Efa579Ec+dtSV716/l/AEMVgc68DbpnAAAAAElFTkSuQmCC',
                    'open': 'data:image/png;base64,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',
                },
                '向量': {
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                },
                'kmlurl': {
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                },
                'wms': {
                    'close': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAABpUlEQVRYhe2XTUsCQRjHf5Ob4Fshhl6jKLvUHjuV3Tx27OipxI8hfYgi6BB9g+6Bq178AIIvSZfEhAQNoYRyO7gry7Zi5rp68A8Pywyz8/z2+c8OM0JVVXQJIcgouTiQAk6ZXnfA1UnsqABgzDXMaexUsvmkJEnX0egOG6HQVJkr1RrrawFK5coQwgpAMrVTsryP3+ezpJ1UkUgYIFEqV8goOYCCecyKqS3blRwGJY9EwuxFdxNASsnmD8cBDF60IfR5+mMgzBbo6BN96Uhp8+gQaHZgsMKyArNQv98fQhj7LStgVwGeas9jx1hbwPQE21ubv/pcLheNRmM8gE0F+JNGLMJ5AzhIsLRgRAXmbIGTFXBsJxylpQUL+hsuLXAu/4xPRP8FcLICi7kROWnBihACPQCl3eng9XpsOZobw+v10O50ABQjgAQI7eluNl/vi0UpZsfVzKy3VotyuUqv17sRQghVu/0IwAW4gQAQSKcv4weyfBYMBo/tBOh2u4/1+stt8uL8AfhUVfXbDOAHfFqsYt8CVYEv4APoAu9AzwjgqMz3zh+JJ8M3gBMOmgAAAABJRU5ErkJggg==',
                    'open': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzkvMTETEwwTAAAEE0lEQVRYhd2XX2xTVRzHP7f39ra9bQUCYYoGCGQUha0DE4UEGOoDRklAY5Ro4l6EZSYEHiQ++AIxPmg08cU/EI0hGjUmBkGNJgSzbiOTjAADJ+s2BuyvQ0YotL339t57rg/tmlK7P3UVE7/NeTgn93d+n35/55x7j+S6LhOSJInmWOsWoAnYxux1GPhoc/3GUwCFufI5CwdjLW2NiqJ8HIlUs2D+/Fll7um9xJx7wnTHe/IQpQCUon5TNFpDKBgsSVuuqqoWAjR0x3tojrUCnCp+xlPUj1YqOWQtr6payMrIigagKdbS9uh0ANnACrSJecQ0EMUlmEAv659Oqtw8ExDkykFBKUo68G9ICJGHKBwv6UClDOi7dHnaZ0qXgNkTLF+29G9jsiwzOjo6PUCFDJiRJlmE/zXAXST4f5Ug3tdP+5nzXBkaRZKyO9x1BUsfuI/1a2tZ/eCKmQG4/4DgyI/H6ezuQ5YVvD4/sicL4AjBwMg1Lg/+zJrefhbODd0RV/ogKvPcPfLDcc5d7EWWFVSfn4CmoYXCaKEwgUAAWVFwHEFHZxdnu3pmAFCG4n39nL3Yk0vuwxcI4PcHUH1+vKoPj0fGNA3StxOYhsHgtXFefvW1x6YEcMv4new4h8fjQVFVvKoPr9eLR1ZAkrBti+StBGGfl3f2v07tQ9Xcup1EUX17pnagDPsvDw5nF5xwyWQMLMtCODYZwyAxfh1VEuxpbCDg9/Pis9vwelW8qpr/2qrINnQcgWkkCGl+bqTShEJh9HQKLw57d+8kqGnohsmHX3yLLCs4jp2PnWQNzNwC13URjk3dqgj79+0msmQRA1f7sc00+wqSH/rqO8au38gWruBtN+tzQAiBR5Z5buuTADy//SkSiZvsangJTQsAcOxEGyN/3sCyLBzHRggxtQPl7MJlixeh6wbvHTyMrpsENY29Ta/kk3/9/XHO/NaNZRpkTAPbsrBM8+iUALjujNv6h+tIpVJcGRzi3YOfoetmfpovj/5Ex/nfMQ0dQ0+TMQ0c28bQ0+9XzIFI9XI2PLIG28pw5eoQb3/wCbpucPibo7SfPo+p6xjpNBnDwLYyVC+5HyuTaZ7INcnbsDzteGYrAC3tpxkYGmH3G28h5Y5iVwiEEAjH4YmN61h87wI6znTmYyv2Ubpj+9PUrVrJL62/ciHei4SUnQqXmkg1j29cx9roamItbXfESYWd5lhrczRaUz93zhxSab1siKkU1ALcTCTo7LwQq9+0YfPEuJKDUAB1bOyPz7u6lPpKXM2KdX18nHi8F9M0D0mSJLm5w0ACZEAFwkD4wIE3t9RGoy/MmzdvUyUBksnkieHhoU8bd+08Bhiu6zrFACEgmGteKndncAEb0IEkcAswCwHuqorvnX8BQwcw2KDp4OkAAAAASUVORK5CYII=',
                }
            },
            scrollColor: '#527100',
            /*
            switch: {
                on: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6I0E0RTI3NjsiIGQ9Ik0zNzIuMzY0LDM0OS4wOTFjLTUxLjMzLDAtOTMuMDkxLTQxLjc2MS05My4wOTEtOTMuMDkxczQxLjc2MS05My4wOTEsOTMuMDkxLTkzLjA5MSAgYzEyLjg1MywwLDIzLjI3My0xMC40MiwyMy4yNzMtMjMuMjczYzAtMTIuODUzLTEwLjQyLTIzLjI3My0yMy4yNzMtMjMuMjczSDEzOS42MzZDNjIuNjQxLDExNi4zNjQsMCwxNzkuMDA1LDAsMjU2ICBzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjdjMTIuODUzLDAsMjMuMjczLTEwLjQyLDIzLjI3My0yMy4yNzNTMzg1LjIxNiwzNDkuMDkxLDM3Mi4zNjQsMzQ5LjA5MXoiLz4KPGNpcmNsZSBzdHlsZT0iZmlsbDojRkZGRkZGOyIgY3g9IjM3Mi4zNjQiIGN5PSIyNTYiIHI9IjExNi4zNjQiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0E5QThBRTsiIGQ9Ik0zNzIuMzY0LDM5NS42MzZjLTc2Ljk5NSwwLTEzOS42MzYtNjIuNjQxLTEzOS42MzYtMTM5LjYzNnM2Mi42NDEtMTM5LjYzNiwxMzkuNjM2LTEzOS42MzYgIFM1MTIsMTc5LjAwNSw1MTIsMjU2UzQ0OS4zNTksMzk1LjYzNiwzNzIuMzY0LDM5NS42MzZ6IE0zNzIuMzY0LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzQ2NS40NTUsMzA3LjMzLDQ2NS40NTUsMjU2UzQyMy42OTQsMTYyLjkwOSwzNzIuMzY0LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=',
                off: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6Izc3NzU3RjsiIGQ9Ik0zNzIuMzY0LDExNi4zNjRIMTM5LjYzNkM2Mi42NDEsMTE2LjM2NCwwLDE3OS4wMDUsMCwyNTZzNjIuNjQxLDEzOS42MzYsMTM5LjYzNiwxMzkuNjM2aDIzMi43MjcgIEM0NDkuMzU5LDM5NS42MzYsNTEyLDMzMi45OTUsNTEyLDI1NlM0NDkuMzU5LDExNi4zNjQsMzcyLjM2NCwxMTYuMzY0eiIvPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBjeD0iMTM5LjYzNiIgY3k9IjI1NiIgcj0iMTE2LjM2NCIvPgo8cGF0aCBzdHlsZT0iZmlsbDojQTlBOEFFOyIgZD0iTTEzOS42MzYsMzk1LjYzNkM2Mi42NDEsMzk1LjYzNiwwLDMzMi45OTUsMCwyNTZzNjIuNjQxLTEzOS42MzYsMTM5LjYzNi0xMzkuNjM2ICBTMjc5LjI3MywxNzkuMDA1LDI3OS4yNzMsMjU2UzIxNi42MzIsMzk1LjYzNiwxMzkuNjM2LDM5NS42MzZ6IE0xMzkuNjM2LDE2Mi45MDljLTUxLjMzLDAtOTMuMDkxLDQxLjc2MS05My4wOTEsOTMuMDkxICBzNDEuNzYxLDkzLjA5MSw5My4wOTEsOTMuMDkxUzIzMi43MjcsMzA3LjMzLDIzMi43MjcsMjU2UzE5MC45NjcsMTYyLjkwOSwxMzkuNjM2LDE2Mi45MDl6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='
            },
            */
            toolIcon: {
                list: {
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAs0lEQVQ4T83TMWoCURQF0DOWCgquwSauQEHrZBvBLkWyFbFSwT0IFgp2CRgtzQZC+hRZQhgQ+ajNMG/AX79/uI/LywS/LNhTKdjEAw5lUqcJd+jjFRusCsBjTPP5FHzHEC/YYlkAnGB+CdbRwVcB6Gq08lK62Ecl/EQPb1hHlPKBQWQpjVMpx6iVyzjnv2nLNbTxW0ZOwQWe8YTviFJmGOERPxGXkqdt4S9q5TLOzVLuE/wHIYoeFULOg3MAAAAASUVORK5CYII=',
                    desc: '圖層清單'
                },
                search: {
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABL0lEQVQ4T63UzyuEQRgA4GfxV8iFAyIXxVkOUqI4OChELm6khAil3OVK4U/gKEeKk/IjcRflxFmamq3d7fv227U715l55n3feWdy6jxyKV4LxtCFRvzgASdZ5yeBMxjCJZ7whh60YRFLuE6DS8FJdGO7TCRHOMB90ppCcBDDWM1KC+dYwEfp2kLwFCHdSkY75rGWBnZiowowOHfoSwPHEdD9SsKLa86wh5fCPfmU6w52YBPTVUR4i/5ylxKadrZCMFzKHNbLgQMYxUoF6EW85c9yYJibQG9MP8kNz/AY77ErfrPAMD+FEVzhGa/x6bXGZr7BcnzXoReL0LTPoTmmHz6HJnzjEaFVGmKUod6h7kVoGphVxlT0v2A4MBGtBSxFd7BbK5hHt3CIr3qARfX+A6FHOhXx8HvKAAAAAElFTkSuQmCC',
                    desc: '圖層搜尋'
                },
                clear: {
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABqUlEQVQ4T53Uu+vPURzH8cfPfRMpE2WwMEgui5ESYmFxmaRcMlhsklgsNnL5ZXHJwsyAMsklyh+AkoWiTOTaS+fw+R2f7yWnPvX5nM95P9/v83pfJvxds/Gl8/1frxPFaiEe4Awme0gL8AMfRnmpwER3C5uxv4GuxU18x3Y8GwatwJzpgy4vgFkF8hmHcXkQtAtsoQdwCcdwqgEEGHAcTFktMD+X4TlmYhg0V48Er7vEFrgNVzC3HPo5Apok7cHtCu0C1+Ahpje3GAX9itV4Ebs2wk24jnk90IO42Gj6Hjtxry/CureklNDKEdCt2IE3wzRcjHflwDnsHQKNNEncCjzqi3AV7uJlJ3v7cLbUaLWJpvX6cXge6/C01XAaThSNPmI37iCO0kXfsAvHS0cdwgWsx33E0T9JyV7a71opnZPIM7+03iecxtECqNA/yvQVdn52E5MaS7TR7AY24HEZFBsxBToIGOgc1MS8wgwsKpodKSFFii1d6DBgvUZNTMZXJtHVTuYzNDKJEvVSvB0HGPskJh3xuxuaFWhK58mgpPTYjL81boRjE38B5LBgFUVPPZYAAAAASUVORK5CYII=',
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
                    var iconimg = $('<img/>', {
                        'class': 'gfTreeToolbar-Icon',
                        'src': o.opt.toolIcon[icontype].src,
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

                        var icon = $('<img/>', {
                            "class": "gfTreeContent-Icon",
                            "src": o.opt.iconType[ele[o.opt.iconField]]["close"]
                        });
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
                            $(this).children('.gfTreeContent-Icon').attr('src', o.opt.iconType[tp]["open"])

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
                                        var icon = $('<img/>', {
                                            "class": "gfTreeContent-Icon",
                                            "src": o.opt.iconType[ele[o.opt.iconField]][st]
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
                            $(this).children('.gfTreeContent-Icon').attr('src', o.opt.iconType[tp]["close"])

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

                                    var icon = $('<img/>', {
                                        "class": "gfTreeContent-Icon",
                                        "src": o.opt.iconType[ele[o.opt.iconField]][st]
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
                $.contextMenu({
                    selector: o._getSelector(o.target) + " .gfTreeItemList .gfTreeItem",
                    build: function($trigger, e) {
                        var target = $trigger.data();
                        return {
                            callback: function(key, options) {
                                //console.log(key);
                                //console.log(target);
                                o._contextMenuAction(key, target);
                            },
                            items: {
                                "favorite"  : {name: "加入最愛", icon: "fa-heart", disabled: (target.type == "folder")},
                                "layertheme"  : {name: "加入主題圖", icon: "fa-star", disabled: (target.type == "folder")},
                                "flyto"  : {name: "定位圖層", icon: "fa-dot-circle-o", disabled: (target.type == "folder")},
                                "sep1"  : "---------",
                                "quit"  : {name: "離開", icon: "fa-sign-out"}
                            }
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
                    case "layertheme":
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