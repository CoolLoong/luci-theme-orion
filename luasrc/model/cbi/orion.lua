local m, s, o

m = Map("orion", "Orion 主题配置")

s = m:section(TypedSection, "theme", "主题设置")
s.anonymous = true
s.addremove = false

o = s:option(Flag, "navbar", "启用导航栏")
o.default = "1"

-- Navigation bar configuration
s = m:section(TypedSection, "navbar", "导航栏项目")
s.anonymous = true
s.addremove = true
s.template = "cbi/tblsection"

o = s:option(Value, "name", "名称")

o = s:option(Flag, "enable", "启用")
o.default = "Enable"

o = s:option(Value, "line", "排序")
o.default = "1"

o = s:option(Flag, "newtab", "新标签页")
o.default = "No"

o = s:option(ListValue, "icon", "图标")
o:value("resources/icons/navbar/overview.png", "概览")
o:value("resources/icons/navbar/network.png", "网络")
o:value("resources/icons/navbar/openclash.png", "Clash")
o:value("resources/icons/navbar/filemanager.png", "网络存储")
o:value("resources/icons/navbar/neko.png", "Neko")
o:value("resources/icons/navbar/terminal.png", "终端")
o.default = "resources/icons/navbar/overview.png"

o = s:option(Value, "address", "网址")

return m