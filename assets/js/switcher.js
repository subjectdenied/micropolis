/**
 * Micropolis Language Switcher — Frontend
 *
 * - Always shows the default (first) language in the toggle
 * - Acts as jump-links to configured pages — no language persistence
 * - Desktop: inline dropdown in Divi header
 * - Mobile (≤980px): language items inside the hamburger menu
 */
(function () {
	'use strict';

	var data = window.micropolisData || {};
	var languages = data.languages || [];

	if (languages.length < 2) return;

	function findLang(code) {
		for (var i = 0; i < languages.length; i++) {
			if (languages[i].code === code) return languages[i];
		}
		return null;
	}

	function detectCurrentLang() {
		var path = window.location.pathname.replace(/\/+$/, '').replace(/^\/+/, '');
		for (var i = 0; i < languages.length; i++) {
			var langUrl = languages[i].url.replace(/\/+$/, '').replace(/^https?:\/\/[^/]+\/?/, '');
			if (path === langUrl || (langUrl === '' && path === '')) {
				return languages[i].code;
			}
		}
		return null;
	}

	// Language names for mobile menu display
	var langNames = {
		de: 'Deutsch', en: 'English', fr: 'Français', es: 'Español',
		it: 'Italiano', pt: 'Português', nl: 'Nederlands', pl: 'Polski',
		cs: 'Čeština', sk: 'Slovenčina', hu: 'Magyar', ro: 'Română',
		hr: 'Hrvatski', sr: 'Srpski', sl: 'Slovenščina', bg: 'Български',
		tr: 'Türkçe', ru: 'Русский', uk: 'Українська', ar: 'العربية',
		zh: '中文', ja: '日本語', ko: '한국어',
	};

	// Show detected language if current page matches a configured language, otherwise default
	var currentCode = detectCurrentLang();
	var activeLang = (currentCode && findLang(currentCode)) ? findLang(currentCode) : languages[0];

	document.addEventListener('DOMContentLoaded', function () {
		var switcher = document.getElementById('micropolis-switcher');
		if (!switcher) return;

		var isMobile = window.matchMedia('(max-width: 980px)');

		// ── Desktop: inject switcher into Divi header menu wrap ──
		function setupDesktop() {
			var menuWrap = document.querySelector('.et_pb_menu__wrap');
			if (menuWrap) {
				var firstIcon = menuWrap.querySelector('.et_pb_menu__icon');
				if (firstIcon) {
					menuWrap.insertBefore(switcher, firstIcon);
				} else {
					menuWrap.appendChild(switcher);
				}
				switcher.classList.add('micropolis-inline');
			}
		}

		// ── Mobile: add language items into the hamburger menu ──
		function injectMobileMenuItems() {
			var mobileMenu = document.querySelector('.et_mobile_menu');
			if (!mobileMenu || mobileMenu.querySelector('.micropolis-mobile-lang')) return;

			// Add a separator
			var sep = document.createElement('li');
			sep.className = 'micropolis-mobile-lang micropolis-mobile-sep';
			sep.setAttribute('aria-hidden', 'true');
			mobileMenu.appendChild(sep);

			// Add each language as a menu item
			for (var i = 0; i < languages.length; i++) {
				var lang = languages[i];
				var li = document.createElement('li');
				li.className = 'micropolis-mobile-lang menu-item';
				var a = document.createElement('a');
				a.href = lang.url;
				a.textContent = lang.flag + '  ' + (langNames[lang.code] || lang.code.toUpperCase());
				li.appendChild(a);
				mobileMenu.appendChild(li);
			}
		}

		// Watch for Divi's mobile menu to appear (it's created dynamically on first hamburger click)
		function watchMobileMenu() {
			var menuWrap = document.querySelector('.et_pb_menu__wrap') || document.body;
			var observer = new MutationObserver(function () {
				injectMobileMenuItems();
			});
			observer.observe(menuWrap, { childList: true, subtree: true });
			// Also try immediately in case the menu already exists
			injectMobileMenuItems();
		}

		// Apply the right mode based on viewport
		function applyMode() {
			if (isMobile.matches) {
				switcher.style.display = 'none';
				watchMobileMenu();
			} else {
				switcher.style.display = '';
				setupDesktop();
			}
		}

		applyMode();
		isMobile.addEventListener('change', applyMode);

		// ── Desktop: search icon visibility toggle ──
		var searchTimer;
		var observer = new MutationObserver(function () {
			var searchOpen = document.querySelector('.et_pb_menu__search-container--visible');
			clearTimeout(searchTimer);
			if (searchOpen) {
				switcher.style.visibility = 'hidden';
			} else {
				searchTimer = setTimeout(function () {
					switcher.style.visibility = '';
				}, 400);
			}
		});
		observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

		// ── Desktop: dropdown behavior ──
		var toggle = document.getElementById('micropolis-toggle');
		var dropdown = document.getElementById('micropolis-dropdown');
		if (!toggle || !dropdown) return;

		// Show active language (detected from URL, or default)
		var flagEl = toggle.querySelector('.micropolis-current-flag');
		var codeEl = toggle.querySelector('.micropolis-current-code');
		if (flagEl) flagEl.textContent = activeLang.flag;
		if (codeEl) codeEl.textContent = activeLang.code.toUpperCase();

		toggle.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var open = dropdown.hidden;
			dropdown.hidden = !open;
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			switcher.setAttribute('data-open', open ? 'true' : 'false');
		});

		document.addEventListener('click', function (e) {
			if (!switcher.contains(e.target)) {
				dropdown.hidden = true;
				toggle.setAttribute('aria-expanded', 'false');
				switcher.setAttribute('data-open', 'false');
			}
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') {
				dropdown.hidden = true;
				toggle.setAttribute('aria-expanded', 'false');
				switcher.setAttribute('data-open', 'false');
			}
		});
	});
})();
