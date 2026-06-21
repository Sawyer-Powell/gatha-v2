<script lang="ts">
    import type { Component, Snippet } from "svelte";
    import { Check, CaretUpDown, X } from "phosphor-svelte";
    import { onMount, tick } from "svelte";
    import {
        popoverWrapper,
        controlSizeVariants,
        comboboxTriggerWithTags,
        comboboxIconTrigger,
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
        comboboxTriggerOpen,
        comboboxTag,
        comboboxOverflow,
        comboboxSearchWrapper,
        comboboxSearchInput,
        comboboxOptionContent,
        comboboxEmptyState,
    } from "./design-system.css";

    type ComboboxOption = string | {
        value: string;
        label: string;
    };

    type NormalizedComboboxOption = {
        value: string;
        label: string;
    };

    let {
        options = [],
        values = [],
        placeholder = "Select...",
        size = "md",
        triggerIcon: TriggerIcon,
        ariaLabel,
        classname = "",
        onchange,
        optionContent,
    }: {
        options?: ComboboxOption[];
        values?: string[];
        placeholder?: string;
        size?: "sm" | "md" | "lg";
        triggerIcon?: Component<{ size?: number; weight?: "regular" | "bold" }>;
        ariaLabel?: string;
        classname?: string;
        onchange?: (values: string[]) => void;
        optionContent?: Snippet<[option: NormalizedComboboxOption]>;
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

    const normalizedOptions = $derived(
        options.map((option) =>
            typeof option === "string"
                ? { value: option, label: option }
                : option,
        ),
    );

    const filtered = $derived(
        query
            ? normalizedOptions.filter((o) =>
                  o.label.toLowerCase().includes(query.toLowerCase()),
              )
            : normalizedOptions,
    );

    const visibleTags = $derived(values.slice(0, maxTags));
    const overflowCount = $derived(Math.max(0, values.length - maxTags));
    const iconOnly = $derived(Boolean(TriggerIcon) && values.length === 0);

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
            const menuHeight = Math.min(normalizedOptions.length, 6) * 40 + 60;
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

    function optionLabel(value: string) {
        return normalizedOptions.find((option) => option.value === value)?.label ?? value;
    }

    function toggleOption(option: { value: string }) {
        if (values.includes(option.value)) {
            onchange?.(values.filter((v) => v !== option.value));
        } else {
            onchange?.([...values, option.value]);
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
        if (!TriggerIcon) wrapperEl.style.minWidth = `${baseWidth + paddingLoss}px`;
        document.addEventListener("click", handleClickOutside);
        return () =>
            document.removeEventListener("click", handleClickOutside);
    });
</script>

<div class="{popoverWrapper} {classname}" bind:this={wrapperEl}>
    <div
        class="{comboboxTrigger} {open ? comboboxTriggerOpen : ''} {values.length > 0 ? comboboxTriggerWithTags : iconOnly ? comboboxIconTrigger : controlSizeVariants[size]}"
        bind:this={triggerEl}
        onclick={toggle}
        onkeydown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(); } }}
        role="combobox"
        tabindex="0"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls="combobox-listbox"
    >
        {#if iconOnly && TriggerIcon}
            <TriggerIcon size={18} weight="bold" />
        {:else if values.length === 0}
            <span class={popoverPlaceholder}>{placeholder}</span>
        {:else}
            {#each visibleTags as tag}
                <button class={comboboxTag} onclick={(e) => removeTag(tag, e)} aria-label="Remove {tag}">
                    {optionLabel(tag)}
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
                    class="{popoverItem} {values.includes(option.value) ? popoverItemSelected : ''} {i === highlightIndex ? popoverItemHighlighted : ''}"
                    onclick={() => toggleOption(option)}
                    onkeydown={(e) => { if (e.key === "Enter") toggleOption(option); }}
                    onmouseenter={() => highlightIndex = i}
                    role="option"
                    tabindex="-1"
                    aria-selected={values.includes(option.value)}
                >
                    <span class={popoverCheck}>
                        {#if values.includes(option.value)}
                            <Check size={14} weight="bold" />
                        {/if}
                    </span>
                    <span class={comboboxOptionContent}>
                        {#if optionContent}
                            {@render optionContent(option)}
                        {:else}
                            {option.label}
                        {/if}
                    </span>
                </div>
            {:else}
                <div class={comboboxEmptyState}>
                    No results
                </div>
            {/each}
        </div>
    </div>
</div>
