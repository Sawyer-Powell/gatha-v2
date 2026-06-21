<script lang="ts">
    import type { Component } from "svelte";
    import { onMount } from "svelte";
    import { DotsThreeVertical } from "phosphor-svelte";
    import Button from "./Button.svelte";
    import {
        dropdownActionItem,
        dropdownMenu,
        dropdownMenuAlignEnd,
        dropdownMenuOpen,
        dropdownMenuUp,
        dropdownWrapper,
        popoverItemHighlighted,
    } from "./design-system.css";

    interface DropdownMenuItem {
        label: string;
        icon?: Component<{ size?: number; weight?: "regular" | "bold" }>;
        onclick?: () => void;
    }

    let {
        items = [],
        ariaLabel = "Open menu",
        align = "start",
        classname = "",
    }: {
        items?: DropdownMenuItem[];
        ariaLabel?: string;
        align?: "start" | "end";
        classname?: string;
    } = $props();

    let open = $state(false);
    let openUp = $state(false);
    let highlightIndex = $state(-1);
    let triggerEl: HTMLSpanElement;
    let wrapperEl: HTMLDivElement;
    let itemsEl: HTMLDivElement;

    function openMenu() {
        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const menuHeight = items.length * 40 + 8;
        openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
        open = true;
        highlightIndex = -1;
    }

    function close() {
        open = false;
        highlightIndex = -1;
    }

    function toggle() {
        if (open) close();
        else openMenu();
    }

    function run(item: DropdownMenuItem) {
        item.onclick?.();
        close();
        triggerEl?.querySelector("button")?.focus();
    }

    function scrollHighlightedIntoView() {
        if (itemsEl && highlightIndex >= 0) {
            const item = itemsEl.children[highlightIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!open) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openMenu();
            }
            return;
        }

        if (e.key === "Escape" || e.key === "Tab") {
            if (e.key === "Escape") e.preventDefault();
            close();
            triggerEl?.querySelector("button")?.focus();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
            scrollHighlightedIntoView();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex = Math.max(highlightIndex - 1, 0);
            scrollHighlightedIntoView();
        } else if ((e.key === "Enter" || e.key === " ") && highlightIndex >= 0) {
            e.preventDefault();
            run(items[highlightIndex]);
        }
    }

    function handleClickOutside(e: MouseEvent) {
        if (wrapperEl && !wrapperEl.contains(e.target as Node)) close();
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    });
</script>

<div class="{dropdownWrapper} {classname}" bind:this={wrapperEl}>
    <span bind:this={triggerEl}>
        <Button
            variant="ghost"
            shape="circle"
            pressed={open}
            ariaLabel={open ? "Close menu" : ariaLabel}
            onclick={toggle}
            onkeydown={handleKeydown}
        >
            <DotsThreeVertical size={18} weight="bold" />
        </Button>
    </span>

    <div
        class="{dropdownMenu} {open ? dropdownMenuOpen : ''} {openUp ? dropdownMenuUp : ''} {align === 'end' ? dropdownMenuAlignEnd : ''}"
        style={openUp
            ? "bottom: 100%; margin-bottom: 0.25rem;"
            : "top: 100%; margin-top: 0.25rem;"}
        bind:this={itemsEl}
        role="menu"
        tabindex={open ? 0 : -1}
        onkeydown={handleKeydown}
    >
        {#each items as item, i}
            {@const Icon = item.icon}
            <button
                class="{dropdownActionItem} {i === highlightIndex ? popoverItemHighlighted : ''}"
                type="button"
                role="menuitem"
                tabindex={open ? 0 : -1}
                onclick={() => run(item)}
                onmouseenter={() => (highlightIndex = i)}
            >
                {#if Icon}
                    <Icon size={16} />
                {/if}
                {item.label}
            </button>
        {/each}
    </div>
</div>
