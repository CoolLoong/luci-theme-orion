module("luci.controller.admin.orion", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/orion") then
		return
	end

	local page
	
	page = entry({"admin", "system", "orion"}, cbi("orion"), _("Orion Theme"), 60)
	page.dependent = true
end