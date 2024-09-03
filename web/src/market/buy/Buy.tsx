import { AspectRatio, Box, Button, Container, Group, NumberInput, rem, ScrollArea, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { GetPriceString, Item, Translate } from "../../App";
import { IconEdit, IconPlus, IconSearch, IconShoppingCartPlus, IconTrash, IconX } from "@tabler/icons-react";
import { HasPermission, GetMaxCount, GetMarketData } from "../Market";
import classes from "./Buy.module.css";
import { Modal } from "../modal/Modal";
import { useDisclosure } from "@mantine/hooks";

function BuyEditModal({listing, opened, close} : {listing: Item, opened: boolean, close: () => void}) {
    if (!listing.sku) return null;
    let maxCount = (GetMaxCount(listing)?.count || 0) + (listing.count || 0);
    const [price, setPrice] = useState<number>(listing.price || 0);
    const [count, setCount] = useState<number>(listing.count || 0);
    const closeWrapper = () => {
        close();
        setTimeout(() => {
            setPrice(listing.price || 0);
            setCount(listing.count || 0);
        }, 200);
    }
    return (
        <Modal title={Translate("market_buy_edit_title", listing.name, listing.sku)} opened={opened} close={closeWrapper}>
            <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                <ItemDisplay style={{width: 100}} listing={{
                    sku: listing.sku,
                    name: listing.name,
                    price: listing.price,
                    count: listing.count,
                    metadata: listing.metadata,
                    listingType: "market-view" 
                }}/>
                <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <Group grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={0} allowDecimal={false} label={Translate("market_buy_edit_price") + ":"} size="xs" value={price} onChange={(value) => { setPrice(Number(value)) }} />
                    </Group>
                    <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={1} max={maxCount} allowDecimal={false} label={Translate("market_buy_edit_count") + ":"} size="xs" value={count} onChange={(value) => { setCount(Number(value)) }} />
                    </Group>
                </Group>
            </Group>
            <Text fz={"xs"}>{Translate("market_buy_item_note")}</Text>
            <Text fz={"xs"}>{Translate("market_buy_item_note2")}</Text>
            <Button style={{width: "100%", marginTop: 10}} onClick={closeWrapper}>{Translate("market_buy_edit_save")}</Button>
        </Modal>
    );
}

function BuyDeleteModal({listing, opened, close} : {listing: Item, opened: boolean, close: () => void}) {
    if (!listing.sku) return null;
    return (
        <Modal title={Translate("market_buy_delete_title", listing.name, listing.sku)} opened={opened} close={close}>
            <Text pt={10} pb={10} fz={"sm"}>{Translate("market_buy_delete_desc")}</Text>
            <Button color={"red"} style={{width: "100%", marginTop: 10}} onClick={close}>{Translate("market_buy_delete_confirm")}</Button>
        </Modal>
    );
}

function ItemDisplayInfo({listing, openEdit, openDelete, imageSize} : {listing: Item, openEdit?: () => void, openDelete?: () => void, imageSize?: string}) {
    return (
        <Group h={"100%"} style={{
            userSelect: "none",
            flexDirection: "row", 
            alignContent:"space-between", 
            backgroundImage: 'url("/item_placeholder.png")',
            backgroundSize: (imageSize || "65%"),
            backgroundPositionX: "center",
            backgroundPositionY: "25%",
            backgroundRepeat: "no-repeat",
            justifyContent: "",
        }}>
            <Group gap={0} pl={5} mt={2}>
                { listing.price && <Text style={{textAlign: "left"}} fz={"xs"}>{GetPriceString(listing.price)}</Text> }
            </Group>
            <Group w={"100%"} gap={0} style={{justifyContent: "flex-end"}}> 
                <Group pl={5} pb={2} pr={5} grow w={"100%"} gap={0} style={{flexWrap:"nowrap", justifyContent: "space-between"}}>
                    { (listing.listingType == "market" && HasPermission("items")) ? <Group gap={0}>
                        <IconEdit onClick={openEdit} style={{cursor: "pointer"}} size={15} color={"white"} />
                        <IconTrash onClick={openDelete} style={{cursor: "pointer"}} size={15} color={"white"} />
                    </Group> : null }
                    <Text fz={"xs"} style={{textAlign: "right"}}>x{listing.count}</Text>
                </Group>
                <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                    <Text pl={4} pr={4} fz={"xs"} style={{ textOverflow: "ellipsis", textWrap:"nowrap", overflow: "hidden", textAlign: "center"}}>{listing.name}</Text>
                </Group>
            </Group>
        </Group>
    );
}

export function ItemDisplay({onClick, listing, style, imageSize} : {onClick?: () => void, listing: Item, style?: any, imageSize?: string}) {
    if (listing.listingType == "market") { 
        if (!HasPermission("items")) {
            return (
                <Box onClick={onClick} pos={"relative"} className={classes["purchase-listing"]}>
                    <Group gap={0} className={classes["cart"]} style={{zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center"}}>
                        <IconShoppingCartPlus size={30} color={"white"} />
                    </Group>
                    <AspectRatio className={classes["item"]} ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                        <ItemDisplayInfo imageSize={imageSize} listing={listing} />
                    </AspectRatio>
                </Box>
            );
        } else {
            const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
            const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
            return (
                <Box onClick={onClick} pos={"relative"}>
                    <BuyEditModal listing={listing} opened={editOpened} close={closeEdit}/>
                    <BuyDeleteModal listing={listing} opened={deleteOpened} close={closeDelete}/>
                    <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                        <ItemDisplayInfo imageSize={imageSize} openEdit={openEdit} openDelete={openDelete} listing={listing} />
                    </AspectRatio>
                </Box>
            );
        }
    }
    else if (listing.listingType == "market-view" || listing.listingType == "trade") {
        return (
            <Box onClick={onClick} pos={"relative"}>
                <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                    <ItemDisplayInfo imageSize={imageSize} listing={listing} />
                </AspectRatio>
            </Box>
        );
    }
}

function SelectInventoryItem({onSelect} : {onSelect: (index: number) => void}) {
    let marketData = GetMarketData();
    if (!marketData || !marketData.inventory || marketData.inventory.length == 0) {
        return null;
    }
    let inventory = marketData.inventory;
    return (
        <ScrollArea h={400} w={600} bg={"dark.8"}>
            <SimpleGrid cols={5} p={20}>
                {inventory.map((listing, listingIndex) => (
                    <ItemDisplay onClick={() => {onSelect(listingIndex)}} style={{cursor: "pointer"}} key={listingIndex} listing={{
                        name: listing.name,
                        count: listing.count,
                        metadata: listing.metadata,
                        listingType: "market-view"
                    }}/>
                ))}
            </SimpleGrid >
        </ScrollArea>
    );
}

function InventoryItemSelected({index, onClick, onClose} : {index: number, onClick?: () => void, onClose: () => void}) {
    let marketData = GetMarketData();
    if (!marketData || !marketData.inventory || marketData.inventory.length == 0) {
        onClose();
        return (<></>);
    }
    let inventory = marketData.inventory;
    let listing = inventory[index];
    if (!listing) {
        onClose();
        return (<></>);
    }
    let maxCount = GetMaxCount(listing)?.count || 0;
    const [price, setPrice] = useState<number>(listing.price || 0);
    const [count, setCount] = useState<number>(maxCount);
    if (maxCount == 0) {
        onClose();
        return (<></>);
    }
    return (
        <Group gap={0} align="flex-start" style={{flexDirection: "column"}}>
            <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                <ItemDisplay onClick={onClick} style={{width: 100, cursor: "pointer"}} listing={{
                    name: listing.name,
                    count: listing.count,
                    metadata: listing.metadata,
                    listingType: "market-view"
                }}/>
                <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <Group grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={0} allowDecimal={false} label={Translate("market_buy_edit_price") + ":"} size="xs" value={price} onChange={(value) => { setPrice(Number(value)); }} />
                    </Group>
                    <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={1} allowDecimal={false} label={Translate("market_buy_edit_count") + ":"} size="xs" value={count} max={maxCount} onChange={(value) => { setCount(Number(value)); }} />
                    </Group>
                </Group>
            </Group>
            <Text fz={"xs"}>{Translate("market_buy_item_note")}</Text>
            <Text fz={"xs"}>{Translate("market_buy_item_note2")}</Text>
            <Button style={{width: "100%", marginTop: 10}} onClick={onClose}>{Translate("market_buy_add_confirm")}</Button>
        </Group>
    )
    
}

function BuyAddItem() {
    const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
    const [index, setIndex] = useState<number>(-1);
    const addCloseWrapper = () => {
        closeAdd();
        setTimeout(() => {
            setIndex(-1);
        }, 200);
    }
    return (
        <Box pos={"relative"}>
            <AspectRatio onClick={openAdd} ratio={1} style={{cursor: "pointer", position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                <Group justify="center">
                    <IconPlus size={35} color={"white"} />
                </Group>
            </AspectRatio>
            <Modal title={Translate("market_buy_add_title")} opened={addOpened} close={addCloseWrapper}>
                { (index == -1) ? (
                    <>
                        <Group pt={10} pb={20} align="flex-start" style={{flexDirection: "column"}}>
                            <Text fw={600}>{Translate("market_buy_add_select")}</Text>
                        </Group>
                        <SelectInventoryItem onSelect={(itemIndex) => setIndex(itemIndex)} />
                    </>
                ) : (
                    <InventoryItemSelected onClose={addCloseWrapper} onClick={() => {setIndex(-1)}} index={index}/>
                )}
            </Modal>
        </Box>
    );
}

function Listings({listings, addListing} : {listings: Item[], addListing?: (sku: string) => void}) {
    const [filter, setFilter] = useState<string>("");
    let filteredListings = listings.filter((listing) =>listing.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <Group miw={"70%"} gap={0} style={{flexDirection: "column"}}>
            <Group pl={20} pr={20} pt={10} pb={10} w={"100%"} style={{justifyContent: "space-between"}}>
                <Group>
                    <Text fz={"md"} fw={600}>{Translate("market_buy")}</Text>
                    <Text fz="xs" fw={400}>{Translate("market_search_results", filteredListings.length + "")}</Text>
                </Group>
                <TextInput onChange={(event) => setFilter(event.currentTarget.value)} size="xs" placeholder={Translate("market_buy_search")} leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />} />
            </Group>

            <ScrollArea w={"100%"} style={{flex: 1}}>
                <SimpleGrid cols={HasPermission("items") ? 7 : 5} pl={20} pr={20} pb={20}>
                    {HasPermission("items") && <BuyAddItem/>}
                    {filteredListings.map((listing, listingIndex) => (
                        <ItemDisplay key={listingIndex} listing={{
                            sku: listing.sku,
                            name: listing.name,
                            price: listing.price,
                            count: listing.count,
                            metadata: listing.metadata,
                            listingType: "market"
                        }} onClick={() => {(addListing && listing.sku && addListing(listing.sku))}}/>
                    ))}
                </SimpleGrid >
            </ScrollArea>
        </Group>
    );
}

function Cart({listings, cart, updateCart} : {listings: Item[], cart: Item[], updateCart: (cart: Item[]) => void}) {
    const updateQuantity = (sku: string, quantity: number) => {
        let newCart = cart.map((cartListing) => {
            if (cartListing.sku == sku) {
                return {...cartListing, quantity: quantity};
            }
            return cartListing;
        });
        updateCart(newCart);
    }
    const removeItem = (sku: string) => {
        let newCart = cart.filter((cartListing) => cartListing.sku != sku);
        updateCart(newCart);
    }
    return (cart.length > 0 ? (
        <Group gap={0} style={{flexDirection: "column", borderLeft: "2px rgba(255, 255, 255, 0.1) solid", borderBottomRightRadius: 5}} miw={"30%"}>
            <ScrollArea style={{flex: 1}}>
                <Group h={"100%"}  wrap="nowrap" gap={0} pos={"relative"} style={{flexDirection: "column", alignItems: "flex-start"}} bg={"dark.8"}>
                    {cart.map((cartListing, cartListingIndex) => {
                        let listing = listings?.find((listing) => listing.sku == cartListing.sku);
                        if (!listing) return null;
                        return (
                            <Group pl={10} pr={10} wrap="nowrap" justify="flex-start">
                                <NumberInput size={"xs"} clampBehavior="strict" min={1} max={listing.count} allowDecimal={false} value={cartListing.quantity} onChange={(value) => { (cartListing.sku && updateQuantity(cartListing.sku, Number(value))) }} />
                                <img width={40} height={40} src="/item_placeholder.png"/>
                                <Group gap={0} w={"100%"} align="flex-start" style={{flexDirection: "column"}}>
                                    <Text w={80} fw={600} fz={"xs"} style={{ textOverflow: "ellipsis", textWrap:"nowrap", overflow: "hidden"}}>{listing.name}</Text>
                                    <Text fz={10}>{GetPriceString((listing.price || 0) * (cartListing.quantity || 0))}</Text>
                                </Group>
                                <IconX size={50} color={"white"} style={{ cursor: "pointer"}} onClick={() => {(cartListing.sku && removeItem(cartListing.sku))}}/>
                            </Group>
                        );
                    })}
                </Group>
            </ScrollArea>
            <Group gap={5} p={10} w={"100%"} style={{flexDirection: "column"}} bg={"dark.8"}>
                <Group gap={0} style={{justifyContent: "space-between", width: "100%"}}>
                    <Text fw={600} fz={"md"}>{Translate("market_buy_total")}:</Text>
                    <Text fw={600} fz={"md"}>{GetPriceString(cart.reduce((total, cartListing) => {
                        let listing = listings?.find((listing) => listing.sku == cartListing.sku);
                        if (!listing) return total;
                        return total + ((listing.price || 0) * (cartListing.quantity || 0));
                    }, 0))}</Text>
                </Group>
                <Button fullWidth onClick={() => {updateCart([])}}>{Translate("market_buy_purchase", cart.length + "")}</Button>
            </Group>
        </Group>
    ) : (
        <Group gap={0} style={{flexDirection: "column", justifyContent:"center", borderLeft: "2px rgba(255, 255, 255, 0.1) solid", borderBottomRightRadius: 5}} miw={"30%"}>
            <IconShoppingCartPlus size={40} color={"white"} />
            <Text fz={"md"} fw={600}>{Translate("market_buy_cart_empty")}</Text>
            <Text fz={"xs"} fw={400}>{Translate("market_buy_cart_empty_desc")}</Text>
        </Group>
    ));
}

export function Buy({currentListings, currentCart} : {currentListings?: Item[], currentCart?: Item[]}) {
    const [listings, setListings] = useState<Item[]>(currentListings || []);
    const [cart, setCartValue] = useState<Item[]>(currentCart || []);
    const setCart = (cart: Item[]) => {
        setCartValue(cart);
        window.postMessage({ type: 'updateCart', cart: cart }, '*');
    }
    let refreshCart = false;
    cart.map((cartListing) => {
        let listing = listings.find((listing) => listing.sku == cartListing.sku);
        if (!listing) {
            cart.splice(cart.indexOf(cartListing), 1);
            refreshCart = true;
        }
    });
    if (refreshCart) {
        setCart([...cart]);
    }
    window.addEventListener('message', (event) => {
        if (event.data.type === 'updateListings') {
            setListings(event.data.listings);
        }
    })
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <Listings addListing={(sku)=> {
                let listing = listings?.find((listing) => listing.sku == sku);
                if (!listing) return;
                let cartListing = cart.find((cartListing) => cartListing.sku == sku);
                if (cartListing) {
                    if (cartListing.quantity == listing.count) return;
                    cartListing.quantity = (cartListing.quantity || 0) + 1;
                    setCart([...cart]);
                    return;
                }
                setCart([...cart, {sku: sku, name: listing.name, quantity: 1}]);
            }} listings={listings}/>
            {!HasPermission("items") && <Cart listings={listings} cart={cart} updateCart={setCart}/>}
        </Group>
    );
}