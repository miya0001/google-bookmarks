$(document).ready(function() {
    var gbp = new GBP();
    gbp.init();
});

function GBP(){
}

GBP.prototype.init = function()
{
    var bg = chrome.extension.getBackgroundPage();
    if (!bg.$('a.bookmark').length) {
        bg.gb.getSignature();
        if (bg.$('a.bookmark').length) {
            this.showContent();
            return;
        }
        this.gform();
        return;
    } else {
        this.showContent();
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
                success: function(data){
                    e.data.bg.gb.load();
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

GBP.prototype.showContent = function()
{
    var bg = chrome.extension.getBackgroundPage();
    $('#bm').html(bg.$('#content').html());
    $('#bm').find('a.bookmark').each(function(){
        var href = $(this).attr('href');
        $(this).click(function(){
            chrome.tabs.getSelected(null, function(tab){
                if (localStorage.getItem('open') === 'true') {
                    chrome.tabs.create({url: href});
                    window.close();
                } else {
                    chrome.tabs.update(tab.id, {url: href});
                    window.close();
                }
            });
        });
    });

    var self = this;
    $('#bm').find('a.label').each(function(){
        $(this).click(function(e){
            if (localStorage.getItem('confirm') === 'true') {
                self.showDialog(e.target);
                return;
            }
            self.openBookmarks(e.target);
        });
    });

    this.showTop();
    this.showFoot();
}

GBP.prototype.openBookmarks = function(target)
{
    var parentNode = $(target).parent().get(0);
    $("a.bookmark", parentNode).each(function(){
        var href = $(this).attr('href');
        chrome.tabs.create({url: href});
        window.close();
    });
}

GBP.prototype.showDialog = function(label)
{
    var self = this;

    $("#search input[type=button]").attr('disabled', true);
    $("#q").attr('disabled', true);

    var style = {};
    style.top = $('#dialog').css('top');
    style.opacity = $('#dialog').css('opacity');
    $("#dialog-overlay").fadeIn("fast", function(){
        var msg = chrome.i18n.getMessage("open_all_bookmarks_in");
        msg = msg.sprintf($(label).text())
        $("#dialog").css('display', 'block');
        $("#dialog .msg:first").text(msg);
        var dialogTop = ($(window).height() - $('#dialog').height()) / 2;
        $('#dialog').animate({
            "opacity": 1,
            "top": dialogTop
        }, 300, function(){
            $('#noBtn').bind('click', style, self.closeDialog);
            $('#yesBtn').bind('click', label, function(e){
                self.openBookmarks(e.data);
            });
            $('#noBtn').focus();
        });
    });
}

GBP.prototype.closeDialog = function(e)
{
    var style = e.data;
    $('#dialog').css({
        'opacity': style.opacity,
        'top': style.top,
        'display': 'none'
    });
    $("#dialog-overlay").fadeOut("fast");
    $("#search input[type=button]").attr('disabled', false);
    $("#q").attr('disabled', false);
}

GBP.prototype.showTop = function()
{
    var bg = chrome.extension.getBackgroundPage();
    var topMenu = $('<div />');

    chrome.tabs.getSelected(null, $.scope(this, function(tab){
        var bookmarked = false;
        if ($("a.bookmark[href='"+tab.url+"']").length) {
            bookmarked = true;
        }

        if (bookmarked) {
            var edit = this.createLink('edit_bookmark');
            topMenu.append(edit);
            edit.click(this.gform);

            var del = this.createLink('delete_bookmark');
            topMenu.append(del);
            del.bind('click', {bg:bg, scope:this}, this.deleteBookmark);
        } else {
            var add = this.createLink('add_bookmark');
            topMenu.append(add);
            add.click(this.gform);
        }

        var search = $('<div />', {id:'search'});
        var q = $('<input />', {
            'type': 'text',
            'name': 'q',
            'id': 'q'
        });
        if (bg.searchQuery) {
            q.val(bg.searchQuery);
        }
        var button = $('<input />', {
            'type': 'button',
            'value': 'Search'
        });
        search.append(q);
        search.append(button);

        button.bind('click', this, this.search);
        q.bind('keydown', this, this.search);

        topMenu.append(search);

        $('#top').html(topMenu);
    }));
}

GBP.prototype.showFoot = function()
{
    var bg = chrome.extension.getBackgroundPage();
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
        bg.gb.load();
        chrome.tabs.getSelected(null, function(tab){
            bg.gb.setCurrent(tab);
        });
        window.close();
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

GBP.prototype.search = function(e)
{
    if (e.keyCode === 0 || e.keyCode === 13) {
        var bg = chrome.extension.getBackgroundPage();
        bg.gb.load($('#q').val());
        e.data.showContent();
    }
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

