/**
 * Micropolis Admin — slug validation and row management
 */
(function ($) {
	'use strict';

	var rowIndex = 100; // Start high to avoid collisions with existing rows

	// Flag emoji from language code
	function codeToFlag(code) {
		code = code.toLowerCase().trim();
		var map = {
			de: 'de', en: 'gb', fr: 'fr', es: 'es', it: 'it', pt: 'pt',
			nl: 'nl', pl: 'pl', cs: 'cz', sk: 'sk', hu: 'hu', ro: 'ro',
			bg: 'bg', hr: 'hr', sl: 'si', sr: 'rs', bs: 'ba', tr: 'tr',
			ar: 'sa', zh: 'cn', ja: 'jp', ko: 'kr', ru: 'ru', uk: 'ua',
			sv: 'se', da: 'dk', fi: 'fi', no: 'no', el: 'gr'
		};
		var country = map[code] || code;
		if (country.length !== 2) return '\u{1F310}';
		var a = 0x1F1E6;
		return String.fromCodePoint(a + country.charCodeAt(0) - 97, a + country.charCodeAt(1) - 97);
	}

	// Add new row
	$('#micropolis-add-row').on('click', function () {
		rowIndex++;
		var row = '<tr>' +
			'<td class="micropolis-flag-cell"><span class="micropolis-flag">\u{1F310}</span></td>' +
			'<td><input type="text" name="micropolis_lang[' + rowIndex + '][code]" value="" maxlength="5" class="micropolis-code" placeholder="de" /></td>' +
			'<td><input type="text" name="micropolis_lang[' + rowIndex + '][slug]" value="" class="micropolis-slug regular-text" placeholder="page-slug" /></td>' +
			'<td class="micropolis-status"></td>' +
			'<td><button type="button" class="button micropolis-remove" title="Remove">&times;</button></td>' +
			'</tr>';
		$('#micropolis-languages tbody').append(row);
	});

	// Remove row
	$(document).on('click', '.micropolis-remove', function () {
		$(this).closest('tr').remove();
	});

	// Update flag when code changes
	$(document).on('input', '.micropolis-code', function () {
		var code = $(this).val().trim();
		var flag = code.length >= 2 ? codeToFlag(code) : '\u{1F310}';
		$(this).closest('tr').find('.micropolis-flag').text(flag);
	});

	// Validate slug on blur — each input gets its own timer
	$(document).on('blur', '.micropolis-slug', function () {
		var $input = $(this);
		var slug = $input.val().trim();
		var $status = $input.closest('tr').find('.micropolis-status');

		if (slug === '' || slug === '/') {
			$status.html('<span class="slug-ok">✓ Homepage</span>');
			return;
		}

		$status.html('checking...');

		clearTimeout($input.data('slugTimer'));
		$input.data('slugTimer', setTimeout(function () {
			$.post(micropolisAdmin.ajaxUrl, {
				action: 'micropolis_check_slug',
				nonce: micropolisAdmin.nonce,
				slug: slug
			}).done(function (res) {
				if (res.success && res.data.exists) {
					$status.html('<span class="slug-ok">✓ ' + res.data.title + '</span>');
				} else {
					$status.html('<span class="slug-fail">✗ Page not found</span>');
				}
			}).fail(function () {
				$status.html('<span class="slug-fail">✗ Check failed</span>');
			});
		}, 300));
	});

	// Trigger initial slug validation
	$(document).ready(function () {
		$('.micropolis-slug').each(function () {
			if ($(this).val().trim() !== '') {
				$(this).trigger('blur');
			}
		});
	});

})(jQuery);
