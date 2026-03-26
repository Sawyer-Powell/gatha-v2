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
        placeholder = "",
        type = "text",
        size = "md",
        icon: Icon,
        clearable = false,
        oninput,
    }: {
        value?: string;
        placeholder?: string;
        type?: "text" | "password" | "email";
        size?: "sm" | "md" | "lg";
        icon?: Component<{ size?: number }>;
        clearable?: boolean;
        oninput?: (value: string) => void;
    } = $props();

    const iconSize = { sm: 14, md: 16, lg: 20 };
</script>

<div class="{inputWrapper} {inputWrapperSize[size]}">
    {#if Icon}
        <span class={inputIcon}>
            <Icon size={iconSize[size]} />
        </span>
    {/if}
    <input
        class={inputField}
        {type}
        {value}
        {placeholder}

        oninput={(e) => oninput?.(e.currentTarget.value)}
    />
    {#if clearable && value}
        <button
            class={inputClear}
            aria-label="Clear"
            onclick={() => oninput?.("")}
        >
            <X size={iconSize[size]} />
        </button>
    {/if}
</div>
