<script lang="ts">
    import type { Snippet } from "svelte";
    import { onMount, tick } from "svelte";
    import {
        popoverMenu,
        popoverMenuAlignEnd,
        popoverMenuOpen,
        popoverMenuUp,
        popoverWrapper,
    } from "./design-system.css";

    type TriggerApi = {
        open: boolean;
        toggle: () => void;
        close: () => void;
    };

    let {
        open = $bindable(false),
        align = "start",
        classname = "",
        menuClassname = "",
        estimatedHeight = 160,
        onopen,
        onclose,
        trigger,
        children,
    }: {
        open?: boolean;
        align?: "start" | "end";
        classname?: string;
        menuClassname?: string;
        estimatedHeight?: number;
        onopen?: () => void;
        onclose?: () => void;
        trigger: Snippet<[TriggerApi]>;
        children: Snippet;
    } = $props();

    let openUp = $state(false);
    let wrapperEl: HTMLDivElement;
    let triggerEl: HTMLSpanElement;

    async function openPopover() {
        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
        open = true;
        await tick();
        onopen?.();
    }

    function close() {
        if (!open) return;
        open = false;
        onclose?.();
    }

    function toggle() {
        if (open) close();
        else void openPopover();
    }

    function handleClickOutside(event: MouseEvent) {
        if (wrapperEl && !wrapperEl.contains(event.target as Node)) close();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!open || event.key !== "Escape") return;
        event.preventDefault();
        close();
        triggerEl?.querySelector<HTMLElement>("button,[tabindex]")?.focus();
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div class="{popoverWrapper} {classname}" bind:this={wrapperEl} data-open={open}>
    <span bind:this={triggerEl}>
        {@render trigger({ open, toggle, close })}
    </span>

    <div
        class="{popoverMenu} {open ? popoverMenuOpen : ''} {openUp ? popoverMenuUp : ''} {align === 'end' ? popoverMenuAlignEnd : ''} {menuClassname}"
        style={openUp
            ? "bottom: 100%; margin-bottom: 0.5rem;"
            : "top: 100%; margin-top: 0.5rem;"}
    >
        {@render children()}
    </div>
</div>
