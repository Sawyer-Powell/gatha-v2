<script lang="ts">
    import type { Snippet } from "svelte";
    import EditableText from "$lib/design-system/EditableText.svelte";
    import { ShieldCheck } from "phosphor-svelte";
    import type { AccountRole } from "../homeModel";
    import {
        account_profile_meta,
        account_profile_name_input,
        account_profile_name_row,
        account_profile_name_wrap,
        account_profile_text,
        account_role_icon,
        account_section,
        account_section_title,
    } from "./account.css";

    let {
        name,
        subtitle,
        role = undefined,
        editable = false,
        ariaLabel = "Edit name",
        placeholder = "Name",
        onname,
        media,
        actions,
        children: _children,
    }: {
        name: string;
        subtitle: string;
        role?: AccountRole;
        editable?: boolean;
        ariaLabel?: string;
        placeholder?: string;
        onname?: (name: string) => void;
        media?: Snippet;
        actions?: Snippet;
        children?: Snippet;
    } = $props();
</script>

<div class={account_section}>
    {#if media}
        {@render media()}
    {/if}
    <div class={account_profile_meta}>
        <span class={account_profile_name_row}>
            {#if editable}
                <span class={account_profile_name_wrap}>
                    <EditableText
                        classname="{account_section_title} {account_profile_name_input}"
                        value={name}
                        {ariaLabel}
                        {placeholder}
                        oninput={onname}
                    />
                </span>
            {:else}
                <h3 class={account_section_title}>{name}</h3>
            {/if}
            {#if role === "admin"}
                <span class={account_role_icon} title="Admin" aria-label="Admin">
                    <ShieldCheck size={16} weight="fill" />
                </span>
            {/if}
        </span>
        <p class={account_profile_text}>{subtitle}</p>
    </div>
    {#if actions}
        {@render actions()}
    {/if}
</div>
