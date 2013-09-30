<?php
/***
functions to load styles and scripts
***/

function scripts_and_styles() {


    //styles
    wp_enqueue_style('reset', get_template_directory_uri() . '/inc/css/reset.css');
    wp_enqueue_style('animate', get_template_directory_uri() . '/inc/css/animate.min.css');


    //scripts
    wp_register_script('picture-fill', get_template_directory_uri() . '/inc/js/picturefill.js', array('jquery'));\
    wp_register_script('matchmedia', get_template_directory_uri() . '/inc/js/matchmedia.js', array('jquery', 'picture-fill'));
    wp_register_script('sticky', get_template_directory_uri() . '/inc/js/jquery.sticky.js', array('jquery', 'picture-fill', 'matchmedia'));


    //footer scripts
    wp_register_script('foundation', get_template_directory_uri() . '/inc/js/foundation.min.js', '', true);
    wp_register_script('interchange', get_template_directory_uri() . '/inc/js/foundation.interchange.js', '', true);
    wp_register_script('fitvids', get_template_directory_uri() . '/inc/js/jquery.fitvids.js', '', true);
    wp_register_script('fitvids', get_template_directory_uri() . '/inc/js/functions.js', '', true);
    wp_register_script('nav', get_template_directory_uri() . '/inc/js/nav.js', '', true);
    wp_register_script('placeholder', get_template_directory_uri() . '/inc/js/placeholder.min.js', '', true);
    wp_register_script('animate-colors', get_template_directory_uri() . '/inc/js/jquery.animate-colors-min.js', '', true);
    wp_register_script('slider', get_template_directory_uri() . '/inc/js/slider.js', '', true);
    wp_register_script('sticky', get_template_directory_uri() . '/inc/js/sticky.js', '', true);
        
    });  


    //output both
    wp_enqueue_script('custom');
    wp_enqueue_script('comments');
    wp_enqueue_script('bootstrap-js');

}

add_action( 'wp_enqueue_scripts', 'scripts_and_styles' );

?>