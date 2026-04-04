<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Micropolis_Switcher {

	public function __construct() {
		if ( ! is_admin() ) {
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
			add_action( 'wp_footer', array( $this, 'render_switcher' ) );
		}
	}

	public function enqueue_assets() {
		wp_enqueue_style( 'micropolis-switcher', MICROPOLIS_URL . 'assets/css/switcher.css', array(), MICROPOLIS_VERSION );
		wp_enqueue_script( 'micropolis-switcher', MICROPOLIS_URL . 'assets/js/switcher.js', array(), MICROPOLIS_VERSION, true );

		$languages = get_option( 'micropolis_languages', array() );
		$items = array();

		foreach ( $languages as $lang ) {
			$slug = $lang['slug'];
			if ( $slug === '' ) continue;

			// Build URL from slug
			if ( $slug === '/' || $slug === '' ) {
				$url = home_url( '/' );
			} else {
				$page = get_page_by_path( $slug );
				$url = $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
			}

			$items[] = array(
				'code' => $lang['code'],
				'flag' => Micropolis_Settings::code_to_flag( $lang['code'] ),
				'url'  => $url,
			);
		}

		wp_localize_script( 'micropolis-switcher', 'micropolisData', array(
			'languages' => $items,
		) );
	}

	public function render_switcher() {
		$languages = get_option( 'micropolis_languages', array() );
		if ( count( $languages ) < 2 ) return;

		$items = array();
		foreach ( $languages as $lang ) {
			if ( $lang['slug'] === '' ) continue;
			$slug = $lang['slug'];
			if ( $slug === '/' ) {
				$url = home_url( '/' );
			} else {
				$page = get_page_by_path( $slug );
				$url = $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
			}
			$items[] = array(
				'code' => $lang['code'],
				'flag' => Micropolis_Settings::code_to_flag( $lang['code'] ),
				'url'  => $url,
			);
		}

		if ( empty( $items ) ) return;

		$default = $items[0];
		?>
		<div class="micropolis-switcher" id="micropolis-switcher" aria-label="Language switcher">
			<button class="micropolis-toggle" id="micropolis-toggle" aria-expanded="false" aria-haspopup="listbox">
				<span class="micropolis-current-flag"><?php echo esc_html( $default['flag'] ); ?></span>
				<span class="micropolis-current-code"><?php echo esc_html( strtoupper( $default['code'] ) ); ?></span>
				<span class="micropolis-arrow">&#9662;</span>
			</button>
			<ul class="micropolis-dropdown" id="micropolis-dropdown" role="listbox" hidden>
				<?php foreach ( $items as $item ) : ?>
					<li role="option">
						<a href="<?php echo esc_url( $item['url'] ); ?>" data-lang="<?php echo esc_attr( $item['code'] ); ?>">
							<span class="micropolis-flag"><?php echo esc_html( $item['flag'] ); ?></span>
							<span class="micropolis-code"><?php echo esc_html( strtoupper( $item['code'] ) ); ?></span>
						</a>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php
	}
}
