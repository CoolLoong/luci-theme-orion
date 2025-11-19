/**
 * Orion App - Single consolidated class
 */
(function (window, document) {
    'use strict';

    class OrionApp {
        constructor() {
            this.isInitialized = false;
            this.firewallObserver = null;
        }

        init() {
            if (this.isInitialized) return;
            this.onReady(() => {
            });
            this.onLoad(() => {
                this.handleFirewallPage();
                console.log('📱 Orion App loaded!');
            });
            this.isInitialized = true;
            console.log('🚀 Orion App initialized');
        }

        onReady(cb) {
            if (document.readyState !== 'complete') {
                const handler = () => {
                    cb();
                    document.removeEventListener('DOMContentLoaded', handler);
                };
                document.addEventListener('DOMContentLoaded', handler, { once: true });
            } else {
                cb();
            }
        }

        onLoad(cb) {
            const handler = () => {
                cb();
                window.removeEventListener('load', handler);
            };
            window.addEventListener('load', handler, { once: true });
        }

        handleFirewallPage() {
            if (!window.location.pathname.includes("/cgi-bin/luci/admin/status/firewall")) {
                return;
            }

            // Helper function to remove elements
            const processElements = () => {
                try {
                    const styleElement = document.querySelector("#view > div > style");
                    if (styleElement) {
                        styleElement.remove();
                    }
                } catch (error) {
                    console.warn('Failed to remove style element on firewall page:', error);
                }

                try {
                    const nftSetItems = document.querySelectorAll(".nft-set-items");
                    nftSetItems.forEach((element) => {
                        if (element && element.parentNode) {
                            element.remove();
                        }
                    });
                } catch (error) {
                    console.warn('Failed to remove .nft-set-items on firewall page:', error);
                }

                try {
                    const nftSets = document.querySelectorAll(".nft-set.cbi-tooltip-container");
                    const textNodesToRemove = [];
                    for (const container of nftSets) {
                        for (const childNode of container.childNodes) {
                            if (childNode.nodeName === "#text") {
                                textNodesToRemove.push(childNode);
                            }
                        }
                    }
                    textNodesToRemove.forEach((node) => {
                        if (node && node.parentNode) {
                            node.remove();
                        }
                    });
                } catch (error) {
                    console.warn('Failed to remove text nodes on firewall page:', error);
                }

                // Process .ifacebadge elements
                try {
                    const ifacebadges = document.querySelectorAll(".ifacebadge");
                    ifacebadges.forEach((badge) => {
                        const strongElement = badge.querySelector('strong');
                        if (!strongElement) return;

                        const strongValue = strongElement.textContent.trim();
                        // Only process if strong contains 'xt' or 'vmap'
                        if (strongValue !== 'xt' && strongValue !== 'vmap') {
                            return;
                        }

                        // Remove { and } text nodes
                        const textNodesToRemove = [];
                        for (const childNode of badge.childNodes) {
                            if (childNode.nodeName === "#text") {
                                const text = childNode.textContent.trim();
                                if (text === '{' || text === '}') {
                                    textNodesToRemove.push(childNode);
                                }
                            }
                        }
                        textNodesToRemove.forEach((node) => {
                            if (node && node.parentNode) {
                                node.remove();
                            }
                        });

                        // Extract data-tooltip and replace strong content
                        const tooltip = badge.getAttribute('data-tooltip');
                        if (tooltip) {
                            try {
                                // Decode HTML entities
                                const decoded = tooltip.replace(/&quot;/g, '"')
                                    .replace(/&apos;/g, "'")
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&amp;/g, '&');

                                // Try to parse and format as JSON
                                try {
                                    const jsonObj = JSON.parse(decoded);
                                    // Format with indentation for better readability
                                    const formatted = JSON.stringify(jsonObj, null, 2);

                                    // Replace strong with pre/code for better formatting
                                    const codeElement = document.createElement('code');
                                    codeElement.className = 'text-xs whitespace-pre-wrap break-all';
                                    codeElement.textContent = formatted;

                                    strongElement.replaceWith(codeElement);
                                } catch (jsonError) {
                                    // If not valid JSON, just use decoded string
                                    strongElement.textContent = decoded;
                                }
                            } catch (e) {
                                console.warn('Failed to process tooltip for ifacebadge:', e);
                            }
                        }
                    });
                } catch (error) {
                    console.warn('Failed to process .ifacebadge elements on firewall page:', error);
                }
            };

            // Remove existing elements immediately
            processElements();

            // Watch for dynamically added elements using MutationObserver
            const targetNode = document.querySelector("#view") || document.body;
            const observer = new MutationObserver((mutations) => {
                let shouldProcess = false;
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && (node.classList.contains('nft-set-items') ||
                                    node.classList.contains('nft-set') ||
                                    node.classList.contains('ifacebadge'))) {
                                    shouldProcess = true;
                                    break;
                                }
                                // Check descendants
                                if (node.querySelector && (node.querySelector('.nft-set-items') ||
                                    node.querySelector('.nft-set.cbi-tooltip-container') ||
                                    node.querySelector('.ifacebadge'))) {
                                    shouldProcess = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (shouldProcess) break;
                }
                if (shouldProcess) {
                    processElements();
                }
            });

            observer.observe(targetNode, {
                childList: true,
                subtree: true
            });

            // Store observer for cleanup
            if (!this.firewallObserver) {
                this.firewallObserver = observer;
            }
        }

        destroy() {
            if (this.firewallObserver) {
                this.firewallObserver.disconnect();
                this.firewallObserver = null;
            }
        }
    }

    let orionapp = new OrionApp();
    orionapp.init();
    window.OrionApp = orionapp;
    window.orionapp = orionapp;
    const cleanup = () => {
        if (orionapp && orionapp.destroy) {
            orionapp.destroy();
            orionapp = null;
            console.log('🧹 Orion App destroyed on unload');
        }
    };
    window.addEventListener('beforeunload', cleanup);
})(window, document);