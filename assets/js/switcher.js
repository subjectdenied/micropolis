/**
 * Micropolis Language Switcher — Frontend
 *
 * - Auto-detects browser language and shows matching flag/code
 * - Stores user's manual choice in localStorage
 * - Redirects on first visit if browser language matches a configured language
 */
(function () {
	'use strict';

	var STORAGE_KEY = 'micropolis_lang';
	var data = window.micropolisData || {};
	var languages = data.languages || [];

	if (languages.length < 2) return;

	function getStoredLang() {
		try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
	}

	function setStoredLang(code) {
		try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* noop */ }
	}

	function getBrowserLang() {
		var nav = navigator.language || navigator.userLanguage || '';
		return nav.split('-')[0].toLowerCase();
	}

	function findLang(code) {
		for (var i = 0; i < languages.length; i++) {
			if (languages[i].code === code) return languages[i];
		}
		return null;
	}

	function detectCurrentLang() {
		// Check if current URL matches any configured language page
		var path = window.location.pathname.replace(/\/+$/, '').replace(/^\/+/, '');
		for (var i = 0; i < languages.length; i++) {
			var langUrl = languages[i].url.replace(/\/+$/, '').replace(/^https?:\/\/[^/]+\/?/, '');
			if (path === langUrl || (langUrl === '' && path === '')) {
				return languages[i].code;
			}
		}
		return null;
	}

	// Determine active language
	var stored = getStoredLang();
	var current = detectCurrentLang();
	var browserLang = getBrowserLang();
	var activeLang = current || stored || languages[0].code;

	// Auto-redirect on first visit (no stored preference, not already on a language page)
	if (!stored && !current && findLang(browserLang)) {
		var target = findLang(browserLang);
		if (target && target.code !== languages[0].code) {
			setStoredLang(target.code);
			window.location.href = target.url;
			return;
		}
	}

	// Move switcher into the Divi header (next to search icon)
	document.addEventListener('DOMContentLoaded', function () {
		var switcher = document.getElementById('micropolis-switcher');
		if (switcher) {
			// Try to inject into Divi menu inner container (after search)
			var menuWrap = document.querySelector('.et_pb_menu_inner_container')
				|| document.querySelector('.et_pb_row_0_tb_header');
			if (menuWrap) {
				menuWrap.appendChild(switcher);
				switcher.classList.add('micropolis-inline');
			}

			// Hide switcher when Divi search is open, delay reappear until animation ends
			var searchTimer;
			var observer = new MutationObserver(function () {
				var searchOpen = document.querySelector('.et_pb_menu__search-container--visible');
				clearTimeout(searchTimer);
				if (searchOpen) {
					switcher.style.visibility = 'hidden';
				} else {
					// Wait for the slide-out animation to finish before showing
					searchTimer = setTimeout(function () {
						switcher.style.visibility = '';
					}, 400);
				}
			});
			observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
		}
	});

	// Update the toggle to show the active language
	document.addEventListener('DOMContentLoaded', function () {
		var switcher = document.getElementById('micropolis-switcher');
		var toggle = document.getElementById('micropolis-toggle');
		var dropdown = document.getElementById('micropolis-dropdown');
		if (!switcher || !toggle || !dropdown) return;

		var active = findLang(activeLang) || languages[0];

		// Set toggle display
		var flagEl = toggle.querySelector('.micropolis-current-flag');
		var codeEl = toggle.querySelector('.micropolis-current-code');
		if (flagEl) flagEl.textContent = active.flag;
		if (codeEl) codeEl.textContent = active.code.toUpperCase();

		// Highlight active in dropdown
		var links = dropdown.querySelectorAll('a[data-lang]');
		for (var i = 0; i < links.length; i++) {
			if (links[i].getAttribute('data-lang') === activeLang) {
				links[i].classList.add('micropolis-active');
			}
		}

		// Toggle dropdown
		toggle.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var open = dropdown.hidden;
			dropdown.hidden = !open;
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			switcher.setAttribute('data-open', open ? 'true' : 'false');
		});

		// Close on outside click
		document.addEventListener('click', function (e) {
			if (!switcher.contains(e.target)) {
				dropdown.hidden = true;
				toggle.setAttribute('aria-expanded', 'false');
				switcher.setAttribute('data-open', 'false');
			}
		});

		// Store choice on click
		var allLinks = dropdown.querySelectorAll('a[data-lang]');
		for (var j = 0; j < allLinks.length; j++) {
			allLinks[j].addEventListener('click', function () {
				setStoredLang(this.getAttribute('data-lang'));
			});
		}

		// Close on Escape
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') {
				dropdown.hidden = true;
				toggle.setAttribute('aria-expanded', 'false');
				switcher.setAttribute('data-open', 'false');
			}
		});
	});
})();
