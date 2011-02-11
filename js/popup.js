$(document).ready(function() {
    var bg = chrome.extension.getBackgroundPage();
    if (bg.auth_error) {
        bg.gb.load();
        if (!bg.auth_error) {
            showContent(bg);
            return;
        }

        gform();
        return;
    } else {
        showContent(bg);
    }
});

function showContent(bg) {
    $('#bm').html(bg.$('#content').html());
    $('#bm').find('a').each(
        function(){
            var href = $(this).attr('href');
            $(this).click(function(){
                chrome.tabs.getSelected(null, function(tab){
                    chrome.tabs.update(tab.id, {url: href});
                });
            });
        }
    );
    showTop(bg);
    showFoot(bg);
}

function showTop(bg) {
    var topMenu = $('<ul />');
    var list = $('<li />');
    topMenu.append(list);
    var link = $('<a />', {id:'add', href:'#'});
    if (bg.current.bookmarked) {
        link.text(chrome.i18n.getMessage("edit_bookmark"));
    } else {
        link.text(chrome.i18n.getMessage("add_bookmark_here"));
    }
    list.append(link);
    link.click(
        function(){
            gform();
        }
    );
    $('#top').html(topMenu);
}

function showFoot(bg) {
    var footMenu = $('<ul />');

    var list1 = $('<li />');
    footMenu.append(list1);
    var link1 = $('<a />', {id:'manage', href:'#'});
    link1.text(chrome.i18n.getMessage("manage_bookmarks"));
    list1.append(link1);
    link1.click(
        function(){
            chrome.tabs.getSelected(null, function(tab){
                var href = 'https://www.google.com/bookmarks/lookup';
                chrome.tabs.update(tab.id, {url: href});
            });
        }
    );

    var list2 = $('<li />');
    footMenu.append(list2);
    var link2 = $('<a />', {id:'reload', href:'#'});
    link2.text(chrome.i18n.getMessage("reload"));
    list2.append(link2);
    link2.click(
        function(){
            bg.gb.load();
            showContent(bg);
        }
    );

    $('#foot').html(footMenu);
}

function gform(){
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
