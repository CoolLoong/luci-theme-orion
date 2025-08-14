local m, s, o

m = Map("orion", translate("Orion Theme Configuration"), 
	translate("Configure the Orion theme appearance and navigation bar"))

s = m:section(TypedSection, "theme", translate("Theme Settings"))
s.anonymous = true
s.addremove = false

o = s:option(Flag, "navbar", translate("Enable Navbar"),
	translate("Enable custom navigation bar"))
o.default = "1"

-- Navigation bar configuration
s = m:section(TypedSection, "navbar", translate("Navigation Bar Items"))
s.anonymous = true
s.addremove = true
s.template = "cbi/tblsection"

o = s:option(Value, "name", translate("Name"), 
	translate("Display name for the navigation item"))

o = s:option(Flag, "enable", translate("Enable"), 
	translate("Enable this navigation item"))
o.default = "Enable"

o = s:option(Value, "line", translate("Order"), 
	translate("Display order (1-10)"))
o.default = "1"

o = s:option(Flag, "newtab", translate("New Tab"), 
	translate("Open link in new tab"))
o.default = "No"

o = s:option(ListValue, "icon", translate("Icon"), 
	translate("Select icon for the navigation item"))
o:value("resources/icons/navbar/overview.png", translate("Overview"))
o:value("resources/icons/navbar/network.png", translate("Network"))
o:value("resources/icons/navbar/openclash.png", translate("Clash"))
o:value("resources/icons/navbar/filemanager.png", translate("NAS"))
o:value("resources/icons/navbar/neko.png", translate("Neko"))
o:value("resources/icons/navbar/terminal.png", translate("Terminal"))
o.default = "resources/icons/navbar/overview.png"

o = s:option(Value, "address", translate("URL"), 
	translate("Target Cbi URL"))

return m