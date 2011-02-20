function createForm(args) {
    $(document).ready(function() {
        var ui = new UI(args);
        ui.create();
        $('#close').click(function(){window.close();});
        $('#reset').bind('click', ui, ui.reset);
        $('#save').bind('click', ui, ui.save);

        $("#donate a").attr("href", chrome.i18n.getMessage("donate_url"));
        $("#donate .msg a").html(chrome.i18n.getMessage("donate_msg"));
    });
}

function UI(args)
{
    this.args = args;
}

UI.prototype.showMessage = function(txt)
{
    $('#message').text(txt);
    $('#message').css('display', 'block');
    $('#message').animate({
        opacity: 0.8
    }, 500).delay(1000).animate({
        opacity: 0,
        display: "none"
    }, 500, null, function(){$(this).css('display', 'none');});
}

UI.prototype.reset = function(e)
{
    localStorage.clear();

    $.each(e.data.args, function(i, inputs){
        $.each(inputs, function(id, attr){
            $('#'+id).attr('checked', attr.value);
        });
    });

    e.data.showMessage('Options Reseted.');
}

UI.prototype.save = function(e)
{
    $('input[type=checkbox]').each(function(){
        var key = $(this).attr('id');
        var val = $(this).attr('checked');
        localStorage.setItem(key, val);
    });
    e.data.showMessage('Options Saved.');
}

UI.prototype.create = function()
{
    $.each(this.args, function(i, val){
        var fset = $('<fieldset />');
        var leg = $('<legend />');
        leg.text(chrome.i18n.getMessage(i));
        fset.append(leg);

        var ul = $('<ul />', {"id":"checked"});
        $.each(val, function(j, jval){
            var label = $('<label />');
            label.attr('for', j);
            label.addClass('info');
            label.text(chrome.i18n.getMessage(jval.label));
            var clabel = $('<label />', {"for":j, "class":"check"});
            var input = $('<input />');
            input.attr('type', jval.type);
            input.attr('id', j);
            if (localStorage.getItem(j) === 'true' || jval.value) {
                input.attr('checked', true);
            } else {
                input.attr('checked', false);
            }
            var li = $('<li />')
            var p = $('<p />')
            p.append(input);
            p.append(clabel);
            p.append(label);
            li.append(p);
            ul.append(li);
        });
        fset.append(ul);

        $('#main').append(fset);
    });
}

