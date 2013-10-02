jQuery( document ).ready(function($) {
    $('button#headerToggleNav').click(function(){
    	$('.main-container').animate({ margin: "0 0 0 -306px" }, "slow");
    	$('.main-nav').addClass('open');
    });

    $('button#navCloseBtn').click(function(){   
    	$('.main-container').animate({ margin: "0" }, "slow");
    	$('.main-nav').removeClass('open');
    });
});