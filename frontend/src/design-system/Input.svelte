<script lang="ts">
    import type { Component } from "svelte";
    import { X } from "phosphor-svelte";
    import {
        inputWrapper,
        inputWrapperSize,
        inputField,
        inputIcon,
        inputClear,
    } from "./design-system.css";

    let {
        value = "",
        id = undefined,
        name = undefined,
        placeholder = "",
        type = "text",
        autocomplete = undefined,
        size = "md",
        icon: Icon,
        clearable = false,
        ariaLabel,
        ariaDescribedby = undefined,
        ariaInvalid = false,
        hiddenFromA11y = false,
        classname = "",
        element = $bindable<HTMLInputElement | undefined>(),
        oninput,
        onblur,
        onkeydown,
    }: {
        value?: string;
        id?: string;
        name?: string;
        placeholder?: string;
        type?: "text" | "password" | "email";
        autocomplete?: "email" | "current-password" | "new-password" | "username" | "off" | "on";
        size?: "sm" | "md" | "lg";
        icon?: Component<{ size?: number }>;
        clearable?: boolean;
        ariaLabel?: string;
        ariaDescribedby?: string;
        ariaInvalid?: boolean;
        hiddenFromA11y?: boolean;
        classname?: string;
        element?: HTMLInputElement;
        oninput?: (value: string) => void;
        onblur?: (event: FocusEvent) => void;
        onkeydown?: (event: KeyboardEvent) => void;
    } = $props();

    const iconSize = { sm: 14, md: 16, lg: 20 };
</script>

<div class="{inputWrapper} {inputWrapperSize[size]} {classname}" aria-hidden={hiddenFromA11y}>
    {#if Icon}
        <span class={inputIcon}>
            <Icon size={iconSize[size]} />
        </span>
    {/if}
    <input
        bind:this={element}
        class={inputField}
        {id}
        {name}
        {type}
        {value}
        {placeholder}
        {autocomplete}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid ? "true" : undefined}
        tabindex={hiddenFromA11y ? -1 : undefined}

        oninput={(e) => oninput?.(e.currentTarget.value)}
        onblur={(e) => onblur?.(e)}
        onkeydown={(e) => onkeydown?.(e)}
    />
    {#if clearable && value}
        <button
            type="button"
            class={inputClear}
            aria-label="Clear"
            onclick={() => oninput?.("")}
        >
            <X size={iconSize[size]} />
        </button>
    {/if}
</div>
