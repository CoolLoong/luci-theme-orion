#
# Copyright (C) 2024 CoolLoong
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

# Standard LuCI variables following luci.mk conventions
LUCI_NAME:=luci-theme-orion
LUCI_TYPE:=theme
LUCI_BASENAME:=orion
LUCI_TITLE:=Orion Theme
LUCI_DEPENDS:=
LUCI_PKGARCH:=all

# Package information
PKG_NAME:=$(LUCI_NAME)
PKG_VERSION:=0.0.1
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=4. Themes
  TITLE:=$(LUCI_TITLE)
  URL:=https://github.com/CoolLoong/luci-theme-orion
  DEPENDS:=$(LUCI_DEPENDS)
  PKGARCH:=$(LUCI_PKGARCH)
  MAINTAINER:=CoolLoong
endef

define Package/$(PKG_NAME)/description
	Modern LuCI theme with Tailwind CSS styling
endef

# Build dependencies for Tailwind CSS compilation
BUILD_DEPENDS:=node/host

define Host/Prepare
	$(Host/Prepare/Default)
endef

define Host/Configure
endef

define Host/Compile
endef

define Host/Install
endef

define Build/Prepare
	$(Build/Prepare/Default)
	$(CP) ./package.json $(PKG_BUILD_DIR)/
	$(CP) ./tailwind.config.js $(PKG_BUILD_DIR)/
	$(CP) -r ./htdocs $(PKG_BUILD_DIR)/
	$(CP) -r ./luasrc $(PKG_BUILD_DIR)/
	$(CP) -r ./root $(PKG_BUILD_DIR)/
	$(CP) -r ./src $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
	cd $(PKG_BUILD_DIR) && npm i --production=false
	cd $(PKG_BUILD_DIR) && npm run build-prod
endef

# Enhanced installation following luci.mk patterns
define Package/$(PKG_NAME)/install
	# Install UCI defaults
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/root/etc/uci-defaults/* $(1)/etc/uci-defaults/ 2>/dev/null || true
	
	# Install theme static files
	$(INSTALL_DIR) $(1)/www/luci-static/$(LUCI_BASENAME)
	$(CP) -a $(PKG_BUILD_DIR)/htdocs/luci-static/$(LUCI_BASENAME)/* $(1)/www/luci-static/$(LUCI_BASENAME)/ 2>/dev/null || true
	
	# Install shared resources
	$(INSTALL_DIR) $(1)/www/luci-static/resources
	$(CP) -a $(PKG_BUILD_DIR)/htdocs/luci-static/resources/* $(1)/www/luci-static/resources/ 2>/dev/null || true
	
	# Install Lua libraries and controllers
	if [ -d $(PKG_BUILD_DIR)/luasrc ]; then \
		$(INSTALL_DIR) $(1)/usr/lib/lua/luci; \
		$(CP) -a $(PKG_BUILD_DIR)/luasrc/* $(1)/usr/lib/lua/luci/ 2>/dev/null || true; \
	fi
	
	# Install root filesystem files
	if [ -d $(PKG_BUILD_DIR)/root ]; then \
		$(CP) -a $(PKG_BUILD_DIR)/root/* $(1)/ 2>/dev/null || true; \
	fi

	@echo "$(LUCI_TITLE) installation completed"
endef

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	if [ -f /etc/uci-defaults/30_luci-theme-$(LUCI_BASENAME) ]; then
		( . /etc/uci-defaults/30_luci-theme-$(LUCI_BASENAME) ) && \
		rm -f /etc/uci-defaults/30_luci-theme-$(LUCI_BASENAME)
	fi
}
exit 0
endef

define Package/$(PKG_NAME)/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.$(LUCI_BASENAME)
	uci -q get luci.main.mediaurlbase | grep -q "$(LUCI_BASENAME)" && \
		uci -q set luci.main.mediaurlbase=/luci-static/bootstrap
	uci commit luci
}
endef

$(eval $(call BuildPackage,$(PKG_NAME)))