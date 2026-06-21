<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import AccountBillingTable from "./AccountBillingTable.svelte";
    import AccountMetric from "./AccountMetric.svelte";
    import type { BillingTab } from "../homeModel";
    import { account_billing_grid, account_table_tabs } from "./account.css";

    let {
        tab = $bindable<BillingTab>("transcriptions"),
        predicted,
        actual,
        transcriptions,
        transactions,
        onopenTranscription,
    }: {
        tab?: BillingTab;
        predicted: string;
        actual: string;
        transcriptions: string[][];
        transactions: string[][];
        onopenTranscription: (title: string) => void;
    } = $props();
</script>

<div class={account_billing_grid}>
    <AccountMetric
        label="Available balance"
        value={predicted}
        description="After pending usage holds."
    />
    <AccountMetric label="Account balance" value={actual} />
</div>
<div class={account_table_tabs}>
    <Button variant="ghost" shape="pill" pressed={tab === "transcriptions"} onclick={() => (tab = "transcriptions")}>Transcriptions</Button>
    <Button variant="ghost" shape="pill" pressed={tab === "transactions"} onclick={() => (tab = "transactions")}>Transactions</Button>
</div>
<AccountBillingTable
    {tab}
    {transcriptions}
    {transactions}
    {onopenTranscription}
/>
