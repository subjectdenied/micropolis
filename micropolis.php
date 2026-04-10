<?php
/**
 * Plugin Name: Micropolis
 * Description: Lightweight language switcher — dropdown with flags, auto-detects browser language, links to configured pages per language.
 * Version:     1.2.0
 * Author:      Christian Sigl
 * License:     GPL-2.0+
 * Text Domain: micropolis
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MICROPOLIS_VERSION', '1.2.0' );
define( 'MICROPOLIS_PATH', plugin_dir_path( __FILE__ ) );
define( 'MICROPOLIS_URL', plugin_dir_url( __FILE__ ) );

require_once MICROPOLIS_PATH . 'includes/class-settings.php';
require_once MICROPOLIS_PATH . 'includes/class-switcher.php';

// Admin settings
if ( is_admin() ) {
	new Micropolis_Settings();
}

// Frontend switcher
new Micropolis_Switcher();

/**
 * Activation: set default options.
 */
function micropolis_activate() {
	if ( ! get_option( 'micropolis_languages' ) ) {
		$front = get_option( 'page_on_front' );
		$front_slug = $front ? get_post_field( 'post_name', $front ) : '';

		$defaults = array(
			array(
				'code' => 'de',
				'slug' => $front_slug ?: '/',
			),
			array(
				'code' => 'en',
				'slug' => '',
			),
		);
		update_option( 'micropolis_languages', $defaults );
	}
}
register_activation_hook( __FILE__, 'micropolis_activate' );

/**
 * Add "Settings" link to the plugin list page.
 */
function micropolis_action_links( $links ) {
	$settings_link = '<a href="' . admin_url( 'options-general.php?page=micropolis' ) . '">Settings</a>';
	array_unshift( $links, $settings_link );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'micropolis_action_links' );
