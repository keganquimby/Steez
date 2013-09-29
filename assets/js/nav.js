(function($){

$(document).ready(function (){
	
	
	
	/**NAVBAR**/
	
	 var lastScrollTop = 0;
$(window).scroll(function(event){
   var st = $(this).scrollTop();
   if (st > lastScrollTop){
   		//removing .navfixed when user scroll down
         $('.navbar-wrapper').removeClass('navfixed', 1000);

   } else {
     //adding .navfixed when user scroll down
       $('.navbar-wrapper').addClass('navfixed', 1000);

   }
   lastScrollTop = st;
});
	
/**NAVBAR-END**/
  


});

	
$(function(){
	
 
	
	

	

	



});

})(window.jQuery);

