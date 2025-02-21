local CustomizeIcons = {
    ["furniture"] = "couch",
    ["management"] = "user-tie",
    ["storage"] = "box",
    ["crafting"] = "hammer",
    ["billing"] = "file-invoice-dollar",
    ["market"] = "store"
}

local currentCustomize = nil

local isTrackingLocalProps = false

function round(num, numDecimalPlaces)
    return tonumber(string.format("%." .. (numDecimalPlaces or 0) .. "f", num))
end

function GetRaycastCoords()
    local hit, entityHit, endCoords, surfaceNormal, materialHash
    if lib.raycast.fromCamera then
        hit, entityHit, endCoords, surfaceNormal, materialHash = lib.raycast.fromCamera(511, 4, 20)
    elseif lib.raycast.cam then
        hit, entityHit, endCoords, surfaceNormal, materialHash = lib.raycast.cam(511, 4, 20.0)
    end
    if hit and endCoords then
        return endCoords
    end
end

function GetFurnitureModelInfo(model) 
    if not model then return end
    for i=1, #Config.Furniture.categories do 
        for j=1, #Config.Furniture.categories[i].options do 
            if Config.Furniture.categories[i].options[j].model == model then
                return i, j, Config.Furniture.categories[i].options[j]
            end
        end
    end
end

function Customize_GetLocationIndexById(id)
    if not currentCustomize then return end
    for i=1, #currentCustomize.locations do 
        if currentCustomize.locations[i].id == id then
            return i
        end
    end
end

function Customize_GetBusinessRanks(businessId, isMenu)
    if not currentCustomize then return end
    local businessId = currentCustomize.businessId
    if not businessId then return end
    local business = Businesses[businessId]
    if not business then return end
    local ranks = {}
    for i=1, #business.roles do 
        ranks[#ranks + 1] = business.roles[i].label
    end
    return ranks
end

function Customize_PositionEditorMenu()
    if not currentCustomize then return end
    local currentLocation = currentCustomize.currentLocation
    local coords, model = currentLocation.coords, currentLocation.model
    local setting_position = true
    local endCoords = { x = coords.x, y = coords.y, z = coords.z }
    local rotation = currentLocation.rotation and { x = currentLocation.rotation.x, y = currentLocation.rotation.y, z = currentLocation.rotation.z } or { x = 0.0, y = 0.0, z = 0.0 }
    local title = _L("customize_location_position_editor")
    local options = {}
    local selectedOption = 0
    local positionOptionOffset = 1
    local color = {255, 0, 0}

    options[#options + 1] = {label = "Restart Position Setup", icon = "location-dot", close = false}
    options[#options + 1] = {label = "Position (X-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
    options[#options + 1] = {label = "Position (Y-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
    options[#options + 1] = {label = "Position (Z-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
    if model then
        options[#options + 1] = {label = "Rotation (Heading / Z-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
        options[#options + 1] = {label = "Rotation (X-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
        options[#options + 1] = {label = "Rotation (Y-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }
    end
    options[#options + 1] = {label = _L("customize_position_save"), icon = "save", close = false}


    lib.registerMenu({
        id = 'customize_location_position_editor',
        title = title,
        position = Config.MenuPosition,
        onSelected = function(selected, scrollIndex)
            selectedOption = selected
        end,
        onClose = function()
            setting_position = false
            Customize_AddLocationMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected == 1 then
            setting_position = false
            SetTimeout(100, function()
                Customize_PositionMenu()
            end)
            return 
        elseif (model and selected == 8) or (not model and selected == 5) then
            if color[1] ~= 255 then
                setting_position = false
                lib.hideMenu()
                currentLocation.coords = vector3(endCoords.x, endCoords.y, endCoords.z)
                currentLocation.rotation = vector3(rotation.x, rotation.y, rotation.z)
                currentCustomize.currentLocation = currentLocation
                SetTimeout(100, function()
                    Customize_AddLocationMenu()
                end)
            end
            return 
        end
    end)
    lib.showMenu("customize_location_position_editor")
    CreateThread(function()
        local object = nil
        local minZ = 0
        if currentLocation.id then
            Customize_RefreshLocationProps({currentLocation.id})
        end
        local currentZone = lib.zones.poly({
            name = "business_zone",
            points = currentCustomize.bounds,
            thickness = 1000.0
        })
        while setting_position do
            Wait(0)
            if selectedOption == 1 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    endCoords.x = endCoords.x - 0.01
                elseif IsControlPressed(0, 175) then
                    endCoords.x = endCoords.x + 0.01
                end
            elseif selectedOption == 2 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    endCoords.y = endCoords.y - 0.01
                elseif IsControlPressed(0, 175) then
                    endCoords.y = endCoords.y + 0.01
                end
            elseif selectedOption == 3 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    endCoords.z = endCoords.z + 0.01
                elseif IsControlPressed(0, 175) then
                    endCoords.z = endCoords.z - 0.01
                end
            elseif selectedOption == 4 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    rotation.z = rotation.z - 0.5
                    if rotation.z < 0 then
                        rotation.z = 360
                    end
                elseif IsControlPressed(0, 175) then
                    rotation.z = rotation.z + 0.5
                    if rotation.z > 360 then
                        rotation.z = 0
                    end
                end
            elseif selectedOption == 5 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    rotation.x = rotation.x - 0.5
                    if rotation.x < 0 then
                        rotation.x = 360
                    end
                elseif IsControlPressed(0, 175) then
                    rotation.x = rotation.x + 0.5
                    if rotation.x > 360 then
                        rotation.x = 0
                    end
                end
            elseif selectedOption == 6 + positionOptionOffset then
                if IsControlPressed(0, 174) then
                    rotation.y = rotation.y - 0.5
                    if rotation.y < 0 then
                        rotation.y = 360
                    end
                elseif IsControlPressed(0, 175) then
                    rotation.y = rotation.y + 0.5
                    if rotation.y > 360 then
                        rotation.y = 0
                    end
                end
            end
            if model and not object then
                minZ = GetModelDimensions(model).z
                object = CreateLocalProp(model, endCoords.x, endCoords.y, endCoords.z, true, false, false)
                SetEntityCollision(object, false, false)
                SetEntityAsMissionEntity(object, true, true)
                FreezeEntityPosition(object, true)
            end
            SetEntityCoords(object, endCoords.x, endCoords.y, endCoords.z - minZ, false, false, false, false)
            SetEntityRotation(object, rotation.x, rotation.y, rotation.z, 2, true)
            if currentZone:contains(vector3(endCoords.x, endCoords.y, endCoords.z)) then
                color = {0, 255, 0}
            else
                color = {255, 0, 0}
            end
            DrawMarker(1, endCoords.x, endCoords.y, endCoords.z, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 1.0, color[1], color[2], color[3], 255, false, false, 2, false, false, false, false)
        end
        currentZone:remove()
        currentZone = nil
        if object then
            DeleteEntity(object)
        end
    end)
end

function Customize_PositionMenu()
    if not currentCustomize then return end
    local currentLocation = currentCustomize.currentLocation
    local model = currentLocation.model    
    local options = {}
    local title = _L("customize_location_position")
    local setting_position = true
    local endCoords = nil
    local rotation = currentLocation.rotation or vector3(0.0, 0.0, 0.0)
    local color = {255, 0, 0}
    options[#options + 1] = {label = _L("customize_location_position"), icon = "location-dot", values = { _L("customize_location_position_confirm") }, close = false }
    lib.registerMenu({
        id = 'pb_customize_locations_position',
        title = title,
        position = Config.MenuPosition,
        onClose = function()
            setting_position = false
            Customize_AddLocationMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected == 1 and color[1] ~= 255 then
            setting_position = false
            lib.hideMenu()
            SetTimeout(100, function()
                if not endCoords then
                    Customize_AddLocationMenu()
                else
                    currentLocation.coords = vector3(endCoords.x, endCoords.y, endCoords.z)
                    currentCustomize.currentLocation = currentLocation
                    Customize_PositionEditorMenu()
                end
            end)
            return
        end
    end)
    lib.showMenu('pb_customize_locations_position')
    CreateThread(function()
        local object = nil
        local minZ = 0
        local ticksLeft = 5
        if currentLocation.id then
            Customize_RefreshLocationProps({currentLocation.id})
        end
        local currentZone = lib.zones.poly({
            name = "business_zone",
            points = currentCustomize.bounds,
            thickness = 1000.0
        })
        local minZ = 0
        while setting_position do
            Wait(0)
            ticksLeft = ticksLeft - 1
            if ticksLeft == 0 or endCoords == nil then
                CreateThread(function()
                    local coords = GetRaycastCoords()
                    if coords then
                        endCoords = coords
                    end
                    ticksLeft = 5
                end)
            end
            if endCoords then
                if model and not object then
                    minZ = GetModelDimensions(model).z
                    object = CreateLocalProp(model, endCoords.x, endCoords.y, endCoords.z, true, false, false)
                    SetEntityRotation(object, rotation.x, rotation.y, rotation.z, 2)
                    SetEntityCollision(object, false, false)
                    SetEntityAsMissionEntity(object, true, true)
                    FreezeEntityPosition(object, true)
                end
                SetEntityCoords(object, endCoords.x, endCoords.y, endCoords.z - minZ, false, false, false, false)
                if currentZone:contains(vector3(endCoords.x, endCoords.y, endCoords.z)) then
                    color = {0, 255, 0}
                else
                    color = {255, 0, 0}
                end
                DrawMarker(1, endCoords.x, endCoords.y, endCoords.z, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 1.0, color[1], color[2], color[3], 255, false, false, 2, false, false, false, false)
            elseif object then
                DeleteEntity(object)
                object = nil
            end
        end
        currentZone:remove()
        currentZone = nil
        if object then
            DeleteEntity(object)
        end
    end)
end

function Customize_FurnitureMenu()
    if not currentCustomize then return end
    local currentLocation = currentCustomize.currentLocation
    if not currentLocation then 
        return Customize_OpenLocationsMenu()
    end
    if not currentLocation.coords then 
        ShowNotification(_L("customize_location_position_unset_desc"))
        return Customize_AddLocationMenu()
    end
    local options = {}
    local title = _L("customize_location_furniture")
    local furnitureCategories = Config.Furniture.categories
    local selectedModel = (currentLocation.model or nil)
    options[#options + 1] = {label = _L("customize_location_furniture_info"), icon = "circle-info", close = false}
    for i=1, #furnitureCategories do 
        local category = furnitureCategories[i]
        local categoryOptions = {}
        local modelIndex
        for j=1, #category.options do 
            if (currentLocation.model and category.options[j].model == currentLocation.model) then
                modelIndex = j
            end
            categoryOptions[#categoryOptions + 1] = category.options[j].label
        end
        options[#options + 1] = {label = category.label, icon = category.icon, defaultIndex = modelIndex or 1, values = categoryOptions}
    end
    options[#options + 1] = {label = _L("customize_location_furniture_clear"), icon = "trash"}
    local object = nil
    local selectModelOption = function(selected, scrollIndex)
        local category = furnitureCategories[selected - 1]
        local model = category.options[scrollIndex].model
        selectedModel = model
        if object then
            DeleteEntity(object)
        end
        if model then
            object = CreateLocalProp(model, currentLocation.coords.x, currentLocation.coords.y, currentLocation.coords.z, false, false, false)
            SetEntityRotation(object, currentLocation.rotation.x, currentLocation.rotation.y, currentLocation.rotation.z, 2, true)
            SetEntityCollision(object, false, false)
            SetEntityAsMissionEntity(object, true, true)
            FreezeEntityPosition(object, true)
        end
    end
    lib.registerMenu({
        id = 'pb_customize_locations_furniture',
        title = title,
        position = Config.MenuPosition,
        onSelected = function(selected, scrollIndex)
            if selected > 1 and selected < #options then
                selectModelOption(selected, scrollIndex)
            end
        end,
        onSideScroll = function(selected, scrollIndex, args)
            if selected > 1 and selected < #options then
                selectModelOption(selected, scrollIndex)
            end
        end,
        onClose = function()
            if object then
                DeleteEntity(object)
            end
            Customize_AddLocationMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected > 1 and selected < #options then
            if object then
                DeleteEntity(object)
            end
            if selectedModel then
                currentLocation.model = selectedModel
                currentCustomize.currentLocation = currentLocation
            end
            Customize_AddLocationMenu()
        elseif selected == #options then
            if object then
                DeleteEntity(object)
            end
            currentLocation.model = nil
            currentCustomize.currentLocation = currentLocation
            Customize_AddLocationMenu()
        end
    end)
    lib.showMenu('pb_customize_locations_furniture')
end

function Customize_AddLocationMenu()
    if not currentCustomize then return end
    local currentLocation = currentCustomize.currentLocation
    local showingLocationMenu = true
    local locationType = currentLocation.locationType
    local options = {}
    local title = _L("customize_location_add")
    local mC, mI, modelInfo = GetFurnitureModelInfo(currentLocation.model)
    options[#options + 1] = {label = _L("customize_location_position"), icon = "location-dot", values = { (currentLocation.coords and _L("customize_location_position_value", round(currentLocation.coords.x, 2), round(currentLocation.coords.y, 2), round(currentLocation.coords.z, 2)) or _L("customize_location_position_unset")) }}
    options[#options + 1] = {label = _L("customize_location_furniture"), icon = "box", values = { modelInfo and modelInfo.label or _L("customize_location_furniture_none") }}
    if locationType == "furniture" then
        title = _L("customize_location_add_furniture")
    elseif locationType == "management" then
        title = _L("customize_location_add_management")
    elseif locationType == "storage" then
        title = _L("customize_location_add_storage")
        local businessRanks = {}
        local currentRank = (currentLocation.rank == nil and 1 or currentLocation.rank)
        currentLocation.rank = currentRank
        if not currentCustomize.businessId then
            businessRanks = { currentRank }
        else
            businessRanks = Customize_GetBusinessRanks(currentCustomize.businessId, true)
            if currentLocation.rank > #businessRanks then
                currentRank = #businessRanks
                currentLocation.rank = currentRank
            end
        end
        options[#options + 1] = {label = _L("customize_location_add_storage_rank"), description = _L("customize_location_add_storage_rank_desc"), icon = "user-tie", defaultIndex = currentRank, values = businessRanks, close = false}
    elseif locationType == "crafting" then
        title = _L("customize_location_add_crafting")
        local craftingTypes = GetCraftingTypes(currentCustomize.zone, true)
        if #craftingTypes <= 0 then
            showingLocationMenu = false
            Customize_OpenLocationsMenu()
            ShowNotification(_L("customize_location_no_crafting_types"))
            return
        end
        currentLocation.craftingType = currentLocation.craftingType or GetCraftingTypeByIndex(currentCustomize.zone, 1)
        options[#options + 1] = {label = _L("customize_location_add_crafting_type"), description = _L("customize_location_add_crafting_type_desc"), icon = "hammer", defaultIndex = GetCraftingIndexByType(currentCustomize.zone, currentLocation.craftingType), values = craftingTypes, close = false}
    elseif locationType == "billing" then
        title = _L("customize_location_add_billing")
    elseif locationType == "market" then
        title = _L("customize_location_add_market")
    end
    if currentLocation.id then
        options[#options + 1] = {label = _L("customize_location_delete"), icon = "trash"}
    end
    options[#options + 1] = {label = _L("customize_location_save"), icon = "save"}
    lib.registerMenu({
        id = 'pb_customize_locations_add',
        title = title,
        position = Config.MenuPosition,
        onSideScroll = function(selected, scrollIndex, args)
            if locationType == "storage" then
                if selected == 3 then
                    currentLocation.rank = scrollIndex
                end
            elseif locationType == "crafting" then
                if selected == 3 then
                    currentLocation.craftingType = GetCraftingTypeByIndex(currentCustomize.zone, scrollIndex)
                end
            end
        end,
        onClose = function()
            showingLocationMenu = false
            Customize_OpenLocationsMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected == 1 then
            if currentLocation.coords then
                showingLocationMenu = false
                Customize_PositionEditorMenu()
            else
                showingLocationMenu = false
                Customize_PositionMenu()
            end
        elseif selected == 2 then
            showingLocationMenu = false
            Customize_FurnitureMenu()
        elseif currentLocation.id and selected == #options - 1 then
            if currentCustomize.businessId then 
                if currentLocation.id then
                    lib.callback("pickle_businesses:customize:deleteLocation", "", function(result)
                        if not result then
                            ShowNotification(_L("customize_location_save_error"))
                        else
                            currentCustomize.locations = result.locations
                        end
                        SetTimeout(100, function()
                            Customize_OpenLocationsMenu()
                        end)
                    end, currentCustomize.businessId, currentLocation.id)
                end
            else
                if currentLocation.id then
                    local index = Customize_GetLocationIndexById(currentLocation.id)
                    table.remove(currentCustomize.locations, index)
                end
                SetTimeout(100, function()
                    Customize_OpenLocationsMenu()
                end)
            end
            showingLocationMenu = false
            currentCustomize.currentLocation = nil
        elseif selected == #options then
            if not currentLocation.coords then
                ShowNotification(_L("customize_location_position_unset_desc"))
                return
            end
            showingLocationMenu = false
            local locationData = {
                type = locationType,
                coords = currentLocation.coords,
                rotation = currentLocation.rotation,
                model = currentLocation.model
            }
            if locationType == "storage" then
                locationData.rank = currentLocation.rank
            elseif locationType == "crafting" then
                locationData.craftingType = currentLocation.craftingType
            end 
            if currentCustomize.businessId then
                if currentLocation.id then
                    locationData.id = currentLocation.id
                end
                currentCustomize.currentLocation = nil
                lib.hideMenu()
                lib.callback("pickle_businesses:customize:updateLocation", "", function(result)
                    if not result then
                        ShowNotification(_L("customize_location_save_error"))
                    else
                        currentCustomize.locations = result.locations
                    end
                    SetTimeout(100, function()
                        Customize_OpenLocationsMenu()
                    end)
                end, currentCustomize.businessId, locationData)
            else
                if currentLocation.id then
                    local index = Customize_GetLocationIndexById(currentLocation.id)
                    locationData.id = currentLocation.id
                    currentCustomize.locations[index] = locationData
                else
                    local newIndex = 1
                    for i=1, #currentCustomize.locations do 
                        if currentCustomize.locations[i].id >= newIndex then
                            newIndex = currentCustomize.locations[i].id + 1
                        end
                    end
                    locationData.id = newIndex
                    currentCustomize.locations[#currentCustomize.locations + 1] = locationData
                end
                currentCustomize.locations = currentCustomize.locations
                currentCustomize.currentLocation = nil
                lib.hideMenu() 
                SetTimeout(100, function()
                    Customize_OpenLocationsMenu()
                end)
            end
        end
    end)
    CreateThread(function()
        local currentModel = nil
        local object = nil
        if currentLocation.id then
            Customize_RefreshLocationProps({currentLocation.id})
        end
        while showingLocationMenu do 
            if currentModel ~= currentLocation.model and currentLocation.coords then
                currentModel = currentLocation.model
                if object then
                    DeleteEntity(object)
                end
                if currentModel then
                    object = CreateLocalProp(currentModel, currentLocation.coords.x, currentLocation.coords.y, currentLocation.coords.z, false, false, false)
                    if currentLocation.rotation then
                        SetEntityRotation(object, currentLocation.rotation.x, currentLocation.rotation.y, currentLocation.rotation.z, 2, true)
                    end
                    SetEntityCollision(object, false, false)
                    SetEntityAsMissionEntity(object, true, true)
                    FreezeEntityPosition(object, true)
                end
            end
            Wait(100)
        end
        if object then
            DeleteEntity(object)
        end
    end)
    lib.showMenu('pb_customize_locations_add')
end

function Customize_OpenLocationsMenu()
    if not currentCustomize then return end
    if currentCustomize.currentLocation then currentCustomize.currentLocation = nil end
    local zoneId = currentCustomize.zone
    currentCustomize.locations = currentCustomize.locations or {}
    local options = {}
    options[#options + 1] =  {label = _L("customize_location_add"), icon = "plus", values = {
        _L("customize_type_furniture"),
        _L("customize_type_management"),
        _L("customize_type_storage"),
        _L("customize_type_crafting"),
        _L("customize_type_billing"),
        _L("customize_type_market"),
    }}
    local locationCategories = {
        ["furniture"] = {label = _L("customize_type_furniture"), icon = CustomizeIcons["furniture"], values = {}, indexes = {}},
        ["management"] = {label = _L("customize_type_management"), icon = CustomizeIcons["management"], values = {}, indexes = {}},
        ["storage"] = {label = _L("customize_type_storage"), icon = CustomizeIcons["storage"], values = {}, indexes = {}},
        ["crafting"] = {label = _L("customize_type_crafting"), icon = CustomizeIcons["crafting"], values = {}, indexes = {}},
        ["billing"] = {label = _L("customize_type_billing"), icon = CustomizeIcons["billing"], values = {}, indexes = {}},
        ["market"] = {label = _L("customize_type_market"), icon = CustomizeIcons["market"], values = {}, indexes = {}},
    }
    for i=1, #currentCustomize.locations do 
        local id = #locationCategories[currentCustomize.locations[i].type].values + 1
        locationCategories[currentCustomize.locations[i].type].values[id] = "Location ".. " #" .. id  
        locationCategories[currentCustomize.locations[i].type].indexes[id] = i
    end

    for k,v in pairs(locationCategories) do 
        if #v.values <= 0 then
            locationCategories[k].values = { _L("customize_location_none") }
            locationCategories[k].close = false
        end
    end

    options[#options+1] = locationCategories["furniture"]
    options[#options+1] = locationCategories["management"]
    options[#options+1] = locationCategories["storage"]
    options[#options+1] = locationCategories["crafting"]
    options[#options+1] = locationCategories["billing"]
    options[#options+1] = locationCategories["market"]
    
    local selectedLocationType
    local selectedLocationIndex
    local selectedLocationIndexes = { [2] = "furniture", [3] = "management", [4] = "storage", [5] = "crafting", [6] = "billing", [7] = "market" }
    local customizingLocations = true

    local function onSubSelect(selected, scrollIndex)
        if selectedLocationIndexes[selected] then
            selectedLocationType = selectedLocationIndexes[selected]
            selectedLocationIndex = locationCategories[selectedLocationType].indexes[scrollIndex]   
        else
            selectedLocationType = nil
            selectedLocationIndex = nil
        end
    end

    lib.registerMenu({
        id = 'pb_customize_locations',
        title = _L("customize_location_label"),
        position = Config.MenuPosition,
        onSideScroll = function(selected, scrollIndex, args)
            onSubSelect(selected, scrollIndex)
        end,
        onSelected = function(selected, scrollIndex, args)
            onSubSelect(selected, scrollIndex)
        end,
        onClose = function()
            customizingLocations = false
            Customize_OpenBusinessMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected == 1 then
            local locationType = selectedLocationIndexes[scrollIndex+1]
            if not locationType then return end
            currentCustomize.currentLocation = {}
            currentCustomize.currentLocation.locationType = locationType
            
            if locationType == "furniture" then
            elseif locationType == "management" then
            elseif locationType == "storage" then
                currentCustomize.currentLocation.rankLevel = nil
            elseif locationType == "crafting" then
                currentCustomize.currentLocation.craftingType = nil
            elseif locationType == "billing" then
            elseif locationType == "market" then
            end
            if not currentCustomize.currentLocation.locationType then return end
            customizingLocations = false
            Customize_AddLocationMenu()
        elseif selectedLocationIndexes[selected] then
            currentCustomize.currentLocation = {}
            local locationType = selectedLocationIndexes[selected]
            local id = locationCategories[locationType].indexes[scrollIndex]
            if not currentCustomize.locations[id] then return end
            currentCustomize.currentLocation.locationType = locationType
            currentCustomize.currentLocation.id = currentCustomize.locations[id].id
            for k,v in pairs(currentCustomize.locations[id]) do
                if k ~= "type" then
                    currentCustomize.currentLocation[k] = v
                end
            end
            customizingLocations = false
            Customize_AddLocationMenu()
        end
    end)
    lib.showMenu('pb_customize_locations')
    CreateThread(function()
        Customize_RefreshLocationProps()
        while customizingLocations do
            if selectedLocationType and selectedLocationIndex then
                local location = currentCustomize.locations[selectedLocationIndex]
                if location and location.coords then
                    DrawDestination(location.coords + vector3(0.0, 0.0, 1.0), "Selected Location", round(#(GetEntityCoords(PlayerPedId()) - location.coords), 2))
                    DrawMarker(1, location.coords.x, location.coords.y, location.coords.z, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 1.0, 0, 255, 0, 255, false, false, 2, false, false, false, false)
                end
            end
            Wait(0)
        end
    end)
end

function Customize_RefreshLocationProps(excludeArray)
    local excludeArray = excludeArray or {}
    Customize_ClearLocationProps()
    currentCustomize.locationProps = {}
    for i=1, #currentCustomize.locations do 
        local location = currentCustomize.locations[i]
        local check = true
        for j=1, #excludeArray do 
            if location.id == excludeArray[j] then
                check = false
                break
            end
        end
        if check and location.model then
            local modelIndex = GetFurnitureModelInfo(location.model)
            if modelIndex then
                local rotation = location.rotation or vector3(0.0, 0.0, 0.0)
                currentCustomize.locationProps[#currentCustomize.locationProps + 1] = CreateLocalProp(location.model, location.coords.x, location.coords.y, location.coords.z, false, false, false)
                SetEntityRotation(currentCustomize.locationProps[#currentCustomize.locationProps], rotation.x, rotation.y, rotation.z, 2, true)
                SetEntityCollision(currentCustomize.locationProps[#currentCustomize.locationProps], false, false)
                SetEntityAsMissionEntity(currentCustomize.locationProps[#currentCustomize.locationProps], true, true)
                FreezeEntityPosition(currentCustomize.locationProps[#currentCustomize.locationProps], true)
            end
        end
    end
end

function Customize_ClearLocationProps()
    if currentCustomize.locationProps then
        for i=1, #currentCustomize.locationProps do 
            DeleteEntity(currentCustomize.locationProps[i])
        end
        currentCustomize.locationProps = {}
    end
end

function Customize_UpdateBusinessLocation()
    if not currentCustomize then return end
    local currentZone = nil
    local bounds = currentCustomize.bounds and json.decode(json.encode(currentCustomize.bounds)) or {}
    local title = _L("customize_location_position_editor")
    local options = {}
    local setting_position = true
    local selectedOption = 0
    local zCoords = #bounds <= 0 and GetEntityCoords(PlayerPedId()).z or bounds[1].z
    options[#options + 1] = {label = _L("customize_business_boundary_add"), icon = "location-dot", close = false}
    options[#options + 1] = {label = _L("customize_business_boundary_remove"), icon = "location-dot", close = false}
    options[#options + 1] = {label = _L("customize_business_boundary_save"), icon = "save"}

    local createZone = function()
        if currentZone then
            currentZone:remove()
            currentZone = nil
        end
        if #bounds <= 0 then return end
        currentZone = lib.zones.poly({
            name = "business_zone",
            points = bounds,
            thickness = 1000.0,
            debug = true
        })
    end
    createZone()
    lib.registerMenu({
        id = 'customize_business_location',
        title = title,
        position = Config.MenuPosition,
        onSelected = function(selected)
            selectedOption = selected
        end,
        onClose = function()
            setting_position = false
            if currentZone then
                currentZone:remove()
                currentZone = nil
            end
            Customize_OpenBusinessMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if selected == 1 and endCoords then
            bounds[#bounds + 1] = vector3(endCoords.x, endCoords.y, zCoords)
            createZone()
        elseif selected == 2 then
            table.remove(bounds, #bounds)
            createZone()
        elseif selected == #options then
            setting_position = false
            if #bounds < 3 then
                currentCustomize.bounds = nil
            else
                currentCustomize.bounds = bounds
            end
            
            if currentZone then
                currentZone:remove()
                currentZone = nil
            end
            SetTimeout(100, function()
                Customize_OpenBusinessMenu()
            end)
            return
        end
    end)
    CreateThread(function()
        local ticksLeft = 5
        while setting_position do
            Wait(0)
            ticksLeft = ticksLeft - 1
            if ticksLeft == 0 or endCoords == nil then
                CreateThread(function()
                    local coords = GetRaycastCoords()
                    if coords and #(coords - GetEntityCoords(PlayerPedId())) < 30.0 then
                        endCoords = coords
                    end
                    ticksLeft = 5
                end)
            end
            if endCoords then
                DrawMarker(1, endCoords.x, endCoords.y, endCoords.z, 0, 0, 0, 0, 0, 0, 0.025, 0.025, 20.0, 255, 0, 0, 255, false, false, 2, false, false, false, false)
            end
        end
    end)
    lib.showMenu("customize_business_location")
end

function Customize_UpdatePricePrompt(priceType)
    if not currentCustomize then return end
    local price = priceType == "purchase" and currentCustomize.price or currentCustomize.rent
    local input = lib.inputDialog(_L("set_price_" .. priceType), {_L("market_price")}) 
    if input and input[1] and tonumber(input[1]) then
        local newPrice = tonumber(input[1])
        if newPrice <= 0 then
            newPrice = nil
        end
        if priceType == "purchase" then
            currentCustomize.price = newPrice
        else
            currentCustomize.rent = newPrice
        end
    end
    return Customize_OpenBusinessMenu()
end

function SelectNearbyPlayerMenu(label, subtitle, targetId, cb)
    lib.callback("pickle_businesses:getNearbyPlayers", "", function(nearbyPlayers)
        local nearbyPlayerOptions = {}
        local idKeys = {}
        for i=1, #nearbyPlayers do
            nearbyPlayerOptions[#nearbyPlayerOptions + 1] = {label = nearbyPlayers[i].name, value = nearbyPlayers[i].id}
            idKeys[nearbyPlayers[i].id] = #nearbyPlayerOptions
        end
        if #nearbyPlayerOptions <= 0 then
            ShowNotification(_L("no_nearby_players"))
            return cb(nil)
        end
        local input = lib.inputDialog(label, {
            {type = 'select', label = subtitle, options = nearbyPlayerOptions, required = true, default = targetId or nearbyPlayers[1].id},
        })
        if input and input[1] and tonumber(input[1]) and tonumber(input[1]) > 0 then
            cb({
                id = tonumber(input[1]),
                name = nearbyPlayers[idKeys[tonumber(input[1])]].name
            })
        else
            cb(nil)
        end
    end)
end

function Customize_OpenTransferMenu()
    if not currentCustomize or not currentCustomize.businessId then return Customize_OpenBusinessMenu() end
    local business = Businesses[currentCustomize.businessId]
    if not business or business.renting then return Customize_OpenBusinessMenu() end
    local options = {}
    local title = _L("customize_transfer_ownership")
    local sellPrice = math.ceil(Config.BusinessSettings.sellScale * business.price)
    options[#options + 1] = {pbOptionType = "transfer", label = _L("customize_transfer_transfer"), icon = "paper-plane" }
    options[#options + 1] = {pbOptionType = "sell", label = _L("customize_transfer_sell", NumberWithCommas(sellPrice)), icon = "file-invoice-dollar" }
    lib.registerMenu({
        id = 'pb_customize_transfer',
        title = title,
        position = Config.MenuPosition,
        onClose = function()
            Customize_OpenBusinessMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if options[selected].pbOptionType == "transfer" then
            SelectNearbyPlayerMenu(_L("customize_transfer_transfer"), _L("customize_transfer_target"), targetId, function(target)
                if not target or not Customize_GenericConfirm(_L("customize_transfer_transfer_confirm", target.name)) then 
                    return Customize_OpenTransferMenu()
                end
                TriggerServerEvent("pickle_businesses:transferBusiness", currentCustomize.businessId, target.id)
                Customize_CloseBusinessMenu()
            end)
        elseif options[selected].pbOptionType == "sell" then
            if not Customize_GenericConfirm(_L("customize_transfer_sell_confirm", NumberWithCommas(sellPrice))) then
                return SetTimeout(100, function()
                    Customize_OpenTransferMenu()
                end)
            end
            TriggerServerEvent("pickle_businesses:sellBusiness", currentCustomize.businessId)
            Customize_CloseBusinessMenu()
        end
    end)
    lib.showMenu('pb_customize_transfer')
end

function Customize_GenericConfirm(label)
    local result = lib.alertDialog({
        header = label,
        centered = true,
        cancel = true
    })
    return (result == "confirm")
end

function Customize_CloseBusinessMenu()
    lib.hideMenu()
    if currentCustomize.cb then
        currentCustomize.cb()
    end
    Customize_ClearLocationProps()
    currentCustomize = nil
end

function Customize_OpenBusinessMenu(data, cb)
    if data then
        if currentCustomize then
            currentCustomize = nil
            SetTimeout(1000, function()
                Customize_OpenBusinessMenu(data)
            end)
            return
        end
        currentCustomize = data
    end
    if not currentCustomize then return end
    if cb then
        currentCustomize.cb = cb
    end
    local currentZone
    currentCustomize.locations = currentCustomize.locations or {}
    local options = {}
    -- options[#options + 1] = {label = "Restart Position Setup", icon = "location-dot", close = false}
    -- options[#options + 1] = {label = "Position (X-axis)", icon = "location-dot", values = { _L("arrow_adjust"), }, close = false }

    if currentCustomize.owner then
        local business = Businesses[currentCustomize.businessId]
        currentCustomize.label = currentCustomize.label or _L("customize_name_none")
        options[#options + 1] = {pbOptionType = "name", label = _L("customize_name"), icon = "user-tie", values = { currentCustomize.label }, close = false }
        if business.renting then
            options[#options + 1] = {pbOptionType = "end_lease", label = _L("end_lease"), icon = "cancel" }
        else
            options[#options + 1] = {pbOptionType = "transfer", label = _L("customize_transfer_ownership"), icon = "user-tie" }
        end
    else
        currentCustomize.price = currentCustomize.price or nil
        currentCustomize.rent = currentCustomize.rent or nil
        options[#options + 1] = {pbOptionType = "purchase", label = _L("customize_purchase"), icon = "dollar", values = { (currentCustomize.price and _L("money_number", currentCustomize.price) or _L("set_price")) } }
        options[#options + 1] = {pbOptionType = "rent", label = _L("customize_rent"), icon = "dollar", values = { (currentCustomize.rent and _L("money_number", currentCustomize.rent) or _L("set_price")) } }
    end
    

    if currentCustomize.admin then
        local businessZones = GetBusinessZones(true)
        currentCustomize.zone = currentCustomize.zone or (Config.BusinessZones[1] and Config.BusinessZones[1].name or nil)
        if currentCustomize.zone == nil then
            print("^1ERROR INCOMING, NEED TO ADD ZONES IN THE CONFIG!^0")
        end
        local businessZoneIndex = GetBusinessZoneIndexByName(currentCustomize.zone)
        options[#options + 1] = {pbOptionType = "zone", label = _L("customize_zone"), icon = "hammer", values = businessZones, defaultIndex = businessZoneIndex, close = false }
        options[#options + 1] = {pbOptionType = "bounds", label = _L("customize_bounds"), icon = "location-dot", values = { (currentCustomize.bounds and _L("customize_bounds_edit") or _L("customize_bounds_unset")) }}
    end
    if currentCustomize.bounds then
        options[#options + 1] = {pbOptionType = "locations", label = _L("customize_location_label"), icon = "location-dot"} 
    end

    if currentCustomize.admin then
        if currentCustomize.businessId then
            options[#options + 1] = {pbOptionType = "delete", label = _L("customize_delete"), icon = "trash" }
        end
        options[#options + 1] = {pbOptionType = "create", label = currentCustomize.businessId and _L("customize_save") or _L("customize_create"), icon = "save", close = false}
    end

    lib.registerMenu({
        id = 'pb_customize_menu',
        title = _L("customize_business_label"),
        position = Config.MenuPosition,
        onSideScroll = function(selected, scrollIndex, args)
            if options[selected].pbOptionType == "zone" then
                local businessZones = GetBusinessZones()
                local zoneData = businessZones[scrollIndex]
                currentCustomize.zone = zoneData.name
                local newLocations = {}
                for i=1, #currentCustomize.locations do 
                    local remove = false
                    if currentCustomize.locations[i].type == "crafting" then
                        if #zoneData.craftingTypes <= 0 then
                            remove = true
                        else
                            currentCustomize.locations[i].craftingType = GetCraftingTypeByIndex(currentCustomize.zone, 1)
                            remove = false
                        end
                    end
                    if not remove then
                        newLocations[#newLocations + 1] = currentCustomize.locations[i]
                    end
                end
                currentCustomize.locations = newLocations
            end
        end,
        onSelected = function(selected, scrollIndex, args)
            if currentCustomize.bounds and #currentCustomize.bounds > 0 then
                if options[selected].pbOptionType == "bounds" then
                    if currentZone then
                        currentZone:remove()
                        currentZone = nil
                    end
                    currentZone = lib.zones.poly({
                        name = "business_zone",
                        points = currentCustomize.bounds,
                        thickness = 1000.0,
                        debug = true
                    })
                elseif currentZone then
                    currentZone:remove()
                    currentZone = nil
                end
            end
        end,
        onClose = function()
            if currentZone then
                currentZone:remove()
                currentZone = nil
            end
            Customize_CloseBusinessMenu()
        end,
        options = options
    }, function(selected, scrollIndex, args)
        if currentZone then
            currentZone:remove()
            currentZone = nil
        end
        if options[selected].pbOptionType == "purchase" or options[selected].pbOptionType == "rent" then
            Customize_UpdatePricePrompt(options[selected].pbOptionType)
        elseif options[selected].pbOptionType == "bounds" then
            Customize_UpdateBusinessLocation()
        elseif options[selected].pbOptionType == "locations" then
            SetTimeout(100, function()
                Customize_OpenLocationsMenu()
            end)
        elseif options[selected].pbOptionType == "transfer" then
            lib.hideMenu()
            SetTimeout(100, function()
                Customize_OpenTransferMenu()
            end)
        elseif options[selected].pbOptionType == "end_lease" then
            lib.hideMenu()
            if Customize_GenericConfirm(_L("end_lease_confirm")) then
                TriggerServerEvent("pickle_businesses:endLease", currentCustomize.businessId)
                Customize_CloseBusinessMenu()
            else
                SetTimeout(100, function()
                    Customize_OpenBusinessMenu()
                end)
            end
        elseif options[selected].pbOptionType == "delete" then
            lib.hideMenu()
            if Customize_GenericConfirm(_L("customize_delete_confirm")) then
                TriggerServerEvent("pickle_businesses:removeBusiness", currentCustomize.businessId)
                Customize_CloseBusinessMenu()
            else
                SetTimeout(100, function()
                    Customize_OpenBusinessMenu()
                end)
            end
        elseif options[selected].pbOptionType == "create" then
            if not currentCustomize.businessId then
                if not currentCustomize.price and not currentCustomize.rent then
                    ShowNotification(_L("customize_sale_none"))
                    return
                elseif not currentCustomize.zone then
                    ShowNotification(_L("customize_zone_none"))
                    return
                elseif not currentCustomize.bounds or #currentCustomize.bounds < 3 then
                    ShowNotification(_L("customize_bounds_none"))
                    return
                elseif not currentCustomize.locations or #currentCustomize.locations <= 0 then
                    ShowNotification(_L("customize_locations_none_set"))
                    return
                else
                    local manageFound = false
                    for i=1, #currentCustomize.locations do 
                        if currentCustomize.locations[i].type == "management" then
                            manageFound = true
                        end
                    end
                    if not manageFound then
                        ShowNotification(_L("customize_locations_none_set"))
                        return
                    end
                    lib.callback("pickle_businesses:customize:createBusiness", "", function(result)
                    end, currentCustomize)
                    Customize_CloseBusinessMenu()
                end
            else
                if not currentCustomize.bounds or #currentCustomize.bounds < 3 then
                    ShowNotification(_L("customize_bounds_none"))
                    return
                elseif not currentCustomize.zone then
                    ShowNotification(_L("customize_zone_none"))
                    return
                else
                    lib.callback("pickle_businesses:customize:updateBusiness", "", function(result)
                    end, currentCustomize.businessId, {
                        bounds = currentCustomize.bounds,
                        zone = currentCustomize.zone,
                    })
                    Customize_CloseBusinessMenu()
                end

            end
        end
    end)
    lib.showMenu('pb_customize_menu')
    
    Customize_RefreshLocationProps()
    -- CREATE ONLY
 
    -- Purchase Price @
    -- Create Business @

    -- BUSINESS OWNER / ADMIN ONLY

    -- Business Name @
    -- Transfer Ownership @

    -- SHARED

    -- Zone Type @
    -- Locations @
end

function DrawDestination(coords, label, meters)
    local onScreen, screenX, screenY = GetScreenCoordFromWorldCoord(coords.x, coords.y, coords.z)
    local icon_scale = 1.0
    local text_scale = 0.25
    -- Icon
    RequestStreamedTextureDict("basejumping", false)
    DrawSprite("basejumping", "arrow_pointer", screenX, screenY - 0.015, 0.015 * icon_scale, 0.025 * icon_scale, 180.0, 255, 255, 0, 255)
    -- Text
    SetTextCentre(true)
    SetTextScale(0.0, text_scale)
    SetTextEntry("STRING")
    AddTextComponentString(label .. "\n".. meters .. "m")
    DrawText(screenX, screenY)
end

RegisterNetEvent("pickle_businesses:customize:createBusiness", function()
    Customize_OpenBusinessMenu({
        admin = true,
        price = 0,
        rent = 0
    })
end)

AddEventHandler("onResourceStop", function(resource)
    lib.closeInputDialog()
    lib.hideMenu()
    if resource == GetCurrentResourceName() then
        DeleteLocalProps()
    end
end)

CreateThread(function()
    Wait(1000)

    -- local businessData = {
    --     admin = true,
    --     price = 10000,
    --     rent = 1000,
    --     zone = "clothing_store",
    --     bounds = {
    --         vector3(19.5395, -1351.7069, 29.21),
    --         vector3(19.6871, -1311.6008, 29.21),
    --         vector3(39.4974, -1313.2360, 29.21),
    --         vector3(38.3451, -1350.7587, 29.21)
    --     },
    --     locations = {
    --         {
    --             id = 50,
    --             type = "management",
    --             coords = vector3(31.8010, -1343.3639, 28.4970),
    --             rotation = vector3(0, 0, 12.1783),
    --             model = `prop_off_chair_01`
    --         },
    --         {
    --             id = 49,
    --             type = "management",
    --             coords = vector3(30.0477, -1343.3972, 28.4970),
    --             rotation = vector3(0, 0, 97.5846),
    --             model = `prop_off_chair_01`
    --         },
    --     }
    -- }

    -- currentCustomize = businessData
    -- currentCustomize.currentLocation = {
    --     locationType = "management",
    --     coords = vector3(26.5025, -1344.9376, 28.4970),
    --     rotation = vector3(0, 0, 272.9230),
    --     model = `prop_off_chair_01`
    -- }
    -- Customize_OpenBusinessMenu(businessData)
end)