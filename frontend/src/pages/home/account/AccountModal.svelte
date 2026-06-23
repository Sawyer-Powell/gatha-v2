<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import Modal from "$lib/design-system/Modal.svelte";
    import { X } from "phosphor-svelte";
    import AccountBillingPanel from "./AccountBillingPanel.svelte";
    import AccountContributePanel from "./AccountContributePanel.svelte";
    import AccountOrganizationPanel from "./AccountOrganizationPanel.svelte";
    import AccountProfilePanel from "./AccountProfilePanel.svelte";
    import AccountTabList from "./AccountTabList.svelte";
    import {
        billing,
        GEMINI_TRANSCRIPTION_COST_PER_MINUTE,
        organization,
        user,
        type AccountTab,
        type BillingTab,
        type OrgMember,
    } from "../homeModel";
    import {
        account_modal,
        account_modal_body,
        account_modal_header,
        account_modal_title,
    } from "./account.css";

    /*
     * Future WASM boundary:
     * - WASM-owned state: profile, organization, members, billing, selected billing
     *   records, and contribution checkout state.
     * - WASM-driven callbacks: profile/org edits, avatar/logo updates, member
     *   actions, opening a transcription from billing, and checkout creation.
     * - Local UI state only: modal focus/DOM mechanics owned by Modal itself.
     */
    let {
        open,
        accountName,
        organizationName,
        accountTab,
        billingTab,
        contributionAmount,
        organizationMembers,
        accountAvatarUrl,
        organizationLogoUrl,
        onclose,
        onaccountName,
        onorganizationName,
        onaccountTab,
        onbillingTab,
        oncontributionAmount,
        onavatar,
        onlogo,
        onremoveMember,
        onmakeAdmin,
        onopenTranscription,
    }: {
        open: boolean;
        accountName: string;
        organizationName: string;
        accountTab: AccountTab;
        billingTab: BillingTab;
        contributionAmount: string;
        organizationMembers: OrgMember[];
        accountAvatarUrl: string;
        organizationLogoUrl: string;
        onclose: () => void;
        onaccountName: (name: string) => void;
        onorganizationName: (name: string) => void;
        onaccountTab: (tab: AccountTab) => void;
        onbillingTab: (tab: BillingTab) => void;
        oncontributionAmount: (amount: string) => void;
        onavatar: (files: FileList | null) => void;
        onlogo: (files: FileList | null) => void;
        onremoveMember: (email: string) => void;
        onmakeAdmin: (email: string) => void;
        onopenTranscription: (title: string) => void;
    } = $props();

    const contributionEstimateMinutes = $derived.by(() =>
        Math.floor(Math.max(0, Number.parseFloat(contributionAmount) || 0) / GEMINI_TRANSCRIPTION_COST_PER_MINUTE),
    );

    function accountTitle(tab: AccountTab) {
        return {
            profile: "Profile",
            organization: "Organization",
            billing: "Billing",
            contribute: "Contribute",
        }[tab];
    }

    function formatMinuteEstimate(minutes: number) {
        if (minutes < 60) return `${minutes.toLocaleString()} min`;
        return `${minutes.toLocaleString()} min / ${Math.round(minutes / 60).toLocaleString()} hr`;
    }
</script>

<Modal
    {open}
    classname={account_modal}
    ariaLabelledby="account-modal-title"
    {onclose}
>
    <AccountTabList value={accountTab} onchange={onaccountTab} />
    <section class={account_modal_body}>
        <div class={account_modal_header}>
            <h2 id="account-modal-title" class={account_modal_title}>
                {accountTitle(accountTab)}
            </h2>
            <Button variant="ghost" shape="circle" ariaLabel="Close account settings" onclick={onclose}>
                <X size={18} />
            </Button>
        </div>

        {#if accountTab === "profile"}
            <AccountProfilePanel
                name={accountName}
                email={user.email}
                role={user.role}
                avatarUrl={accountAvatarUrl}
                onname={onaccountName}
                onavatar={onavatar}
            />
        {:else if accountTab === "organization"}
            <AccountOrganizationPanel
                name={organizationName}
                logo={organization.logo}
                logoUrl={organizationLogoUrl}
                members={organizationMembers}
                avatarUrl={accountAvatarUrl}
                onname={onorganizationName}
                onlogo={onlogo}
                onremove={onremoveMember}
                onmakeAdmin={onmakeAdmin}
            />
        {:else if accountTab === "billing"}
            <AccountBillingPanel
                tab={billingTab}
                predicted={billing.predicted}
                actual={billing.actual}
                transcriptions={billing.transcriptions}
                transactions={billing.transactions}
                ontab={onbillingTab}
                onopenTranscription={onopenTranscription}
            />
        {:else}
            <AccountContributePanel
                {organizationName}
                {contributionAmount}
                estimatedMinutes={contributionEstimateMinutes}
                {formatMinuteEstimate}
                oncontributionAmount={oncontributionAmount}
            />
        {/if}
    </section>
</Modal>
