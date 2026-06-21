<script lang="ts">
    import { Check, CaretDown } from "phosphor-svelte";
    import { onMount } from "svelte";
    import {
        dropdownWrapper,
        dropdownTrigger,
        dropdownTriggerSize,
        dropdownTriggerOpen,
        dropdownPlaceholder,
        dropdownChevron,
        dropdownChevronOpen,
        dropdownMenu,
        dropdownMenuOpen,
        dropdownMenuUp,
        dropdownItem,
        dropdownItemSelected,
        dropdownCheck,
        popoverItemHighlighted,
    } from "./design-system.css";

    let {
        options = [],
        value = null,
        placeholder = "Select...",
        size = "md",
        classname = "",
        onchange,
    }: {
        options?: string[];
        value?: string | null;
        placeholder?: string;
        size?: "sm" | "md" | "lg";
        classname?: string;
        onchange?: (value: string) => void;
    } = $props();

    let open = $state(false);
    let openUp = $state(false);
    let highlightIndex = $state(-1);
    let minWidth = $state("auto");
    let triggerEl: HTMLButtonElement;
    let wrapperEl: HTMLDivElement;
    let itemsEl: HTMLDivElement;

    function openMenu() {
        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const menuHeight = options.length * 40 + 8;
        openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
        open = true;
        highlightIndex = value ? options.indexOf(value) : -1;
        triggerEl?.focus();
    }

    function close() {
        open = false;
        highlightIndex = -1;
    }

    function toggle() {
        if (open) {
            close();
        } else {
            openMenu();
        }
    }

    function select(option: string) {
        onchange?.(option);
        close();
        triggerEl?.focus();
    }

    function scrollHighlightedIntoView() {
        if (itemsEl && highlightIndex >= 0) {
            const item = itemsEl.children[highlightIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!open) {
            if (
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === "Enter" ||
                e.key === " "
            ) {
                e.preventDefault();
                openMenu();
            }
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            close();
            triggerEl?.focus();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightIndex = Math.min(highlightIndex + 1, options.length - 1);
            scrollHighlightedIntoView();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex = Math.max(highlightIndex - 1, 0);
            scrollHighlightedIntoView();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (highlightIndex >= 0) {
                select(options[highlightIndex]);
            }
        } else if (e.key === "Tab") {
            close();
        }
    }

    function handleClickOutside(e: MouseEvent) {
        if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
            close();
        }
    }

    onMount(() => {
        // Measure widest option to set consistent width
        const measure = document.createElement("span");
        measure.style.cssText =
            "visibility:hidden;position:absolute;white-space:nowrap;font:inherit";
        triggerEl.appendChild(measure);
        let maxW = 0;
        for (const opt of options) {
            measure.textContent = opt;
            maxW = Math.max(maxW, measure.offsetWidth);
        }
        measure.remove();
        // Add padding for check icon + chevron + padding
        minWidth = `${maxW + 60}px`;

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    });
</script>

<div class="{dropdownWrapper} {classname}" bind:this={wrapperEl}>
    <button
        class="{dropdownTrigger} {dropdownTriggerSize[size]} {open
            ? dropdownTriggerOpen
            : ''}"
        style="min-width: {minWidth};"
        bind:this={triggerEl}
        onclick={toggle}
        onkeydown={handleKeydown}
    >
        {#if value}
            <span>{value}</span>
        {:else}
            <span class={dropdownPlaceholder}>{placeholder}</span>
        {/if}
        <span class="{dropdownChevron} {open ? dropdownChevronOpen : ''}">
            <CaretDown size={14} />
        </span>
    </button>

    <div
        class="{dropdownMenu} {open ? dropdownMenuOpen : ''} {openUp
            ? dropdownMenuUp
            : ''}"
        style={openUp
            ? "bottom: 100%; margin-bottom: 0.25rem;"
            : "top: 100%; margin-top: 0.25rem;"}
        bind:this={itemsEl}
    >
        {#each options as option, i}
            <div
                class="{dropdownItem} {option === value
                    ? dropdownItemSelected
                    : ''} {i === highlightIndex ? popoverItemHighlighted : ''}"
                onclick={() => select(option)}
                onkeydown={(e) => {
                    if (e.key === "Enter") select(option);
                }}
                onmouseenter={() => (highlightIndex = i)}
                role="option"
                tabindex="-1"
                aria-selected={option === value}
            >
                <span class={dropdownCheck}>
                    {#if option === value}
                        <Check size={14} weight="bold" />
                    {/if}
                </span>
                {option}
            </div>
        {/each}
    </div>
</div>
