<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import DropdownMenu from "$lib/design-system/DropdownMenu.svelte";
    import EditableText from "$lib/design-system/EditableText.svelte";
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import { GearSix, ShareFat, SidebarSimple, TrashSimple } from "phosphor-svelte";
    import type { VideoItem } from "../homeModel";
    import {
        account_top_button,
        account_top_content,
        account_top_settings_icon,
        top_bar,
        top_bar_actions,
        top_bar_title,
        top_bar_title_group,
        top_bar_title_input,
        top_bar_title_stack,
    } from "./chrome.css";

    /*
     * Future WASM boundary:
     * - WASM/router-owned state: selected video title and account identity.
     * - WASM/router-driven callbacks: toggle route/chrome state, rename video,
     *   share/delete actions, and open account settings.
     */
    let {
        sidebarOpen,
        video,
        accountName,
        accountAvatarUrl,
        ontoggleSidebar,
        onrenameVideo,
        onopenAccount,
    }: {
        sidebarOpen: boolean;
        video: VideoItem;
        accountName: string;
        accountAvatarUrl: string;
        ontoggleSidebar: () => void;
        onrenameVideo: (title: string) => void;
        onopenAccount: () => void;
    } = $props();
</script>

<div class={top_bar}>
    <Button
        variant="ghost"
        shape="circle"
        pressed={sidebarOpen}
        ariaLabel={sidebarOpen ? "Hide video list" : "Show video list"}
        onclick={ontoggleSidebar}
    >
        <SidebarSimple size={18} />
    </Button>
    <div class={top_bar_title_group}>
        <span class={top_bar_title_stack}>
            <EditableText
                classname="{top_bar_title} {top_bar_title_input}"
                value={video.title}
                ariaLabel="Edit video name"
                oninput={onrenameVideo}
            />
        </span>
        <DropdownMenu
            ariaLabel="Open video options"
            align="end"
            items={[
                { label: "Share", icon: ShareFat },
                { label: "Delete", icon: TrashSimple },
            ]}
        />
    </div>
    <div class={top_bar_actions}>
        <Button
            variant="ghost"
            shape="circle"
            classname={account_top_button}
            ariaLabel="Open account settings"
            onclick={onopenAccount}
        >
            <span class={account_top_content}>
                <ProfilePicture name={accountName} imageUrl={accountAvatarUrl} />
            </span>
            <span class={account_top_settings_icon} aria-hidden="true">
                <GearSix size={18} weight="bold" />
            </span>
        </Button>
    </div>
</div>
