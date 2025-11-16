'use strict';
'require baseclass';
'require ui';
'require rpc';
'require poll';

var callCPUUsage = rpc.declare({
    object: 'luci',
    method: 'getCPUUsage'
});

var callSystemInfo = rpc.declare({
    object: 'system',
    method: 'info'
});

/**
 * Orion Theme Menu Module
 * Handles rendering and interaction of the main navigation menu and sidebar
 */
return baseclass.extend({
    /**
     * Initialize the menu module
     * Load menu data and trigger rendering
     */
    __init__: function () {
        ui.menu.load().then(L.bind(this.render, this));
    },

    /**
     * Main render function for the menu system
     * @param {Object} tree - Menu tree structure from LuCI
     */
    render: function (tree) {
        var node = tree,
            url = '',
            children = ui.menu.getChildren(tree);

        // Find and render the active main menu item
        for (var i = 0; i < children.length; i++) {
            var isActive = (L.env.requestpath.length ? children[i].name == L.env.requestpath[0] : i == 0);

            if (isActive) {
                this.renderMainMenu(children[i], children[i].name);
            }
        }

        // Render tab menu if we're deep enough in the navigation hierarchy
        if (L.env.dispatchpath.length >= 3) {
            for (var i = 0; i < 3 && node; i++) {
                node = node.children[L.env.dispatchpath[i]];
                url = url + (url ? '/' : '') + L.env.dispatchpath[i];
            }

            if (node) {
                this.renderTabMenu(node, url);
            }
        }

        this.updateStatusIndicators();

        // Start polling and keep a reference so it can be removed on detach
        this._pollId = poll.add(() => this.updateStatusIndicators());
    },

    detach: function () {
        if (this._pollId) {
            poll.remove(this._pollId);
            this._pollId = null;
        }
        return this.super('detach', arguments);
    },

    /**
     * Handle menu expand/collapse functionality - HeroUI Accordion Style
     * Manages the accordion animation and active states of menu items
     * @param {Event} ev - Click event from menu item
     */
    handleMenuExpand: function (ev) {
        var target = ev.target.closest('a');
        var slide = target.parentNode;
        var slideMenu = target.nextElementSibling;
        var sidebar = document.querySelector('#mainmenu') || document.querySelector('.sidebar-orion');

        // Don't expand menus if sidebar is collapsed
        if (sidebar && sidebar.classList.contains('collapsed')) {
            return;
        }

        // Exit if there's no submenu to show
        if (!slideMenu || !slideMenu.classList.contains('slide-menu')) {
            return;
        }

        var isCurrentlyActive = slide.classList.contains('active');

        // Close all currently active submenus (accordion behavior)
        var activeMenus = document.querySelectorAll('#mainmenu .nav > li.slide.active');
        activeMenus.forEach(function (li) {
            li.classList.remove('active');
            // Also remove active class from the main menu link
            var menuLink = li.querySelector('a.menu');
            if (menuLink) {
                menuLink.classList.remove('active');
            }
            // Remove active class from submenu
            var submenu = li.querySelector('ul.slide-menu');
            if (submenu) {
                submenu.classList.remove('active');
            }
        });

        // If the clicked menu wasn't already active, open it
        if (!isCurrentlyActive) {
            slide.classList.add('active');
            target.classList.add('active');
            // Also add active class to submenu
            if (slideMenu) {
                slideMenu.classList.add('active');
            }
        }

        // Prevent default link behavior and event bubbling
        ev.preventDefault();
        ev.stopPropagation();
    },

    /**
     * Render the main navigation menu
     * Creates hierarchical menu structure with active states and click handlers
     * @param {Object} tree - Menu tree node to render
     * @param {string} url - Base URL for menu items
     * @param {number} level - Current nesting level (0-based)
     * @returns {Element} - Generated menu element
     */
    renderMainMenu: function (tree, url, level) {
        var currentLevel = (level || 0) + 1;
        var menuContainer = E('ul', {'class': level ? 'slide-menu' : 'nav'});
        var children = ui.menu.getChildren(tree);

        // Don't render empty menus or menus deeper than 2 levels
        if (children.length === 0 || currentLevel > 2) {
            return E([]);
        }

        // Generate menu items for each child
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var isActive = (
                (L.env.dispatchpath[currentLevel] === child.name) &&
                (L.env.dispatchpath[currentLevel - 1] === tree.name)
            );

            // Recursively render submenu
            var submenu = this.renderMainMenu(child, url + '/' + child.name, currentLevel);
            var hasChildren = submenu.children && submenu.children.length > 0;

            // Determine CSS classes based on state
            var slideClass = hasChildren ? 'slide' : '';
            var menuClass = hasChildren ? 'menu' : 'food';

            if (isActive) {
                menuContainer.classList.add('active');
                slideClass += ' active';
                menuClass += ' active';
            }

            // Create menu item with link and submenu
            var menuItem = E('li', {'class': slideClass}, [
                E('a', {
                    'href': hasChildren ? '#' : L.url(url, child.name),
                    'click': (currentLevel === 1 && hasChildren) ? ui.createHandlerFn(this, 'handleMenuExpand') : null,
                    'class': menuClass,
                    'data-title': (child.title || '').replace(/ /g, '_'),
                }, [E('span', {}, [_(child.title)])]),
                submenu
            ]);

            menuContainer.appendChild(menuItem);
        }

        // Append to main menu container if this is the top level
        if (currentLevel === 1) {
            var mainMenuElement = document.querySelector('#mainmenu');
            if (mainMenuElement) {
                mainMenuElement.appendChild(menuContainer);
                mainMenuElement.style.display = '';
            }
        }

        return menuContainer;
    },

    /**
     * Render tab navigation menu
     * Creates horizontal tab menu for deeper navigation levels
     * @param {Object} tree - Menu tree node to render
     * @param {string} url - Base URL for tab items
     * @param {number} level - Current nesting level (0-based)
     * @returns {Element} - Generated tab menu element
     */
    renderTabMenu: function (tree, url, level) {
        var container = document.querySelector('#tabmenu');
        var currentLevel = (level || 0) + 1;
        var tabContainer = E('ul', {'class': 'tabs'});
        var children = ui.menu.getChildren(tree);
        var activeNode = null;

        // Don't render empty tab menus
        if (children.length === 0) {
            return E([]);
        }

        // Generate tab items for each child
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var isActive = (L.env.dispatchpath[currentLevel + 2] === child.name);
            var activeClass = isActive ? ' active' : '';
            var className = 'tabmenu-item-%s %s'.format(child.name, activeClass);

            var tabItem = E('li', {'class': className}, [
                E('a', {'href': L.url(url, child.name)}, [_(child.title)])
            ]);

            tabContainer.appendChild(tabItem);

            // Store reference to active node for recursive rendering
            if (isActive) {
                activeNode = child;
            }
        }

        // Append tab container to main tab menu element
        if (container) {
            container.appendChild(tabContainer);
            container.style.display = '';

            // Recursively render nested tab menus if there's an active node
            if (activeNode) {
                var nestedTabs = this.renderTabMenu(activeNode, url + '/' + activeNode.name, currentLevel);
                if (nestedTabs.children.length > 0) {
                    container.appendChild(nestedTabs);
                }
            }
        }

        return tabContainer;
    },

    extractSystemStats: async function () {
        let sysInfo = await callSystemInfo();
        let cpuusage = await callCPUUsage();

        const safe = (n) => (typeof n === 'number' && isFinite(n) ? n : 0);
        const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

        // Memory percent
        const total = safe(sysInfo?.memory?.total);
        const available = safe(sysInfo?.memory?.available);
        const mem = total > 0 ? ((total - available) / total) * 100 : 0;

        // CPU percent: support several possible shapes
        let cpu = 0;
        const raw = cpuusage?.cpuusage;
        if (typeof raw === 'number') {
            cpu = clamp(raw);
        } else if (raw && typeof raw.p1 === 'number') {
            cpu = clamp(raw.p1);
        } else if (Array.isArray(raw) && typeof raw[0] === 'number') {
            cpu = clamp(raw[0]);
        }

        return {
            cpu: cpu,
            memory: clamp(safe(mem)),
            isOnline: true
        };
    },

    updateStatusIndicators: async function () {
        const container = document.getElementById('monitor');
        if (!container) return;

        let stats = await this.extractSystemStats();
        const cpu = Math.floor(stats.cpu);
        const mem = Math.floor(stats.memory);

        function getStatusColor(usage) {
            if (usage > 90) return '#ef4444';
            if (usage > 70) return '#f59e42';
            return '#22c55e';
        }

        const isOnline = stats && stats.isOnline !== false;

        container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; border-radius: 9999px; background: ${getStatusColor(cpu)};"></div>
                <span style="color: #d4d4d8;">CPU: ${cpu}%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; border-radius: 9999px; background: ${getStatusColor(mem)};"></div>
                <span style="color: #d4d4d8;">RAM: ${mem}%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; border-radius: 9999px; background: ${isOnline ? '#22c55e' : '#ef4444'};${isOnline ? 'animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;' : ''}"></div>
                <span style="color: #d4d4d8;">${isOnline ? 'Online' : 'Offline'}</span>
            </div>
        </div>
        `;
    }
});