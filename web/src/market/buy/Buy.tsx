import { AspectRatio, BackgroundImage, Box, Container, Grid, Group, rem, ScrollArea, SimpleGrid, Text } from "@mantine/core";
import { useState } from "react";

type Listing = {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    metadata: any;
}

function ItemDisplay({listing} : {listing: Listing}) {
    return (
        <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
            <Group h={"100%"} style={{
                flexDirection: "row", 
                alignContent:"space-between", 
                backgroundImage: 'url("/item_placeholder.png")',
                backgroundSize: "55%",
                backgroundPositionX: "center",
                backgroundPositionY: "30%",
                backgroundRepeat: "no-repeat",
                justifyContent: "",
                }}>
                    <Group gap={2} pl={5}>
                        <Text style={{textAlign: "left"}} fz={"xs"}>{listing.price}</Text>
                    </Group>
                <Group grow w={"100%"} gap={0} style={{justifyContent: "flex-end"}}> 
                    <Text pr={5} fz={"xs"} style={{textAlign: "right"}}>x{listing.quantity}</Text>
                    <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                        <Text fz={"xs"} style={{textAlign: "center"}}>{listing.name}</Text>
                    </Group>
                </Group>
            </Group>
        </AspectRatio>
    );
}

function Listings({listings} : {listings: Listing[]}) {
    return (
        <ScrollArea w={"100%"} style={{flex: 1}}>
            <SimpleGrid cols={6} p={20}>
                {listings.map((listing, listingIndex) => (
                    <ItemDisplay key={listingIndex} listing={listing} />
                ))}
            </SimpleGrid >
        </ScrollArea>
    );
}

function Cart() {
    return (
        <Group style={{flexDirection: "column", alignItems: "flex-start"}} p={10} grow w={"30%"} bg={"dark.7"}>
            Cart 
        </Group>
    );
}

export function Buy() {
    const [listings, setListings] = useState<Listing[]>([
        {sku: "500501", name: "Item 1", price: 100, quantity: 10, metadata: {}},
        {sku: "500502", name: "Item 2", price: 200, quantity: 20, metadata: {}},
        {sku: "500503", name: "Item 3", price: 300, quantity: 30, metadata: {}},
        {sku: "500504", name: "Item 4", price: 400, quantity: 40, metadata: {}},
        {sku: "500505", name: "Item 5", price: 500, quantity: 50, metadata: {}},
        {sku: "500506", name: "Item 6", price: 600, quantity: 60, metadata: {}},
        {sku: "500507", name: "Item 7", price: 700, quantity: 70, metadata: {}},
        {sku: "500508", name: "Item 8", price: 800, quantity: 80, metadata: {}},
        {sku: "500509", name: "Item 9", price: 900, quantity: 90, metadata: {}},
        {sku: "500510", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
        {sku: "500501", name: "Item 1", price: 100, quantity: 10, metadata: {}},
        {sku: "500502", name: "Item 2", price: 200, quantity: 20, metadata: {}},
        {sku: "500503", name: "Item 3", price: 300, quantity: 30, metadata: {}},
        {sku: "500504", name: "Item 4", price: 400, quantity: 40, metadata: {}},
        {sku: "500505", name: "Item 5", price: 500, quantity: 50, metadata: {}},
        {sku: "500506", name: "Item 6", price: 600, quantity: 60, metadata: {}},
        {sku: "500507", name: "Item 7", price: 700, quantity: 70, metadata: {}},
        {sku: "500508", name: "Item 8", price: 800, quantity: 80, metadata: {}},
        {sku: "500509", name: "Item 9", price: 900, quantity: 90, metadata: {}},
        {sku: "500510", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
        {sku: "500501", name: "Item 1", price: 100, quantity: 10, metadata: {}},
        {sku: "500502", name: "Item 2", price: 200, quantity: 20, metadata: {}},
        {sku: "500503", name: "Item 3", price: 300, quantity: 30, metadata: {}},
        {sku: "500504", name: "Item 4", price: 400, quantity: 40, metadata: {}},
        {sku: "500505", name: "Item 5", price: 500, quantity: 50, metadata: {}},
        {sku: "500506", name: "Item 6", price: 600, quantity: 60, metadata: {}},
        {sku: "500507", name: "Item 7", price: 700, quantity: 70, metadata: {}},
        {sku: "500508", name: "Item 8", price: 800, quantity: 80, metadata: {}},
        {sku: "500509", name: "Item 9", price: 900, quantity: 90, metadata: {}},
        {sku: "500510", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
        {sku: "500501", name: "Item 1", price: 100, quantity: 10, metadata: {}},
        {sku: "500502", name: "Item 2", price: 200, quantity: 20, metadata: {}},
        {sku: "500503", name: "Item 3", price: 300, quantity: 30, metadata: {}},
        {sku: "500504", name: "Item 4", price: 400, quantity: 40, metadata: {}},
        {sku: "500505", name: "Item 5", price: 500, quantity: 50, metadata: {}},
        {sku: "500506", name: "Item 6", price: 600, quantity: 60, metadata: {}},
        {sku: "500507", name: "Item 7", price: 700, quantity: 70, metadata: {}},
        {sku: "500508", name: "Item 8", price: 800, quantity: 80, metadata: {}},
        {sku: "500509", name: "Item 9", price: 900, quantity: 90, metadata: {}},
        {sku: "500510", name: "Item 10", price: 1000, quantity: 100, metadata: {}},

    ]);
    return (
        <Group gap={0} style={{alignItems: "unset", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <Listings listings={listings} />
            <Cart/>
        </Group>
    );
}