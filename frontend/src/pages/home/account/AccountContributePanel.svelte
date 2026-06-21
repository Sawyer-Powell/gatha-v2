<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import Input from "$lib/design-system/Input.svelte";
    import AccountMetric from "./AccountMetric.svelte";
    import {
        account_billing_grid,
        account_contribution_panel,
        account_profile_text,
        account_section,
        account_section_title,
    } from "./account.css";

    let {
        organizationName,
        contributionAmount = $bindable(""),
        estimatedMinutes,
        formatMinuteEstimate,
    }: {
        organizationName: string;
        contributionAmount?: string;
        estimatedMinutes: number;
        formatMinuteEstimate: (minutes: number) => string;
    } = $props();
</script>

<div class={account_contribution_panel}>
    <div class={account_section}>
        <div>
            <h3 class={account_section_title}>Contribute to {organizationName}</h3>
            <p class={account_profile_text}>Choose an amount here. Payment details will happen in Stripe Checkout.</p>
        </div>
    </div>
    <div class={account_billing_grid}>
        {#each ["25", "50", "100", "250"] as amount}
            <Button
                variant="ghost"
                shape="pill"
                pressed={contributionAmount === amount}
                onclick={() => (contributionAmount = amount)}
            >
                ${amount}
            </Button>
        {/each}
    </div>
    <Input
        size="lg"
        value={contributionAmount}
        placeholder="Amount in USD"
        ariaLabel="Contribution amount in USD"
        oninput={(value) => (contributionAmount = value.replace(/[^\d.]/g, ""))}
    />
    <AccountMetric
        label="Estimated transcription time"
        value={formatMinuteEstimate(estimatedMinutes)}
        description="Assumes Gemini 3.1 Pro transcription at $2 per hour."
    />
    <Button variant="primary" onclick={() => undefined}>Continue to Stripe</Button>
    <p class={account_profile_text}>
        Later this button creates a Checkout Session and redirects to Stripe; successful payments return here and update the org balance.
    </p>
</div>
