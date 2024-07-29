Config = {}

Config.Debug = true

Config.Language = "en" -- Language to use.

Config.InteractDistance = 2.0

Config.RenderDistance = 20.0 -- Table Prop Display Radius.

Config.DisplayDistance = 2.0 -- Interact and Queue Display Radius

Config.TheftDistance = 10 -- Theft is allowed when the crafter is further than this. Set to 0 if you wish to disable this.

Config.ItemImageFolder = "nui://ox_inventory/web/images" -- Don't put a slash at the end.

Config.PersistentTables = true -- Save placed tables in the database, this is new a feature!

Config.XPEnabled = true -- Enables the XP feature for adding and checking XP Levels.

Config.InventoryLimit = false -- If using ESX 1.1, this must be on if using a limit-based inventory.

Config.EnableTarget = true -- If true, this will use third-eye instead of pressing [E] to interact with crafting locations.

Config.MenuPosition = "top-right" -- 'top-left' or 'top-right' or 'bottom-left' or 'bottom-right' (ox_lib menu position)

Config.BusinessAdministration = {
    groups = { "admin", "god" }, -- This gives players with a specific group the ability to create and manage existing businesses. Don't hand this out to just anyone.
    jobs = {} -- This gives players with a specific job the ability to create and manage existing businesses. Don't hand this out to just anyone.
}

Config.BusinessSettings = {
    sellScale = 0.5, -- The multiplier to give back to the player when selling a business to the "state".
    maxLocations = 75, -- The maximum amount of locations a business can have.
    recentSalesCapacity = 3, -- How many recent sales to store.
}

Config.WebhookEvents = {
    business = function(businessId, business, log, url)
        local discordWebhook = url
        local embed
        if log.type == "hire_employee" then
            embed = {
                title = "New Employee",
                description = "A new employee has been hired!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Employee Name", value = log.employee },
                    { name = "Role", value = log.role },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "fire_employee" then
            embed = {
                title = "Employee Fired",
                description = "An employee has been fired!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Employee Name", value = log.employee },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "role_employee" then
            embed = {
                title = "Role Change",
                description = "An employee's role has been changed!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Employee Name", value = log.employee },
                    { name = "Role", value = log.role },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "add_role" then
            embed = {
                title = "New Role",
                description = "A new role has been added to the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Role", value = log.role },
                    { name = "Salary", value = NumberWithCommas(log.salary) },
                    { name = "Commission", value = log.commission .. "%" },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "edit_role" then
            embed = {
                title = "Role Updated",
                description = "A role has been updated in the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Role", value = log.role },
                    { name = "Salary", value = NumberWithCommas(log.salary) },
                    { name = "Commission", value = log.commission .. "%" },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "move_role" then
            embed = {
                title = "Role Moved",
                description = "A role has been moved in the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Role", value = log.role },
                    { name = "New Position", value = "#" .. log.position },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "remove_role" then
            embed = {
                title = "Role Removed",
                description = "A role has been removed from the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Role", value = log.role },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "add_funds" then
            embed = {
                title = "Funds Deposited",
                description = "Funds have been deposited to the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Funding Type", value = log.fundingType },
                    { name = "Amount", value = NumberWithCommas(log.amount) },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "remove_funds" then
            embed = {
                title = "Funds Withdrawn",
                description = "Funds have been withdrawn from the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Funding Type", value = log.fundingType },
                    { name = "Amount", value = NumberWithCommas(log.amount) },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "add_listing" then
            embed = {
                title = "New Listing",
                description = "A new listing has been added to the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Item", value = log.item },
                    { name = "Price", value = NumberWithCommas(log.price) },
                    { name = "Stock", value = log.stock },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "remove_listing" then
            embed = {
                title = "Listing Removed",
                description = "A listing has been removed from the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Item", value = log.item },
                    { name = "Stock", value = log.stock },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "update_listing" then
            embed = {
                title = "Listing Updated",
                description = "A listing has been updated in the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Item", value = log.item },
                    { name = "Price", value = NumberWithCommas(log.price) },
                    { name = "Stock", value = log.stock },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "add_trade_listing" then
            embed = {
                title = "New Trade Listing",
                description = "A new trade listing has been added to the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Offers", value = StringifyListings(log.offers.items) .. "\n" .. StringifyListings(log.offers.currencies, true) },
                    { name = "Demands", value = StringifyListings(log.demands.items) .. "\n" .. StringifyListings(log.demands.currencies, true) },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "remove_trade_listing" then
            embed = {
                title = "Trade Listing Removed",
                description = "A trade listing has been removed from the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Offers", value = StringifyListings(log.offers.items) .. "\n" .. StringifyListings(log.offers.currencies, true) },
                    { name = "Demands", value = StringifyListings(log.demands.items) .. "\n" .. StringifyListings(log.demands.currencies, true) },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        elseif log.type == "update_trade_listing" then
            embed = {
                title = "Trade Listing Updated",
                description = "A trade listing has been updated in the business!",
                color = 16711680, -- Red color
                fields = {
                    { name = "Business Name", value = business.label },
                    { name = "Offers", value = StringifyListings(log.offers.items) .. "\n" .. StringifyListings(log.offers.currencies, true) },
                    { name = "Demands", value = StringifyListings(log.demands.items) .. "\n" .. StringifyListings(log.demands.currencies, true) },
                    { name = "Timestamp", value = log.timestamp },
                }
            }
        end
        PerformHttpRequest(discordWebhook, function(err, text, headers)
            if err == 200 then
                print("Discord webhook sent successfully!")
            else
                print("Failed to send Discord webhook:", err)
            end
        end, "POST", json.encode({
            embeds = {
                embed
            }
        }), { ["Content-Type"] = "application/json" })
    end,
    purchase = function(businessId, business, log, url)
        local discordWebhook = url
        PerformHttpRequest(discordWebhook, function(err, text, headers)
            if err == 200 then
                print("Discord webhook sent successfully!")
            else
                print("Failed to send Discord webhook:", err)
            end
        end, "POST", json.encode({
            embeds = {
                {
                    title = "New Purchase",
                    description = "A new purchase has been made!",
                    color = 16711680, -- Red color
                    fields = {
                        { name = "Business Name", value = business.label },
                        { name = "Price", value = NumberWithCommas(log.price) },
                        { name = "Items", value = StringifyListings(log.items) },
                        { name = "Timestamp", value = log.timestamp },
                    }
                }
            }
        }), { ["Content-Type"] = "application/json" })
    end,
    trade = function(businessId, business, log, url)
        local discordWebhook = url
        PerformHttpRequest(discordWebhook, function(err, text, headers)
            if err == 200 then
                print("Discord webhook sent successfully!")
            else
                print("Failed to send Discord webhook:", err)
            end
        end, "POST", json.encode({
            embeds = {
                {
                    title = "New Trade",
                    description = "A new trade has been made!",
                    color = 16711680, -- Red color
                    fields = {
                        { name = "Business Name", value = business.label },
                        { name = "Offers", value = StringifyListings(log.offers.items) .. "\n" .. StringifyListings(log.offers.currencies, true) },
                        { name = "Demands", value = StringifyListings(log.demands.items) .. "\n" .. StringifyListings(log.demands.currencies, true) },
                        { name = "Timestamp", value = log.timestamp },
                    }
                }
            }
        }), { ["Content-Type"] = "application/json" })
    end,
}

Config.Furniture = {
    categories = {
        {
            label = "Chairs",
            icon = "chair",
            options = {
                { label = "Chair #1", model = `prop_off_chair_01` },
                { label = "Chair #2", model = `prop_off_chair_03` },
                { label = "Chair #3", model = `prop_off_chair_04` },
                { label = "Chair #4", model = `prop_off_chair_05` },
            }
        },
        {
            label = "Tables",
            icon = "shop",
            options = {
                { label = "Table #1", model = `prop_table_04` },
                { label = "Table #2", model = `bkr_int_02_plan_table` },
            }
        },
    }
}

Config.Actions = {
    ["cook"] = function(data)
        local coords = data.coords
        local pcoords = GetEntityCoords(PlayerPedId())
        local calcHeading = GetHeadingFromCoords(coords, pcoords)
    end,
    ["dispense_drink"] = function(data)
        local coords = data.coords
        local pcoords = GetEntityCoords(PlayerPedId())
        local calcHeading = GetHeadingFromCoords(coords, pcoords)
        SetEntityHeading(PlayerPedId(), calcHeading)
        PlayAnim(PlayerPedId(), "amb@prop_human_bbq@male@base", "base", 8.0, -8.0, -1, 49, 0, false, false, false)
        lib.progressBar({ duration = 5000, label = 'Cooking ' .. GetItemLabel(data.craftingItem.name) .. "..."})
        ClearPedTasks(PlayerPedId())
        return true
    end,
}

Config.Crafting = {
    timeoutTime = 120, -- The amount of seconds to wait before removing a player's crafting status if they haven't finished. (Player disconnects, etc.)
}

Config.Storage = {
    slots = 50, -- The amount of slots a storage location can hold.
    maxWeight = 10000, -- The maximum weight a storage location can hold.
}

Config.SupplyStores = {
    {
        coords = vector3(55.1603, -1739.1967, 28.5928),
        heading = 54.9914,
        model = { modelType = "ped", hash = "s_m_m_linecook" },
        zones = {}, -- Leave this empty to allow all business zones to access their supply store here.
    },
}

Config.DefaultCallbacks = { -- If undefined in zone.callbacks, these will be used.
    ownerCheck = function(source, businessId, business, ownershipType, price)
        -- Add checks for licenses, etc. Whatever you want!
        return true
    end,
    postOwner = function(source, businessId, business, ownershipType, price)
        -- Add checks for licenses, etc. Whatever you want!
    end,
    purchaseCheck = function(source, businessId, business, cart, price)
        -- Add checks for licenses, etc. Whatever you want!
        return true
    end,
    postPurchase = function(source, businessId, business, cart, price)
        -- Add checks for licenses, etc. Whatever you want!
    end,
}

Config.BusinessZones = { -- This is where you can create business types, which give access to zone-specific supplies and craftables.
    {
        name = "food_store", -- Set unique to other business zones.
        label = "Food Store",
        callbacks = {
            ownerCheck = function(source, businessId, purchaseType, price)
                -- Add checks for licenses, etc. Whatever you want!
                return true
            end,
            postOwner = function(source, businessId, purchaseType, price)
                -- Add checks for licenses, etc. Whatever you want!
            end,
            purchaseCheck = function(source, businessId, cart, price)
                -- Add checks for licenses, etc. Whatever you want!
                return true
            end,
            postPurchase = function(source, businessId, cart, price)
                -- Add checks for licenses, etc. Whatever you want!
            end,
        },
        supplies = {
            {
                name = "water",
                count = 1,
                price = 10
            },
            {
                name = "ammo-rifle",
                count = 2,
                price = 20
            },
        },
        craftingTypes = {
            {
                name = "food", -- Set unique to other crafting types in this zone.
                label = "Cook Food",
                craftableItems = {
                    {  name = "ammo-rifle", count = 1, required = { {name = "water", count = 1} }, action = "cook" },
                }
            },
            {
                name = "drink", -- Set unique to other crafting types in this zone.
                label = "Dispense Drink",
                craftableItems = {
                    {  name = "ammo-9", count = 1, required = { {name = "water", count = 1} }, action = "dispense_drink" },
                }
            }
        }
    },
    {
        name = "clothing_store", -- Set unique to other business zones.
        label = "Clothing Store",
        supplies = {
            {
                name = "shirt",
                count = 1,
                price = 10
            },
            {
                name = "pants",
                count = 1,
                price = 10
            },
            {
                name = "shoes",
                count = 1,
                price = 10
            }
        },
        craftingTypes = {},
    }
}