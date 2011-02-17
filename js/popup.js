$(document).ready(function() {
    var gbp = new GBP();
    gbp.init();
});

function GBP(){
}

GBP.prototype.init = function()
{
    var bg = chrome.extension.getBackgroundPage();
    if (bg.auth_error) {
        bg.gb.getSignature();
        if (!bg.auth_error) {
            this.showContent(bg);
            return;
        }
        this.gform();
        return;
    } else {
        this.showContent(bg);
    }
}

GBP.prototype.deleteBookmark = function(e)
{
    chrome.tabs.getSelected(null, $.scope(this, function(tab){
        var nodes = $("a.bookmark[href='"+tab.url+"']");
        if (nodes.length) {
            var url = "https://www.google.com/bookmarks/mark";
            var args = {
                zx: (new Date()).getTime(),
                dlq: nodes.get(0).id,
                sig: e.data.bg.sig
            }

            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                timeout: 10,
                data: args,
                beforeSend: function(xhr){
                    return true;
                },
                complete: function(xhr){
                    return true;
                },
                success: function(data){
                    e.data.bg.gb.getSignature();
                    chrome.tabs.getSelected(null, function(tab){
                        e.data.bg.gb.setCurrent(tab);
                    });
                    window.close();
                    return true;
                },
                error: function(){
                    console.log('error');
                    return true;
                }
            })
        }
    }));
}

GBP.prototype.showContent = function(bg)
{
    $('#bm').html(bg.$('#content').html());
    $('#bm').find('a.bookmark').each(function(){
        var href = $(this).attr('href');
        $(this).click(function(){
            chrome.tabs.getSelected(null, function(tab){
                chrome.tabs.update(tab.id, {url: href});
                window.close();
            });
        });
/*
        $(this).hover(
            function(){
                chrome.windows.getCurrent(function(win){
                    var views = chrome.extension.getViews({windowId:win.id});
                    for (var i in views[0]) {
                        console.log(i+':'+views[0][i]);
                    }
                });
            }
        );
*/
    });

    $('#bm').find('a.label').each(function(){
        $(this).click(function(e){
            var parentNode = $(e.target).parent().get(0);
            $("a.bookmark", parentNode).each(function(){
                var href = $(this).attr('href');
                chrome.tabs.create({url: href});
                window.close();
            });
        });
    });

    this.showTop(bg);
    this.showFoot(bg);
}

GBP.prototype.showTop = function (bg)
{
    var topMenu = $('<ul />');
    var list = $('<li />');
    topMenu.append(list);

    chrome.tabs.getSelected(null, $.scope(this, function(tab){
        var bookmarked = false;
        if ($("a.bookmark[href='"+tab.url+"']").length) {
            bookmarked = true;
        }

        if (bookmarked) {
            var edit = this.createLink('edit_bookmark');
            list.append(edit);
            edit.click(this.gform);

            var del = this.createLink('delete_bookmark');
            list.append(del);
            del.bind('click', {bg:bg, scope:this}, this.deleteBookmark);
        } else {
            var add = this.createLink('add_bookmark');
            list.append(add);
            add.click(this.gform);
        }

        $('#top').html(topMenu);
    }));
}

GBP.prototype.showFoot = function(bg)
{
    var footMenu = $('<ul />');

    var list1 = $('<li />');
    footMenu.append(list1);
    var link1 = $('<a />', {id:'manage', href:'#'});
    link1.text(chrome.i18n.getMessage("manage_bookmarks"));
    list1.append(link1);
    link1.bind('click', {scope: this}, function(e){
        chrome.tabs.getSelected(null, function(tab){
            var href = 'https://www.google.com/bookmarks/lookup';
            chrome.tabs.update(tab.id, {url: href});
            window.close();
        });
    });

    var list2 = $('<li />');
    footMenu.append(list2);
    var link2 = $('<a />', {id:'reload', href:'#'});
    link2.text(chrome.i18n.getMessage("reload"));
    list2.append(link2);
    link2.bind('click', {scope: this}, function(e){
        bg.gb.getSignature();
        e.data.scope.showContent(bg);
    });

    $('#foot').html(footMenu);
}

GBP.prototype.createLink = function(text)
{
    var link = $('<a />', {href:'javascript:void(0);'});
    link.addClass(text);
    link.text(chrome.i18n.getMessage(text));
    link.attr('title', chrome.i18n.getMessage(text));
    return link;
}


GBP.prototype.gform = function()
{
    $('#top').hide();
    $('#bm').hide();
    $('#foot').hide();
    $('body').css('width', '580px');
    chrome.tabs.getSelected(null, function(tab) {
        var title = tab.title;
        var url = tab.url;
        var iframe = $('<iframe />');
        iframe.attr(
            "src",
            'http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title)
        );
        iframe.css('width', '100%');
        iframe.css('height', '450px');
        $("body").append(iframe);
    });
}

jQuery.scope = function(target, func){
    return function() {
        return func.apply(target, arguments);
    }
};

