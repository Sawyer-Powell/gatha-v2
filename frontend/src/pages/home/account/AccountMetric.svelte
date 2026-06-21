<script lang="ts">
    import {
        account_metric,
        account_metric_label,
        account_metric_value,
        account_profile_text,
    } from "./account.css";

    let {
        label,
        value,
        description,
    }: {
        label: string;
        value: string;
        description?: string;
    } = $props();
</script>

<div class={account_metric}>
    <span class={account_metric_label}>{label}</span>
    <span class={account_metric_value}>{value}</span>
    {#if description}
        <span class={account_profile_text}>{description}</span>
    {/if}
</div>
