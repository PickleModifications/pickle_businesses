fx_version "cerulean"
game "gta5"
author "Pickle Mods"
description "The best player-owned business system for your server!"
version "v0.1.0"

ui_page "nui/index.html"

files {
	"nui/index.html",
	"nui/assets/**/*.*",
}

shared_scripts {
	"@ox_lib/init.lua",
	"config.lua",
    "core/shared.lua",
    "locales/*.lua",
	"modules/**/shared.lua",
}

client_scripts {
	"bridge/**/**/client.lua",
	"modules/**/client.lua",
    "core/client.lua"
}

server_scripts {
	"@mysql-async/lib/MySQL.lua",
	"bridge/**/**/server.lua",
	"modules/**/server.lua",
}

lua54 'yes'

escrow_ignore {
	"config.lua",
	"_INSTALL/**/*.*",
	"bridge/**/**/*.*",
	"bridge/**/*.*",
    "locales/*.lua",

	-- COMMENT BELOW IF NOT SOURCE --

	-- "modules/**/*.*",
	-- "core/*.*",
}