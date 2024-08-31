import { Text, Menu, Group, Center, Burger, Container, Box, ScrollArea } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import classes from "./Market.module.css";
import { useState } from "react";

import { Buy, Item } from "./buy/Buy";    
import { Trade } from "./trade/Trade";
import { Manage } from "./manage/Manage";
import { Translate, GetMarketData } from "../App";

type Link = {
    active?: boolean;
    link: string;
    label: string;
    links?: Link[];
}

type MarketData = {
  listings?: Item[];
}

function HeaderMenu({title, setPage, links} : {setPage: (pageId: string) => void, title: string, links: Link[]}) {
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={link.active ? classes["link-selected"] : classes.link}
        onClick={(event) => {
            event.preventDefault()
            setPage(link.link)
        }}
      >
        {link.label}
      </a>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
            <Text fw={600} fz={"md"}>{title}</Text>
            <Group gap={5} visibleFrom="sm">
                {items}
            </Group>
            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </div>
      </Container>
    </header>
  );
}

let currentListings : Item[] = [];

export function UpdateListings(listings: Item[]) {
  currentListings = listings;
}

export function HasPermission(permission: string) {
  if (permission == "items") {
    return true;
  }
  return false;
}

export function Market() {
  const [page, setPage] = useState("buy");
  let marketData = GetMarketData() as MarketData;
  UpdateListings(marketData?.listings || []);
  return (
    <Group style={{position: "relative", flexDirection: "column", flexWrap: "nowrap", borderRadius: 5}} gap={0} w={900} h={600} bg={"dark.8"}>
      <HeaderMenu title={"Pickle's Shopping Center"} setPage={setPage} links={[
        { active: (page == "buy"), link: 'buy', label: Translate("market_buy") },
        { active: (page == "trade"), link: 'trade', label: Translate("market_trade") },
        { active: (page == "manage"), link: 'manage', label: Translate("market_manage") },
      ]}/>
      {page == "buy" && <Buy currentListings={currentListings}/>}
      {page == "trade" && <Trade/>}
      {page == "manage" && <Manage/>}
      <div id="market-modal-container" className={classes["modal-container"]}></div>
    </Group>
  );
}