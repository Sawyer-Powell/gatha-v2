<script lang="ts">
    import DropdownMenu from "$lib/design-system/DropdownMenu.svelte";
    import FileUploadButton from "$lib/design-system/FileUploadButton.svelte";
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import { EnvelopeSimple, ShieldCheck, UserMinus } from "phosphor-svelte";
    import AccountIdentityRow from "./AccountIdentityRow.svelte";
    import type { OrgMember } from "../homeModel";
    import {
        account_billing_grid,
        account_member_options,
        account_org_logo_button,
        account_org_logo_image,
    } from "./account.css";

    let {
        name,
        logo,
        logoUrl,
        members,
        avatarUrl,
        onname,
        onlogo,
        onremove,
        onmakeAdmin,
    }: {
        name: string;
        logo: string;
        logoUrl: string;
        members: OrgMember[];
        avatarUrl: string;
        onname: (name: string) => void;
        onlogo: (files: FileList | null) => void;
        onremove: (email: string) => void;
        onmakeAdmin: (email: string) => void;
    } = $props();

</script>

<AccountIdentityRow
    {name}
    subtitle={`${members.length} members`}
    editable
    ariaLabel="Edit organization name"
    placeholder="Organization name"
    {onname}
>
    {#snippet media()}
        <FileUploadButton
            classname={account_org_logo_button}
            ariaLabel="Edit organization logo"
            onfiles={onlogo}
        >
            {#if logoUrl}
                <img class={account_org_logo_image} src={logoUrl} alt="" />
            {:else}
                {logo}
            {/if}
        </FileUploadButton>
    {/snippet}
</AccountIdentityRow>
<div class={account_billing_grid}>
    {#each members as member}
        <AccountIdentityRow
            name={member.name}
            subtitle={member.email}
            role={member.role}
        >
            {#snippet media()}
                <ProfilePicture
                    name={member.name}
                    imageUrl={member.current ? avatarUrl : ""}
                />
            {/snippet}
            {#snippet actions()}
                {#if !member.current && member.role !== "admin"}
                    <span class={account_member_options}>
                        <DropdownMenu
                            ariaLabel={`Open options for ${member.name}`}
                            align="end"
                            items={[
                                {
                                    label: "Remove user",
                                    icon: UserMinus,
                                    onclick: () => onremove(member.email),
                                },
                                {
                                    label: "Send reset password email",
                                    icon: EnvelopeSimple,
                                },
                                {
                                    label: "Make admin",
                                    icon: ShieldCheck,
                                    onclick: () => onmakeAdmin(member.email),
                                },
                            ]}
                        />
                    </span>
                {/if}
            {/snippet}
        </AccountIdentityRow>
    {/each}
</div>
