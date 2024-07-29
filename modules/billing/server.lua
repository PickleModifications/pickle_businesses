ActiveBills = {}

function GenerateBillingId()
    local id = math.random(1, 999999)
    repeat
        id = math.random(1, 999999)
    until not ActiveBills[id]
    return id
end

RegisterNetEvent("pickle_businesses:payBill", function(billId, method)
    local source = source
    local bill = ActiveBills[billId]
    if not bill then return end
    local businessId = bill.businessId
    local business = Businesses[businessId]
    if not business then return end
    if method ~= "cash" and method ~= "card" then return end
    local target = bill.target
    local charges = bill.charges
    local total = 0
    for i = 1, #charges do
        total = total + charges[i].price
    end
    if total < 0 then return end
    local cash = GetPaymentMethodAmount(source, method)
    if cash < total then
        return ShowNotification(source, _L("billing_insufficient_funds", NumberWithCommas(total - cash)))
    end
    ChargePaymentMethod(source, method, total)
    AddStoreFunds(businessId, method, total)
    ShowNotification(source, _L("billing_success_target", NumberWithCommas(total)))
    ActiveBills[billId] = nil
end)

RegisterNetEvent("pickle_businesses:sendBill", function(businessId, target, charges)
    local nearby = IsPlayerNearby(source, target)
    if not nearby then return end
    local business = Businesses[businessId]
    if not business then return end
    if not charges or #charges == 0 then return end
    local billId = GenerateBillingId()
    ActiveBills[billId] = {
        businessId = businessId,
        target = target,
        charges = charges,
    }
    TriggerClientEvent("pickle_businesses:sendBill", target, businessId, billId, charges)
end)