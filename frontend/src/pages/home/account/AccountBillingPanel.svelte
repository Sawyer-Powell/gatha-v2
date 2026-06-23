<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import AccountBillingTable from "./AccountBillingTable.svelte";
    import AccountMetric from "./AccountMetric.svelte";
    import type { BillingTab } from "../homeModel";
    import { account_billing_grid, account_table_tabs } from "./account.css";

    let {
        tab,
        predicted,
        actual,
        transcriptions,
        transactions,
        ontab,
        onopenTranscription,
    }: {
        tab: BillingTab;
        predicted: string;
        actual: string;
        transcriptions: string[][];
        transactions: string[][];
        ontab: (tab: BillingTab) => void;
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
    <Button variant="ghost" shape="pill" pressed={tab === "transcriptions"} onclick={() => ontab("transcriptions")}>Transcriptions</Button>
    <Button variant="ghost" shape="pill" pressed={tab === "transactions"} onclick={() => ontab("transactions")}>Transactions</Button>
</div>
<AccountBillingTable
    {tab}
    {transcriptions}
    {transactions}
    {onopenTranscription}
/>
