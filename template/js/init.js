$(function() {

    $('.b-block--first').readmore();

    $('.b-block--second').readmore({
        ellipsis: '[...]',
        textOpen: 'Открыть',
        textClose: 'Закрыть',
        callback: function(self, state) {
            state
                ? self.css('background', '#e74c3c')
                : self.css('background', '#3498db');
        },
        brief: 500,
        addition: 100
    });

    $('.b-block--third').readmore({
        brief: 1000,
        addition: 200,
        smoothly: 500
    });

});