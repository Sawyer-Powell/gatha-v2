<script lang="ts">
    import type { BillingTab } from "../homeModel";
    import {
        account_table,
        account_table_cell,
        account_table_header,
        account_table_link,
        account_table_value,
    } from "./account.css";

    let {
        tab,
        transcriptions,
        transactions,
        onopenTranscription,
    }: {
        tab: BillingTab;
        transcriptions: string[][];
        transactions: string[][];
        onopenTranscription: (title: string) => void;
    } = $props();
</script>

<table class={account_table}>
    <thead>
        {#if tab === "transcriptions"}
            <tr>
                <th class={account_table_header}>Transcription</th>
                <th class={account_table_header}>Initiated by</th>
                <th class={account_table_header}>Estimated cost</th>
            </tr>
        {:else}
            <tr>
                <th class={account_table_header}>Date</th>
                <th class={account_table_header}>Transaction</th>
                <th class={account_table_header}>Source</th>
                <th class={account_table_header}>Amount</th>
            </tr>
        {/if}
    </thead>
    <tbody>
        {#if tab === "transcriptions"}
            {#each transcriptions as row}
                <tr>
                    <td class={account_table_cell}>
                        <button
                            class={account_table_link}
                            type="button"
                            onclick={() => onopenTranscription(row[0])}
                        >
                            {row[0]}
                        </button>
                    </td>
                    <td class={account_table_cell}>{row[1]}</td>
                    <td class={account_table_cell}>{row[2]}</td>
                </tr>
            {/each}
        {:else}
            {#each transactions as row}
                <tr>
                    <td class={account_table_cell}>{row[0]}</td>
                    <td class={account_table_cell}>{row[1]}</td>
                    <td class={account_table_cell}>{row[2]}</td>
                    <td class={account_table_value}>{row[3]}</td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
