'use strict';
'require view';
'require form';
'require uci';

return view.extend({
	load: function() {
		return uci.load('orion');
	},

	render: function() {
		var m, s, o;

		m = new form.Map('orion', _('Orion Theme Configuration'));

		s = m.section(form.TypedSection, 'theme', _('Theme Settings'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'navbar', _('Enable Navbar'));
		o.default = '1';

		s = m.section(form.TableSection, 'navbar', _('Navbar Items'));
		s.anonymous = true;
		s.addremove = true;

		o = s.option(form.Value, 'name', _('Name'));
		o.rmempty = false;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.default = 'Enable';

		o = s.option(form.Value, 'line', _('Order'));
		o.default = '1';
		o.datatype = 'uinteger';

		o = s.option(form.Flag, 'newtab', _('Open in New Tab'));
		o.default = 'No';

		o = s.option(form.ListValue, 'icon', _('Icon'));
		o.value('resources/icons/navbar/overview.png', _('Overview'));
		o.value('resources/icons/navbar/network.png', _('Network'));
		o.value('resources/icons/navbar/openclash.png', _('Clash'));
		o.value('resources/icons/navbar/filemanager.png', _('File Manager'));
		o.value('resources/icons/navbar/neko.png', _('Neko'));
		o.value('resources/icons/navbar/terminal.png', _('Terminal'));
		o.default = 'resources/icons/navbar/overview.png';

		o = s.option(form.Value, 'address', _('URL'));
		o.rmempty = false;

		return m.render();
	}
});
