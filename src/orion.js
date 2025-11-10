/**
 * Orion App - Single consolidated class
 */
(function (window, document) {
    'use strict';

    class OrionApp {
        constructor() {
            this.isInitialized = false;
            this.eventListeners = [];
            this.components = new Map();
            this.settings = this.loadSettings();
            this.toastContainer = null;
            this.toasts = new Map();
            this.activeLoaders = new Set();
            this.modals = new Map();
            this.currentModal = null;
            this.performanceObserver = null;
            this.mediaQueryListener = null;
            this.timers = new Set();
        }

        init() {
            if (this.isInitialized) return;

            this.setupGlobalStyles();
            this.initAccessibility();

            this.initializeComponents();
            this.initializeKeyboard();
            this.bindEvents();
            this.startPerformanceMonitoring();

            this.onReady(() => {
                this.ensureToastContainer();
            });

            this.isInitialized = true;
            console.log('🚀 Orion App initialized');
        }

        onReady(cb) {
            if (document.readyState === 'loading') {
                const handler = () => {
                    cb();
                    document.removeEventListener('DOMContentLoaded', handler);
                };
                document.addEventListener('DOMContentLoaded', handler, {once: true});
            } else {
                cb();
            }
        }

        addEventListenerWithCleanup(target, event, handler, options) {
            target.addEventListener(event, handler, options);
            this.eventListeners.push({target, event, handler, options});
        }

        loadSettings() {
            try {
                const settings = localStorage.getItem('orion-settings');
                return settings ? JSON.parse(settings) : this.getDefaultSettings();
            } catch (error) {
                console.warn('Failed to load settings, using defaults:', error);
                return this.getDefaultSettings();
            }
        }

        saveSettings() {
            try {
                localStorage.setItem('orion-settings', JSON.stringify(this.settings));
            } catch (error) {
                console.error('Failed to save settings:', error);
            }
        }

        getDefaultSettings() {
            return {
                theme: 'auto',
                animations: true,
                notifications: true,
                autoSave: true,
                language: 'auto',
                preferredView: 'desktop'
            };
        }

        setupGlobalStyles() {
            const root = document.documentElement;
            root.style.setProperty('--orion-animation-speed', this.settings.animations ? '0.3s' : '0s');

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.add('reduce-motion');
                this.settings.animations = false;
            }

            this.setupResponsiveFonts();
        }

        setupResponsiveFonts() {
            let resizeTimer;
            const updateFontSize = () => {
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                const minDimension = Math.min(vw, vh);
                const scaleFactor = Math.max(0.8, Math.min(1.2, minDimension / 1000));
                const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
                if (Math.abs(scaleFactor - currentScale) > 0.05) {
                    document.documentElement.style.setProperty('--font-scale', scaleFactor);
                }
            };
            const throttled = () => {
                if (resizeTimer) {
                    this.timers.delete(resizeTimer);
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(updateFontSize, 100);
                this.timers.add(resizeTimer);
            };

            updateFontSize();
            this.addEventListenerWithCleanup(window, 'resize', throttled);
        }

        initializeComponents() {
            this.initializeNavigation();
            this.initializeForms();
            this.initializeProgress();

            this.onReady(() => {
                const navLinks = document.querySelectorAll('#mainmenu a, .luci-tabs a');
                navLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        if (link.hostname !== window.location.hostname || link.getAttribute('href').startsWith('#')) return;
                        const loadingDiv = document.createElement('div');
                        loadingDiv.className = 'fixed inset-0 z-50 flex items-center justify-center glass-ultra';
                        loadingDiv.innerHTML = `
                            <div class="text-center">
                                <div class="relative mb-4">
                                    <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                                </div>
                                <p class="text-white font-medium animate-pulse">Loading...</p>
                            </div>
                        `;
                        document.body.appendChild(loadingDiv);
                        setTimeout(() => {
                            if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
                        }, 5000);
                    });
                });

                this.addEventListenerWithCleanup(window, 'load', () => {
                    const loadingOverlay = document.getElementById('loadingOverlay');
                    if (loadingOverlay) {
                        setTimeout(() => {
                            loadingOverlay.classList.add('invisible', 'opacity-0');
                        }, 100);
                    }
                });

                this.addEventListenerWithCleanup(document, 'click', (e) => {
                    const userMenu = document.getElementById('userMenu');
                    if (userMenu && !userMenu.contains(e.target) && !e.target.closest('[data-action="toggle-user-menu"]')) {
                        userMenu.classList.add('invisible', 'opacity-0', 'scale-95');
                        userMenu.classList.remove('visible', 'opacity-100', 'scale-100');
                    }
                });
            });
        }

        initializeNavigation() {
            this.enhanceBreadcrumbs();
            this.enhanceTabs();
        }

        enhanceBreadcrumbs() {
            const links = document.querySelectorAll('.luci-breadcrumb a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    this.showLoading('#maincontent', {text: 'Navigating...'});
                });
            });
        }

        enhanceTabs() {
            const containers = document.querySelectorAll('.luci-tabs');
            containers.forEach(container => {
                const tabs = container.querySelectorAll('.luci-tab');
                tabs.forEach((tab, index) => {
                    tab.addEventListener('keydown', (e) => {
                        let newIndex = index;
                        switch (e.key) {
                        case 'ArrowLeft':
                            newIndex = index > 0 ? index - 1 : tabs.length - 1;
                            break;
                        case 'ArrowRight':
                            newIndex = index < tabs.length - 1 ? index + 1 : 0;
                            break;
                        case 'Home':
                            newIndex = 0;
                            break;
                        case 'End':
                            newIndex = tabs.length - 1;
                            break;
                        default:
                            return;
                        }
                        e.preventDefault();
                        tabs[newIndex].focus();
                    });
                });
            });
        }

        initializeForms() {
            this.setupFormValidation();
            if (this.settings.autoSave) this.setupAutoSave();
            this.setupFormSubmission();
        }

        setupFormValidation() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => this.clearFieldError(input));
                });
            });
        }

        validateField(field) {
            const value = field.value.trim();
            const isRequired = field.hasAttribute('required');
            const type = field.type;
            let isValid = true;
            let message = '';

            if (isRequired && !value) {
                isValid = false;
                message = 'This field is required';
            }

            if (value && type === 'email' && !this.isValidEmail(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }

            if (value && type === 'url' && !this.isValidUrl(value)) {
                isValid = false;
                message = 'Please enter a valid URL';
            }

            const pattern = field.getAttribute('pattern');
            if (value && pattern && !new RegExp(pattern).test(value)) {
                isValid = false;
                message = field.getAttribute('title') || 'Invalid format';
            }

            if (!isValid) this.showFieldError(field, message);
            else this.clearFieldError(field);

            return isValid;
        }

        showFieldError(field, message) {
            this.clearFieldError(field);
            field.classList.add('border-danger-500', 'focus:ring-danger-500');
            field.classList.remove('border-neutral-600');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-danger-400 text-sm mt-1 field-error';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }

        clearFieldError(field) {
            field.classList.remove('border-danger-500', 'focus:ring-danger-500');
            field.classList.add('border-neutral-600');
            const errorDiv = field.parentNode.querySelector('.field-error');
            if (errorDiv) errorDiv.remove();
        }

        setupAutoSave() {
            const forms = document.querySelectorAll('form[data-auto-save]');
            forms.forEach(form => {
                const inputs = form.querySelectorAll('input, select, textarea');
                let saveTimeout;
                inputs.forEach(input => {
                    input.addEventListener('input', () => {
                        if (saveTimeout) {
                            this.timers.delete(saveTimeout);
                            clearTimeout(saveTimeout);
                        }
                        saveTimeout = setTimeout(() => this.autoSaveForm(form), 2000);
                        this.timers.add(saveTimeout);
                    });
                });
            });
        }

        autoSaveForm(form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const formId = form.id || 'unnamed-form';
            try {
                localStorage.setItem(`orion-autosave-${formId}`, JSON.stringify(data));
                this.toastInfo('Form auto-saved', 1000);
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }

        setupFormSubmission() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', () => {
                    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitBtn) {
                        this.setButtonLoading(submitBtn, true);
                        setTimeout(() => this.setButtonLoading(submitBtn, false), 10000);
                    }
                });
            });
        }

        setButtonLoading(button, isLoading) {
            if (isLoading) {
                button.disabled = true;
                button.classList.add('opacity-75', 'cursor-not-allowed');
                const originalText = button.textContent;
                button.dataset.originalText = originalText;
                button.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                `;
            } else {
                button.disabled = false;
                button.classList.remove('opacity-75', 'cursor-not-allowed');
                button.textContent = button.dataset.originalText || 'Submit';
            }
        }

        initializeKeyboard() {
            this.addEventListenerWithCleanup(document, 'keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.quickSave();
                        break;
                    }
                }
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
        }

        quickSave() {
            const activeForm = document.activeElement && document.activeElement.closest && document.activeElement.closest('form');
            if (activeForm) this.autoSaveForm(activeForm);
        }

        initAccessibility() {
            this.addEventListenerWithCleanup(document, 'keydown', (e) => {
                if (e.key === 'Tab') document.body.classList.add('keyboard-navigation');
                if (e.key === 'Escape' && this.currentModal) this.hideModal(this.currentModal);
            });

            this.addEventListenerWithCleanup(document, 'mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });

            this.addEventListenerWithCleanup(document, 'focus', (e) => {
                if (!this.currentModal) return;
                const modal = this.modals.get(this.currentModal);
                if (modal && !modal.element.contains(e.target)) {
                    const firstFocusable = modal.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (firstFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }, true);

            this.onReady(() => {
                document.querySelectorAll('button:not([aria-label]):not([aria-describedby])').forEach(button => {
                    if (button.textContent && button.textContent.trim()) return;
                    const icon = button.querySelector('svg, img');
                    const alt = icon && icon.getAttribute && icon.getAttribute('alt');
                    if (alt) button.setAttribute('aria-label', alt);
                });
            });
        }

        initializeProgress() {
            const forms = document.querySelectorAll('form[data-progress]');
            forms.forEach(form => {
                form.addEventListener('submit', () => this.showProgressBar());
            });
        }

        showProgressBar() {
            let bar = document.getElementById('orion-progress');
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'orion-progress';
                bar.className = 'fixed top-0 left-0 right-0 h-1 bg-primary-500 z-50 transform -translate-x-full transition-transform duration-300';
                document.body.appendChild(bar);
            }
            bar.style.transform = 'translateX(0)';

            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    this.timers.delete(interval);
                    clearInterval(interval);
                    const hideTimeout = setTimeout(() => {
                        bar.style.transform = 'translateX(100%)';
                        this.timers.delete(hideTimeout);
                    }, 500);
                    this.timers.add(hideTimeout);
                }
                bar.style.width = progress + '%';
            }, 200);
            this.timers.add(interval);
        }

        bindEvents() {
            this.addEventListenerWithCleanup(window, 'resize', () => this.handleResize());
            this.addEventListenerWithCleanup(window, 'beforeunload', () => this.saveSettings());
            this.addEventListenerWithCleanup(document, 'visibilitychange', () => {
                if (document.hidden) this.handlePageHide();
                else this.handlePageShow();
            });
        }

        handleResize() {
            this.setupResponsiveFonts();
        }

        handlePageHide() {
            this.saveSettings();
        }

        handlePageShow() {
        }

        startPerformanceMonitoring() {
            if ('performance' in window && 'PerformanceObserver' in window) {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            console.log('LCP:', entry.startTime);
                        }
                    }
                });
                this.performanceObserver.observe({entryTypes: ['largest-contentful-paint']});
            }
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        ensureToastContainer() {
            if (this.toastContainer && this.toastContainer.isConnected) return;
            const container = document.createElement('div');
            container.className = 'fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none';
            container.id = 'toast-container';
            document.body.appendChild(container);
            this.toastContainer = container;
        }

        toastShow(message, type = 'info', duration = 5000) {
            this.ensureToastContainer();
            const id = Date.now() + Math.random();
            const toast = this.buildToast(message, type, id);
            this.toastContainer.appendChild(toast);
            this.toasts.set(id, toast);

            requestAnimationFrame(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
                toast.classList.add('translate-x-0', 'opacity-100');
            });

            if (duration > 0) setTimeout(() => this.toastDismiss(id), duration);
            return id;
        }

        toastSuccess(message, duration) {
            return this.toastShow(message, 'success', duration);
        }

        toastError(message, duration) {
            return this.toastShow(message, 'error', duration);
        }

        toastWarning(message, duration) {
            return this.toastShow(message, 'warning', duration);
        }

        toastInfo(message, duration) {
            return this.toastShow(message, 'info', duration);
        }

        toastDismiss(id) {
            const toast = this.toasts.get(id);
            if (!toast) return;
            toast.classList.add('translate-x-full', 'opacity-0');
            toast.classList.remove('translate-x-0', 'opacity-100');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                this.toasts.delete(id);
            }, 300);
        }

        buildToast(message, type, id) {
            const toast = document.createElement('div');
            toast.className = 'glass-heavy rounded-xl p-4 shadow-hero-xl border border-white/20 transform translate-x-full opacity-0 transition-all duration-300 pointer-events-auto';
            const typeClasses = {
                success: 'border-success-500/50 bg-success-500/10',
                error: 'border-danger-500/50 bg-danger-500/10',
                warning: 'border-warning-500/50 bg-warning-500/10',
                info: 'border-primary-500/50 bg-primary-500/10'
            };
            const icons = {
                success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
                error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>',
                warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>',
                info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            };
            toast.classList.add(...(typeClasses[type] || typeClasses.info).split(' '));
            toast.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${icons[type] || icons.info}
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-white font-medium">${message}</p>
                    </div>
                    <button class="flex-shrink-0 text-white/60 hover:text-white transition-colors" data-action="dismiss-toast" data-id="${id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            toast.querySelector('[data-action="dismiss-toast"]').addEventListener('click', () => this.toastDismiss(id));
            return toast;
        }

        createModal(options = {}) {
            const id = options.id || 'modal_' + Date.now();
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-50 hidden items-center justify-center p-4';
            modal.id = id;

            const backdrop = document.createElement('div');
            backdrop.className = 'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0';
            backdrop.onclick = () => options.dismissible !== false && this.hideModal(id);

            const sizeClass = options.size === 'sm' ? 'max-w-sm' : options.size === 'lg' ? 'max-w-2xl' : options.size === 'xl' ? 'max-w-4xl' : 'max-w-lg';
            const content = document.createElement('div');
            content.className = `glass-ultra rounded-xl border border-white/20 shadow-hero-xl w-full transform scale-95 transition-all duration-300 ${sizeClass}`;

            if (options.title || options.content) {
                content.innerHTML = `
                    ${options.title ? `
                        <div class="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 class="text-lg font-semibold text-white">${options.title}</h3>
                            ${options.dismissible !== false ? `
                                <button class="text-neutral-400 hover:text-white transition-colors" data-action="close-modal" data-id="${id}">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${options.content ? `<div class="p-6">${options.content}</div>` : ''}
                `;
            }

            modal.appendChild(backdrop);
            modal.appendChild(content);
            document.body.appendChild(modal);

            if (content.querySelector('[data-action="close-modal"]')) {
                content.querySelector('[data-action="close-modal"]').addEventListener('click', () => this.hideModal(id));
            }

            this.modals.set(id, {element: modal, backdrop, content, options});
            return id;
        }

        showModal(id) {
            const modal = this.modals.get(id);
            if (!modal) return;
            if (this.currentModal) this.hideModal(this.currentModal);

            this.currentModal = id;
            modal.element.classList.remove('hidden');
            modal.element.classList.add('flex');
            requestAnimationFrame(() => {
                modal.backdrop.classList.add('opacity-100');
                modal.content.classList.add('scale-100');
                modal.content.classList.remove('scale-95');
            });
            document.body.classList.add('overflow-hidden');
        }

        hideModal(id) {
            const modal = this.modals.get(id);
            if (!modal) return;

            modal.backdrop.classList.remove('opacity-100');
            modal.content.classList.add('scale-95');
            modal.content.classList.remove('scale-100');

            setTimeout(() => {
                modal.element.classList.add('hidden');
                modal.element.classList.remove('flex');
                document.body.classList.remove('overflow-hidden');
                if (this.currentModal === id) this.currentModal = null;
            }, 300);
        }

        destroyModal(id) {
            const modal = this.modals.get(id);
            if (!modal) return;
            this.hideModal(id);
            setTimeout(() => {
                if (modal.element.parentNode) modal.element.parentNode.removeChild(modal.element);
                this.modals.delete(id);
            }, 300);
        }

        confirmModal(title, message, onConfirm = () => {
        }) {
            const id = this.createModal({
                title: title,
                content: `
                    <div class="space-y-4">
                        <p class="text-neutral-300">${message}</p>
                        <div class="flex justify-end space-x-3">
                            <button class="btn-ghost px-4 py-2" data-action="cancel" data-id="${id}">Cancel</button>
                            <button class="btn-primary px-4 py-2" data-action="confirm" data-id="${id}">Confirm</button>
                        </div>
                    </div>
                `,
                dismissible: true
            });
            this.showModal(id);

            const modal = this.modals.get(id);
            const onCancel = () => this.hideModal(id);
            const onOk = () => {
                this.hideModal(id);
                onConfirm();
            };
            modal.content.querySelector('[data-action="cancel"]').addEventListener('click', onCancel);
            modal.content.querySelector('[data-action="confirm"]').addEventListener('click', onOk);

            return id;
        }

        closeAllModals() {
            if (!this.modals.size) return;
            if (this.currentModal) this.hideModal(this.currentModal);
        }

        showLoading(target, options = {}) {
            const element = typeof target === 'string' ? document.querySelector(target) : target;
            if (!element || element.hasAttribute('data-loading')) return;

            const loader = document.createElement('div');
            loader.className = 'absolute inset-0 flex items-center justify-center glass-heavy rounded-xl z-10';
            loader.innerHTML = `
                <div class="text-center">
                    <div class="loading-spinner mx-auto mb-3"></div>
                    <p class="text-white text-sm">${options.text || 'Loading...'}</p>
                </div>
            `;

            element.style.position = 'relative';
            element.setAttribute('data-loading', 'true');
            element.appendChild(loader);
            this.activeLoaders.add(element);
        }

        hideLoading(target) {
            const element = typeof target === 'string' ? document.querySelector(target) : target;
            if (!element || !element.hasAttribute('data-loading')) return;

            const loader = element.querySelector('.absolute.inset-0');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    if (loader.parentNode) loader.parentNode.removeChild(loader);
                }, 200);
            }
            element.removeAttribute('data-loading');
            this.activeLoaders.delete(element);
        }

        hideAllLoading() {
            Array.from(this.activeLoaders).forEach(el => this.hideLoading(el));
        }

        toggleNotifications() {
            this.toastInfo('No new notifications', 3000);
        }

        destroy() {
            this.eventListeners.forEach(({target, event, handler, options}) => {
                target.removeEventListener(event, handler, options);
            });
            this.eventListeners = [];
            this.components.clear();

            if (this.performanceObserver) {
                this.performanceObserver.disconnect();
                this.performanceObserver = null;
            }

            if (this.mediaQueryListener) {
                this.mediaQueryListener.mq.removeEventListener('change', this.mediaQueryListener.handleChange);
                this.mediaQueryListener = null;
            }

            this.timers.forEach(timer => {
                clearTimeout(timer);
                clearInterval(timer);
            });
            this.timers.clear();

            if (this.toastContainer && this.toastContainer.parentNode) {
                this.toastContainer.parentNode.removeChild(this.toastContainer);
                this.toastContainer = null;
            }
            this.toasts.clear();

            this.modals.forEach(({element}) => {
                if (element.parentNode) element.parentNode.removeChild(element);
            });
            this.modals.clear();
            this.currentModal = null;

            this.hideAllLoading();
            this.activeLoaders.clear();

            this.isInitialized = false;
            console.log('🧹 Orion App destroyed on unload');
        }
    }

    let orionapp = null;
    const boot = () => {
        if (!orionapp) {
            orionapp = new OrionApp();
            orionapp.init();
            window.OrionApp = orionapp;
            window.orionapp = orionapp;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, {once: true});
    } else {
        boot();
    }

    const cleanup = () => {
        if (orionapp && orionapp.destroy) {
            orionapp.destroy();
            orionapp = null;
            console.log('🧹 Orion App destroyed on unload');
        }
    };
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('unload', cleanup);
    console.log('📱 Orion App loaded!');
})(window, document);