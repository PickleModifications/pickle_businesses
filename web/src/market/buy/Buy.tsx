import { AspectRatio, Box, Button, Container, Group, NumberInput, rem, ScrollArea, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { GetMarketData, GetPriceString, Item, Translate } from "../../App";
import { IconEdit, IconPlus, IconSearch, IconShoppingCartPlus, IconTrash } from "@tabler/icons-react";
import { UpdateListings, HasPermission, GetMaxQuantity } from "../Market";
import classes from "./Buy.module.css";
import { Modal } from "../modal/Modal";
import { useDisclosure } from "@mantine/hooks";

function BuyEditModal({listing, opened, close} : {listing: Item, opened: boolean, close: () => void}) {
    if (!listing.sku) return null;
    let maxQuantity = GetMaxQuantity(listing)?.count || 0;
    const [price, setPrice] = useState<number>(listing.price || 0);
    const [quantity, setQuantity] = useState<number>(maxQuantity);
    console.log(maxQuantity)
    return (
        <Modal title={Translate("market_buy_edit_title", listing.name, listing.sku)} opened={opened} close={close}>
            <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                <ItemDisplay style={{width: 100}} listing={{
                    sku: listing.sku,
                    name: listing.name,
                    price: listing.price,
                    quantity: listing.quantity,
                    metadata: listing.metadata,
                    listingType: "market-view" 
                }}/>
                <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <Group grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={0} allowDecimal={false} label={Translate("market_buy_edit_price") + ":"} size="xs" value={price} onChange={(value) => { setPrice(Number(value)) }} />
                    </Group>
                    <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={1} allowDecimal={false} label={Translate("market_buy_edit_quantity") + ":"} size="xs" value={quantity} onChange={(value) => { setQuantity(Number(value)); }} />
                    </Group>
                </Group>
            </Group>
            <Text fz={"xs"}>{Translate("market_buy_item_note")}</Text>
            <Text fz={"xs"}>{Translate("market_buy_item_note2")}</Text>
            <Button style={{width: "100%", marginTop: 10}} onClick={close}>{Translate("market_buy_edit_save")}</Button>
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

function ItemDisplayInfo({listing, openEdit, openDelete} : {listing: Item, openEdit?: () => void, openDelete?: () => void}) {
    return (
        <Group h={"100%"} style={{
            flexDirection: "row", 
            alignContent:"space-between", 
            backgroundImage: 'url("/item_placeholder.png")',
            backgroundSize: "65%",
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
                    <Text fz={"xs"} style={{textAlign: "right"}}>x{listing.quantity}</Text>
                </Group>
                <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                    <Text pl={4} pr={4} fz={"xs"} style={{ textOverflow: "ellipsis", textWrap:"nowrap", overflow: "hidden", textAlign: "center"}}>{listing.name}</Text>
                </Group>
            </Group>
        </Group>
    );
}

function ItemDisplay({onClick, listing, style} : {onClick?: () => void, listing: Item, style?: any}) {
    if (listing.listingType == "market") { 
        if (!HasPermission("items")) {
            return (
                <Box onClick={onClick} pos={"relative"} className={classes["purchase-listing"]}>
                    <Group gap={0} className={classes["cart"]} style={{zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center"}}>
                        <IconShoppingCartPlus size={30} color={"white"} />
                    </Group>
                    <AspectRatio className={classes["item"]} ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                        <ItemDisplayInfo listing={listing} />
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
                        <ItemDisplayInfo openEdit={openEdit} openDelete={openDelete} listing={listing} />
                    </AspectRatio>
                </Box>
            );
        }
    }
    else if (listing.listingType == "market-view") {
        return (
            <Box onClick={onClick} pos={"relative"}>
                <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                    <ItemDisplayInfo listing={listing} />
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
                        quantity: listing.quantity,
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
    let maxQuantity = GetMaxQuantity(listing)?.count || 0;
    const [price, setPrice] = useState<number>(listing.price || 0);
    const [quantity, setQuantity] = useState<number>(maxQuantity);
    if (maxQuantity == 0) {
        onClose();
        return (<></>);
    }
    return (
        <Group gap={0} align="flex-start" style={{flexDirection: "column"}}>
            <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                <ItemDisplay onClick={onClick} style={{width: 100, cursor: "pointer"}} listing={{
                    name: listing.name,
                    quantity: listing.quantity,
                    metadata: listing.metadata,
                    listingType: "market-view"
                }}/>
                <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <Group grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={0} allowDecimal={false} label={Translate("market_buy_edit_price") + ":"} size="xs" value={price} onChange={(value) => { setPrice(Number(value)); }} />
                    </Group>
                    <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput clampBehavior="strict" min={1} allowDecimal={false} label={Translate("market_buy_edit_quantity") + ":"} size="xs" value={quantity} max={maxQuantity} onChange={(value) => { setQuantity(Number(value)); }} />
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
    const [index, setIndex] = useState<number>(0);
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

function Listings({currentListings} : {currentListings?: Item[]}) {
    const [listings, setListings] = useState<Item[]>(currentListings || []);
    const [filter, setFilter] = useState<string>("");
    const [filteredListings, setFilteredListings] = useState<Item[]>([]);
    useEffect(() => {
        console.log("Listings updated", new Date().getMilliseconds());
        const reallyFilteredListings = listings.filter((listing) => listing.name.toLowerCase().includes(filter.toLowerCase()));
        setFilteredListings(reallyFilteredListings);
    }, [listings, filter]);
    window.addEventListener('message', (event) => {
        if (event.data.type === 'updateListings') {
            setListings(event.data.listings);
        }
    })
    return (
        <Group miw={"70%"} gap={0} style={{flexDirection: "column"}}>
            <Group pl={20} pr={20} pt={10} pb={10} w={"100%"} style={{justifyContent: "space-between"}}>
                <Group>
                    <Text fz={"md"} fw={600}>Product Listings</Text>
                    <Text fz="xs" fw={400}>{filteredListings.length} result(s) found</Text>
                </Group>
                <TextInput onChange={(event) => setFilter(event.currentTarget.value)} size="xs" placeholder={Translate("market_buy_search")} leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />} />
            </Group>

            <ScrollArea w={"100%"} style={{flex: 1}}>
                <SimpleGrid cols={HasPermission("items") ? 7 : 5} pl={20} pr={20} pb={20}>
                    <BuyAddItem/>
                    {filteredListings.map((listing, listingIndex) => (
                        <ItemDisplay key={listingIndex} listing={{
                            sku: listing.sku,
                            name: listing.name,
                            price: listing.price,
                            quantity: listing.quantity,
                            metadata: listing.metadata,
                            listingType: "market"
                        }}/>
                    ))}
                </SimpleGrid >
            </ScrollArea>
        </Group>
    );
}

function Cart() {
    return (
        <Group style={{flexDirection: "column", alignItems: "flex-start", borderLeft: "2px rgba(255, 255, 255, 0.1) solid", borderBottomRightRadius: 5}} p={10} grow miw={"30%"} bg={"dark.8"}>
            Cart 
        </Group>
    );
}

export function Buy({currentListings} : {currentListings?: Item[]}) {
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <Listings currentListings={currentListings}/>
            {!HasPermission("items") && <Cart/>}
        </Group>
    );
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'updateListings') {
        UpdateListings(event.data.listings);
    }
})