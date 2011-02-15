function GB() {
    this.XML = 'http://www.google.com/bookmarks/';
}

GB.prototype.load_bookmarks = function(data, dataType)
{
    $("#content").html('');
    window.auth_error = false;
    var bms = [];
    var uncats = [];

    var bookmarks = $('bookmark', data).sort(function(a, b){
        a = $('title', a).text().toLowerCase();
        b = $('title', b).text().toLowerCase();
        if(a > b)  return 1;
        if(a < b)  return -1;
        return 0;
    });

    bookmarks.each(function(){
        var title = $('title', this).text();
        var url   = $('url', this).text();

        var favicon = 'img/favicon.png';
        var attr = $(this).find('attribute');
        if (attr.length) {
            attr.each(
                function(){
                    var name = $(this).find('name').text();
                    if (name == 'favicon_url') {
                        favicon = $(this).find('value').text();
                    }
                }
            );
        }

        var link = $('<a />', {
            'class': 'bookmark',
            'href': url,
            'title': title
        })
        var img = $('<img />', {'class':'favicon', 'src':favicon, 'alt':''})
        link.append(img);
        link.append(document.createTextNode(title));

        var labels = $(this).find('label');
        if (labels.length) {
            labels.each(
                function(){
                    var label = $(this).text();
                    if (!bms[label]) {
                        bms[label] = [];
                    }
                    bms[label].push(link);
                }
            );
        } else {
            uncats.push(link);
        }
    });

    var keys = new Array();
    for (var i in bms) {
        keys.push(i);
    }

    keys = keys.sort(function(a,b){
        a = a.toString().toLowerCase();
        b = b.toString().toLowerCase();
        if(a > b)  return 1;
        if(a < b)  return -1;
        return 0;
    });

    var ul = $('<ul></ul>');
    for (var n=0; n<keys.length; n++) {
        var label = keys[n];
        var li = $('<li />');
        var strong = $('<a />', {"class":"label"});
        strong.text(label);
        li.append(strong);
        var child = $('<ul></ul>');
        for (var i=0; i<bms[label].length; i++) {
            var link = $('<li></li>');
            link.append(bms[label][i]);
            child.append(link);
        }
        li.append(child);
        ul.append(li);
    }
    $('#content').append(ul);

    if (uncats.length) {
        var uncatsUL = $('<ul></ul>', {'id':'uncats'});
        for (var i=0; i<uncats.length; i++) {
            var li = $('<li />');
            li.append(uncats[i]);
            uncatsUL.append(li);
        }

        $('#content').append(uncatsUL);
    }
}

GB.prototype.load = function()
{
    $.ajax({
        type: 'GET',
        url: this.XML,
        dataType: 'xml',
        async: false,
        cache: false,
        timeout: 10,
        data: {output:"xml", num:"1000"},
        beforeSend: function(xhr){
            return true;
        },
        complete: function(xhr){
            return true;
        },
        success: this.load_bookmarks,
        error: function(){
            window.auth_error = true;
        }
    })
}

$(document).ready(function() {
    window.gb = new GB();
    window.gb.load();

    chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab){
        //window.gb.get_current(tab);
        window.current = {};
        window.current.url = tab.url;
        window.current.title = tab.title;
        if ($("[href='"+tab.url+"']", "#content").length) {
            window.current.bookmarked = true;
            chrome.browserAction.setIcon({path:'img/active.png', 'tabId':tabid});
        } else {
            window.current.bookmarked = false;
            chrome.browserAction.setIcon({path:'img/default.png', 'tabId':tabid});
        }
    });
});

