<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import FileUploadButton from "$lib/design-system/FileUploadButton.svelte";
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import AccountIdentityRow from "./AccountIdentityRow.svelte";
    import type { AccountRole } from "../homeModel";
    import {
        account_avatar_button,
        account_profile_actions,
    } from "./account.css";

    let {
        name,
        email,
        role,
        avatarUrl,
        onname,
        onavatar,
    }: {
        name: string;
        email: string;
        role: AccountRole;
        avatarUrl: string;
        onname: (name: string) => void;
        onavatar: (files: FileList | null) => void;
    } = $props();

</script>

<AccountIdentityRow
    {name}
    subtitle={email}
    {role}
    editable
    ariaLabel="Edit profile name"
    placeholder="Your name"
    {onname}
>
    {#snippet media()}
        <FileUploadButton
            classname={account_avatar_button}
            ariaLabel="Edit profile picture"
            onfiles={onavatar}
        >
            <ProfilePicture {name} imageUrl={avatarUrl} />
        </FileUploadButton>
    {/snippet}
</AccountIdentityRow>
<div class={account_profile_actions}>
    <Button variant="secondary" onclick={() => undefined}>Reset password</Button>
</div>
