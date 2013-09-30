jQuery( document ).ready(function($) {
    $('button#headerToggleNav').click(function(){
    	$('.main-container').animate({ margin: "0 0 0 -306px" }, "slow");
    	$('.main-nav').animate({ margin: "0" }, "slow");
    });

    $('button#navCloseBtn').click(function(){   
    	$('.main-container').animate({ margin: "0" }, "slow");
    	$('.main-nav').animate({ margin: "0 -400px 0 0" }, "slow");
    });
});