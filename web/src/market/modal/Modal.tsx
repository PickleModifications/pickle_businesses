import { Group, Portal, ScrollArea, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

export function Modal({children, title, opened, close} : {children: any, title: string, opened: boolean, close: () => void}) {
    const [enabled, setEnabled] = useState(false);
    if (opened && !enabled) {
        setEnabled(true);
    }
    if (!opened && enabled) {
        setTimeout(() => {
            setEnabled(false);
        }, 200);
    }
    return (
        <Portal target={"#market-modal-container"}>
            <Group pos={"absolute"} w={"100%"} h={"100%"} style={{ borderRadius: 5, pointerEvents: (opened ? "all" : "none"), opacity: (opened ? 1 : 0), justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
                { enabled ? (
                    <Group p={10} gap={0} bg={"dark.7"} style={{ flexDirection: "column", alignItems: "flex-start", borderRadius: 5, minWidth: "50%" }}>
                        <Group w={"100%"} style={{justifyContent: "space-between"}}>
                            <Text fw={600} fz={"lg"}>{title}</Text>
                            <IconX onClick={close} style={{cursor: "pointer"}} size={20} color={"white"} />
                        </Group>
                        <ScrollArea style={{maxHeight: "calc(100vh - 100px)", width: "100%"}}>
                            {children}
                        </ScrollArea>
                    </Group>
                ) : null }
            </Group>
        </Portal>
    );
}