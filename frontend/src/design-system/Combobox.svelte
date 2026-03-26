<script lang="ts">
    import { Check, CaretUpDown, X } from "phosphor-svelte";
    import { vars } from "../app.css";
    import { onMount, tick } from "svelte";
    import {
        popoverWrapper,
        controlSizeVariants,
        comboboxTriggerWithTags,
        popoverChevron,
        popoverMenu,
        popoverMenuOpen,
        popoverMenuUp,
        popoverItem,
        popoverItemSelected,
        popoverItemHighlighted,
        popoverCheck,
        popoverPlaceholder,
        comboboxTrigger,
        comboboxTag,
        comboboxOverflow,
        comboboxSearchWrapper,
        comboboxSearchInput,
    } from "./design-system.css";

    let {
        options = [],
        values = [],
        placeholder = "Select...",
        size = "md",
        onchange,
    }: {
        options?: string[];
        values?: string[];
        placeholder?: string;
        size?: "sm" | "md" | "lg";
        onchange?: (values: string[]) => void;
    } = $props();

    let open = $state(false);
    let openUp = $state(false);
    let query = $state("");
    let highlightIndex = $state(-1);
    let initialWidth = $state("auto");
    let triggerEl: HTMLDivElement;
    let wrapperEl: HTMLDivElement;
    let searchEl: HTMLInputElement;
    let itemsEl: HTMLDivElement;

    const maxTags = 2;

    const filtered = $derived(
        query
            ? options.filter((o) =>
                  o.toLowerCase().includes(query.toLowerCase()),
              )
            : options,
    );

    const visibleTags = $derived(values.slice(0, maxTags));
    const overflowCount = $derived(Math.max(0, values.length - maxTags));

    // Reset highlight when filtered list changes
    $effect(() => {
        filtered;
        highlightIndex = -1;
    });

    async function openMenu() {
        if (!open) {
            const rect = triggerEl.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = Math.min(options.length, 6) * 40 + 60;
            openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
            open = true;
            highlightIndex = -1;
            await tick();
            searchEl?.focus();
        }
    }

    function close() {
        open = false;
        query = "";
        highlightIndex = -1;
    }

    async function toggle() {
        if (open) {
            close();
        } else {
            await openMenu();
        }
    }

    function toggleOption(option: string) {
        if (values.includes(option)) {
            onchange?.(values.filter((v) => v !== option));
        } else {
            onchange?.([...values, option]);
        }
        query = "";
        searchEl?.focus();
    }

    function removeTag(option: string, e: MouseEvent) {
        e.stopPropagation();
        onchange?.(values.filter((v) => v !== option));
    }

    function handleClickOutside(e: MouseEvent) {
        if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
            close();
        }
    }

    function scrollHighlightedIntoView() {
        if (itemsEl && highlightIndex >= 0) {
            const item = itemsEl.children[highlightIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            close();
            triggerEl?.focus();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightIndex = Math.min(highlightIndex + 1, filtered.length - 1);
            scrollHighlightedIntoView();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex = Math.max(highlightIndex - 1, 0);
            scrollHighlightedIntoView();
        } else if (e.key === "Enter" && highlightIndex >= 0) {
            e.preventDefault();
            toggleOption(filtered[highlightIndex]);
        } else if (e.key === "Tab") {
            close();
        }
    }

    onMount(() => {
        // Store initial width. When tags are added, padding shrinks,
        // so we add the padding difference to maintain visual width.
        const baseWidth = wrapperEl.offsetWidth;
        const paddingLoss = 20; // ~1.25rem difference between control and tag padding
        wrapperEl.style.minWidth = `${baseWidth + paddingLoss}px`;
        document.addEventListener("click", handleClickOutside);
        return () =>
            document.removeEventListener("click", handleClickOutside);
    });
</script>

<div class={popoverWrapper} bind:this={wrapperEl}>
    <div
        class="{comboboxTrigger} {values.length > 0 ? comboboxTriggerWithTags : controlSizeVariants[size]}"
        style={open ? `border-color: ${vars.colors.primary};` : ''}
        bind:this={triggerEl}
        onclick={toggle}
        onkeydown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(); } }}
        role="combobox"
        tabindex="0"
        aria-expanded={open}
        aria-controls="combobox-listbox"
    >
        {#if values.length === 0}
            <span class={popoverPlaceholder}>{placeholder}</span>
        {:else}
            {#each visibleTags as tag}
                <button class={comboboxTag} onclick={(e) => removeTag(tag, e)} aria-label="Remove {tag}">
                    {tag}
                    <X size={10} weight="bold" />
                </button>
            {/each}
            {#if overflowCount > 0}
                <span class={comboboxOverflow}>+{overflowCount}</span>
            {/if}
        {/if}
        <span class={popoverChevron}>
            <CaretUpDown size={14} />
        </span>
    </div>

    <div
        class="{popoverMenu} {open ? popoverMenuOpen : ''} {openUp ? popoverMenuUp : ''}"
        style="{openUp
            ? 'bottom: 100%; margin-bottom: 0.25rem;'
            : 'top: 100%; margin-top: 0.25rem;'} min-width: 16rem;"
    >
        <div class={comboboxSearchWrapper}>
            <input
                class={comboboxSearchInput}
                bind:this={searchEl}
                bind:value={query}
                placeholder="Search..."
                onkeydown={handleKeydown}
            />
        </div>

        <div style="overflow-y: auto; max-height: 13rem;" bind:this={itemsEl} id="combobox-listbox" role="listbox">
            {#each filtered as option, i}
                <div
                    class="{popoverItem} {values.includes(option) ? popoverItemSelected : ''} {i === highlightIndex ? popoverItemHighlighted : ''}"
                    onclick={() => toggleOption(option)}
                    onkeydown={(e) => { if (e.key === "Enter") toggleOption(option); }}
                    onmouseenter={() => highlightIndex = i}
                    role="option"
                    tabindex="-1"
                    aria-selected={values.includes(option)}
                >
                    <span class={popoverCheck}>
                        {#if values.includes(option)}
                            <Check size={14} weight="bold" />
                        {/if}
                    </span>
                    {option}
                </div>
            {:else}
                <div class={popoverItem} style="pointer-events: none; color: var(--colors-muted);">
                    No results
                </div>
            {/each}
        </div>
    </div>
</div>
