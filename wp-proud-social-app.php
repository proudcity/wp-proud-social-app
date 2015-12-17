<?php
/*
Plugin Name:        Proud Social App
Plugin URI:         http://getproudcity.com
Description:        ProudCity distribution
Version:            1.0.0
Author:             ProudCity
Author URI:         http://getproudcity.com

License:            MIT License
License URI:        http://opensource.org/licenses/MIT
*/

namespace Proud\SocialApp;

// Load Extendible
// -----------------------
if ( ! class_exists( 'ProudPlugin' ) ) {
  require_once( plugin_dir_path(__FILE__) . '../wp-proud-core/proud-plugin.class.php' );
}

class SocialApp extends \ProudPlugin {

  function __construct() {

    parent::__construct( array(
      'textdomain'     => 'wp-proud-social-app',
      'plugin_path'    => __FILE__,
    ) );

    $this->hook('plugins_loaded', 'proud_social_init_widget');
  }

  // Init on plugins loaded
  public function proud_social_init_widget() {
    require_once plugin_dir_path(__FILE__) . '/lib/social-feed-widget.class.php';
  }
}

new SocialApp;