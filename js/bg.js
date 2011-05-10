$(document).ready(function() {
    window.gb = new GB();
    window.gb.getSignature();
    chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab){
        window.gb.setCurrent(tab);
    });
    chrome.tabs.onSelectionChanged.addListener(function(tabid, selectInfo){
        chrome.tabs.get(tabid, function(tab){
            window.gb.setCurrent(tab);
        });
    });
});

function GB() {
    this.XML = 'https://www.google.com/bookmarks/';
}

GB.prototype.load_bookmarks = function(data, dataType)
{
    $("#content").html('');
    chrome.browserAction.setIcon({path:'img/default.png'});

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
        var id   = $('id', this).text();

        var favicon = 'img/favicon.png';
        var attr = $(this).find('attribute');
        if (attr.length) {
            attr.each(function(){
                var name = $(this).find('name').text();
                if (name == 'favicon_url') {
                    favicon = $(this).find('value').text();
                }
            });
        }

        var link = $('<a />', {
            'class': 'bookmark',
            'href': url,
            'title': url,
            'id': id
        })
        var img = $('<img />', {'class':'favicon', 'src':favicon, 'alt':''})
        link.append(img);
        link.append(document.createTextNode(title));

        var labels = $(this).find('label');
        if (labels.length) {
            labels.each(function(){
                var label = $(this).text();
                if (!bms[label]) {
                    bms[label] = [];
                }
                bms[label].push(link);
            });
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
        $('<ul></ul>').append(li);
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

    chrome.tabs.getSelected(null, function(tab){
        this.setCurrent(tab);
    });
}

GB.prototype.load = function(q)
{
    var searchURL;
    var searchArgs;
    if (q && $.trim(q)) {
        window.searchQuery = q;
        searchURL = this.XML + 'find';
        searchArgs = {output:"xml", num:"1000", q:$.trim(q)};
    } else {
        window.searchQuery = null;
        searchURL = this.XML;
        searchArgs = {output:"xml", num:"1000"};
    }

    $.ajax({
        type: 'GET',
        url: searchURL,
        dataType: 'xml',
        async: false,
        cache: false,
        timeout: 10,
        data: searchArgs,
        beforeSend: function(xhr){
            return true;
        },
        complete: function(xhr){
            return true;
        },
        success: this.load_bookmarks,
        error: function(){
            return true;
        }
    })
}


GB.prototype.getSignature = function()
{
    $.ajax({
        type: 'GET',
        url: this.XML,
        dataType: 'xml',
        async: false,
        cache: false,
        timeout: 10,
        data: {output:"rss"},
        beforeSend: function(xhr){
            return true;
        },
        complete: function(xhr){
            return true;
        },
        success: function(data){
            window.sig = $('signature', data).text();
            this.scope.load();
        },
        error: function(){
            return true;
        },
        scope: this
    })
}


GB.prototype.setCurrent = function(tab)
{
    window.current = {};
    window.current.url = tab.url;
    window.current.title = tab.title;
    if ($("[href='"+tab.url+"']", "#content").length) {
        chrome.browserAction.setIcon({path:'img/active.png', 'tabId':tab.id});
    } else {
        chrome.browserAction.setIcon({path:'img/default.png', 'tabId':tab.id});
    }
}

