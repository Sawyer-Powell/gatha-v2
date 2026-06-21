<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import type { AccountTab } from "../homeModel";
    import { account_tab_button, account_tab_list } from "./account.css";

    const tabs: Array<[AccountTab, string]> = [
        ["profile", "Profile"],
        ["organization", "Organization"],
        ["billing", "Billing"],
        ["contribute", "Contribute"],
    ];

    let {
        value,
        onchange,
    }: {
        value: AccountTab;
        onchange: (tab: AccountTab) => void;
    } = $props();
</script>

<aside class={account_tab_list} aria-label="Account settings sections">
    {#each tabs as [tab, label]}
        <Button
            variant="ghost"
            shape="square"
            classname={account_tab_button}
            pressed={value === tab}
            onclick={() => onchange(tab)}
        >
            {label}
        </Button>
    {/each}
</aside>
