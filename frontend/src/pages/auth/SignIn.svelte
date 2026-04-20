<script lang="ts">
    import Logo from "$lib/design-system/Logo.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import Card from "$lib/design-system/Card.svelte";
    import Input from "$lib/design-system/Input.svelte";
    import Button from "$lib/design-system/Button.svelte";
    import Spacer from "$lib/design-system/Spacer.svelte";
    import Link from "$lib/design-system/typography/Link.svelte";
    import ScrollingText from "$lib/pages/auth/ScrollingText.svelte";
    import { EnvelopeIcon, LockIcon } from "phosphor-svelte";
    import { dispatch, getStore } from "$lib/store.svelte";

    const store = $derived(getStore());
    const page = $derived(
        typeof store.session.page === "object" && "SignIn" in store.session.page
            ? store.session.page.SignIn
            : null,
    );

    function handleSignIn() {
        dispatch({ Session: "SignIn" });
    }

    function handleRegister() {
        dispatch({ Session: "Register" });
    }

    function updateEmail(value: string) {
        dispatch({ Session: { Auth: { UpdateEmail: value } } });
    }

    function updatePassword(value: string) {
        dispatch({ Session: { Auth: { UpdatePassword: value } } });
    }
</script>

<div class="page">
    <ScrollingText />

    <div class="content">
        <VStack gap="md" align="center">
            <Spacer size="xl" />
            <Logo />
            <Spacer size="sm" />
            <Card padding="lg">
                <VStack gap="md">
                    <Input
                        placeholder="Email"
                        type="email"
                        icon={EnvelopeIcon}
                        value={page?.email ?? ""}
                        oninput={updateEmail}
                    />
                    <VStack gap="xs">
                        <HStack justify="end">
                            <Link href="#/forgot-password" size="xs"
                                >Forgot password?</Link
                            >
                        </HStack>
                        <Input
                            placeholder="Password"
                            type="password"
                            icon={LockIcon}
                            value={page?.password ?? ""}
                            oninput={updatePassword}
                        />
                    </VStack>
                    <Spacer size="sm" />
                    <HStack gap="sm" justify="center">
                        <Button loading={page?.status === "Loading"} onclick={handleSignIn}
                            >Sign in</Button
                        >
                        <Button
                            variant="ghost"
                            loading={page?.status === "Loading"}
                            onclick={handleRegister}>Register</Button
                        >
                    </HStack>
                </VStack>
            </Card>
        </VStack>
    </div>
</div>

<style>
    .page {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
    }

    .content {
        position: relative;
        z-index: 1;
    }
</style>
