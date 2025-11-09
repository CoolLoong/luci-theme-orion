include $(TOPDIR)/rules.mk

LUCI_TITLE:=Orion Theme
LUCI_DEPENDS:=
LUCI_PKGARCH:=all
PKG_VERSION:=0.0.1
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=CoolLoong

# Disable CSS minification as we handle it in build
LUCI_MINIFY_CSS:=

PKG_BUILD_DEPENDS:=node/host

include $(TOPDIR)/feeds/luci/luci.mk

define Build/Prepare
	$(call Build/Prepare/Default)
	$(CP) ./package.json $(PKG_BUILD_DIR)/
	$(CP) ./vite.config.ts $(PKG_BUILD_DIR)/
	$(CP) ./tailwind.config.js $(PKG_BUILD_DIR)/
	$(CP) -r ./src $(PKG_BUILD_DIR)/
	$(CP) -r ./public $(PKG_BUILD_DIR)/
	$(CP) -r ./scripts $(PKG_BUILD_DIR)/
endef

define Build/Compile
	cd $(PKG_BUILD_DIR) && npm install --production=false
	cd $(PKG_BUILD_DIR) && npm run build
	# Move view JS files to htdocs for proper installation
	if [ -d "$(PKG_BUILD_DIR)/ucode/view" ]; then \
		mkdir -p $(PKG_BUILD_DIR)/htdocs/luci-static/resources/view; \
		cp -a $(PKG_BUILD_DIR)/ucode/view/* $(PKG_BUILD_DIR)/htdocs/luci-static/resources/view/; \
		rm -rf $(PKG_BUILD_DIR)/ucode/view; \
	fi
endef