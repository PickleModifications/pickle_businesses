function NumberWithCommas(x)
    return _L("money_number", tostring(x):reverse():gsub("(%d%d%d)", "%1,"):gsub(",(%-?)$", "%1"):reverse())
end

function GetBusinessLocation(businessId, locationId)
    local business = Businesses[businessId]
    if not business then return end
    for i=1, #business.game_info.locations do
        if business.game_info.locations[i].id == locationId then
            return i, business.game_info.locations[i]
        end
    end
end